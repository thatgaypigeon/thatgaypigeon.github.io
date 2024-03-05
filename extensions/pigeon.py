import re
from typing import Callable, Literal
from xml.etree.ElementTree import Element

from bs4 import BeautifulSoup, Tag
from markdown import Markdown
from markdown.extensions import Extension
from markdown.treeprocessors import Treeprocessor

from extensions import REGEX, block_types, code_ref_map, emoji_map, esc_seq, pigeon_docs_dir, word_strict
from extensions.utils import maybe_esc, pigeon_md, slugify
from extensions.utils.attrs import get_attrs
from extensions.utils.badge import create_badge
from extensions.utils.dl import build_nested_dl
from extensions.utils.highlight import pigeon_highlight


def process_markdown(markdown_content) -> str:
    md = Markdown(extensions=[PigeonExtension()])
    html_content: str = md.convert(markdown_content)
    soup = BeautifulSoup(html_content, "html.parser")
    return str(soup)


@pigeon_md(pattern=REGEX.attr)
def attr(match: re.Match, text: str, element: Element, *args, **kwargs) -> Literal[""]:
    attrs: dict = get_attrs(match.group(1))

    target: Element = element
    # if re.search(own_line(pattern), text) and parent and not_root(parent):
    #     target = parent

    for key, value in attrs.items():
        target.set(key, value)

    return ""


@pigeon_md(pattern=REGEX.badge)
def badge(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    return create_badge(match.group(3), match.group(4))


@pigeon_md(pattern=REGEX.block, flags=re.DOTALL)
def block(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    title: Element = element.makeelement("div", {"class": "title"})
    title.text = match.group(5) if match.group(5) else block_types.get(match.group(4), {}).get("title", "Information")

    content: Element = element.makeelement("div", {"class": "content"})
    content.text = text.replace(
        match.group(1),
        "\n".join([line.strip() for line in match.group(6).splitlines()]),
    )

    element.tag = "div"
    element.set("class", block_types.get(match.group(4), {}).get("class", "block"))
    element.append(title)
    element.append(content)

    return ""


@pigeon_md(pattern=REGEX.code_ref)
def code_ref(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    ref_type: str = match.group(3)
    ref_value: str = match.group(4)
    code: str = match.group(5) or ref_value
    link: str = f"#{ref_value}"

    if ref_type == "class":
        link = f"{pigeon_docs_dir}/types/" + code_ref_map.get(ref_value, ref_value)

    elif ref_type in ["method", "builtin"]:
        title: str = ref_value.split("(")[0]
        page: str = ref_value.split("(")[0].replace(".", "/")
        code_args: str = ("(" + "(".join(ref_value.split("(")[1:])) if ref_value.split("(")[1:] else ""

        link = f"{pigeon_docs_dir}/builtins/" + code_ref_map.get(page, page)
        code = title + code_args

    elif ref_type == "operator":
        link = f"{pigeon_docs_dir}/operators/" + code_ref_map.get(ref_value, ref_value)

    elif ref_type == "param":
        link = f"{pigeon_docs_dir}/types/" + code_ref_map.get(ref_value.split(".")[0], ref_value.split(".")[0])
        link += "/" + "/".join(ref_value.split(".")[1:-1])
        link += "#" + ref_value.split(".")[-1]
        code = ref_value.split(".")[-1]

    text = f"[`#!pigeon {code}`]({link})"

    return pigeon_highlight(text)


@pigeon_md(pattern=REGEX.emoji)
def emoji(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    if emoji_name := emoji_map.get(match.group(3)):
        return f":{emoji_name}:"
    else:
        return match.group(1)


@pigeon_md(pattern=REGEX.hatnote)
def hatnote(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    element.set("class", "hatnote")
    return match.group(4)


@pigeon_md(pattern=REGEX.tone)
def tone(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    element.set("tone", match.group(3))
    return ""


@pigeon_md(pattern=REGEX.tooltip)
def tooltip(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    element.set("tooltip", match.group(3))
    return ""


@pigeon_md(pattern=REGEX.url, code=False)
def url(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    page = match.group(4)
    page_name: str = page.split("#")[0]
    section: str = "#".join(page.split("#")[1:]) if len(page.split("#")) > 1 else None

    if page or section:
        display = (
            match.group(3)
            if match.group(3)
            else page_name.lstrip("./") + (f"\u00a0§\u00a0{section}" if section else "")
        )

        return f'<a href="{page_name}{('#' + section) if section else ''}">{display}</a>'


@pigeon_md(pattern=REGEX.url, code=True)
def url_code(match: re.Match, text: str, element: Element, *args, **kwargs) -> str:
    display = match.group(4)
    page = match.group(5)
    page_name: str = page.split("#")[0]
    section: str = "#".join(page.split("#")[1:]) if len(page.split("#")) > 1 else None

    if page or section:
        display = display or (page_name.lstrip("./") + (f"\u00a0§\u00a0{section}" if section else ""))

        return f'<a href="{page_name}{('#' + section) if section else ''}">`{display}`</a>'


@pigeon_md(pattern=REGEX.wikilink)
def wikilink(match: re.Match, text: str, element: Element, *args, **kwargs):
    page: str = match.group(3)
    section: str = match.group(4)
    display: str = match.group(5)

    if page or section:
        display = display if display else page.lstrip("./") + (f"\u00a0§\u00a0{section}" if section else "")

        if page:
            if page.startswith("/"):
                page = page.lstrip("/")
            else:
                page = "../" + page.lstrip("/")

        page = slugify(page)

        # print(page, section, display, match.groups())

        return f'<a href="{page}{('#' + section) if section else ''}">{display}</a>'


@pigeon_md(pattern=REGEX.wikilink, code=True)
def wikilink_code(match: re.Match, text: str, element: Element, *args, **kwargs):
    page: str = match.group(4)
    section: str = match.group(5)
    display: str = match.group(6)

    if page or section:
        display = display if display else page.lstrip("./") + (f"\u00a0§\u00a0{section}" if section else "")

        if page:
            if page.startswith("/"):
                page = page.lstrip("/")
            else:
                page = "../" + page.lstrip("/")

        page = slugify(page)

        return f'<a href="{page}{('#' + section) if section else ''}">`{display}`</a>'


block_funcs: list[Callable] = [block, hatnote]
inline_funcs: list[Callable] = [code_ref, emoji, attr, badge, tone, tooltip, url_code, url, wikilink_code, wikilink]


class PigeonProcessor(Treeprocessor):
    def run(self, root):
        parent_map = {c: p for p in root.iter() for c in p}

        def not_root(element) -> bool:
            return True and parent_map.get(element, None)

        for element in root.iter("*"):
            if element.text:
                text: str = element.text

                parent = parent_map.get(element, None)

                if text.startswith("#REDIRECT [["):
                    text = "\\#REDIRECT \\[\\["
                    continue

                for func in block_funcs + inline_funcs:
                    text = func(text, element)

                if text:
                    char_map = {
                        "---": "—",
                        "--": "–",
                        "&amp;": "&",
                        "&lt;": "<",
                        "&gt;": ">",
                    }

                    # Escape
                    for key, value in char_map.items():
                        text = text.replace(esc_seq + value, key)

                    if matches := re.findall(maybe_esc(REGEX.dl), text):
                        soup: Tag = None

                        for match in matches:
                            if not re.search(r"^:" + word_strict + ":$", match[0]):
                                # if match[0].strip().startswith(esc_seq):
                                #     text = match[1]

                                syntax_map: dict[str, str] = {";": "dt", ":": "dd"}

                                indent_str: str = match[4].strip().replace(" ", "")
                                indent_str = re.sub(r"(?<=;):+$", "", re.sub(r";+", ";", indent_str))

                                indent: list[str] = [syntax_map[i] for i in list(indent_str)]
                                content: str = match[6].strip()

                                soup = build_nested_dl(indent, content=content, soup=soup)

                        text = str(soup) if soup else ""

                    # Un-escape
                    for key, value in char_map.items():
                        text = text.replace(key, value)

                element.text = text


class PigeonExtension(Extension):
    def extendMarkdown(self, md):
        md.treeprocessors.register(PigeonProcessor(), "pigeon_processor", 9999)


def makeExtension(*args, **kwargs):
    return PigeonExtension(*args, **kwargs)
