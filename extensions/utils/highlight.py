import re
from typing import Any, Generator, Literal

from bs4 import BeautifulSoup, Tag
from pymdownx import highlight as pymdownx_highlight
from pymdownx.highlight import BlockHtmlFormatter

from extensions import REGEX, quotes
from extensions.lexers import lexer_inline_match, lexer_match, lexers
from extensions.utils import esc
from extensions.utils.attrs import get_attrs

code_index = 0

code_block_str = "C"
code_line_str = "-L"

code_inline_lines_spans_prefix = "_"


class PigeonFormatter(BlockHtmlFormatter):
    def __init__(self, *args, **kwargs) -> None:
        global code_index
        super().__init__(
            linenos=kwargs.pop("linenos", "inline"),
            *args,
            **kwargs,
            style="default",
            anchorlinenos=True,
            wrapcode=False,
        )

    def _wrap_inlinelinenos(self, inner) -> Generator:
        inner_lines = list(inner)
        num: int = self.linenostart or 0
        mw: int = len(str(len(inner_lines) + num - 1))

        for _, inner_line in inner_lines:
            line_num = f'<span linenum="{"%*d" % (mw, num)}"></span>'
            anchor_line_nums = self.lineanchors or self.linespans
            yield 1, f'<a href="#{anchor_line_nums}{num}">{line_num}</a>' + inner_line
            num += 1

    def _wrap_linespans(self, inner) -> Generator:
        s: int = self.linespans
        i: int = self.linenostart - 1
        for t, line in inner:
            if t:
                i += 1
                yield 1, f'<span id="{s}{i}">{line}</span>'
            else:
                yield 0, line

    def _wrap_pre(self, inner) -> Generator:
        style: list = []

        if self.prestyles:
            style.append(self.prestyles)

        if self.noclasses:
            style.append(self._pre_style)

        style: str = "; ".join(style)

        if self.filename and self.linenos != 1:
            yield 0, ('<span class="filename no-select">' + self.filename + "</span>")

        # the empty span here is to keep leading empty lines from being
        # ignored by HTML parsers
        yield 0, ("<pre" + (style and ' style="%s"' % style) + "><span></span>")
        yield from inner
        yield 0, "</pre>"


def replace_text(match, page=None, config={}) -> str:
    global code_index
    code_index += 1

    code_block_id: str = code_block_str + str(code_index)

    lexer: Any = lexers.get(match.group(1), None)
    if not lexer:
        return match.group(0)

    filename: str = lexer.name
    if match.group(2) and match.group(2) is not None:
        filename = match.group(2).strip()

    attrs: dict[str, str] = {}

    if match.group(3):
        attrs = get_attrs(re.match(esc(REGEX.attr), match.group(3)))

    css_class: str | None = attrs.get("class", None)
    attrs["class"] = set(["block-code", "lang-" + lexer.name.lower()])

    if css_class:
        attrs["class"].add(css_class)

    if filename.lower() == "definition":
        attrs["class"].add("definition")
    elif filename[0] in quotes and filename[-1] in quotes:
        filename = filename[1:-1]
    elif filename != lexer.name:
        attrs["class"].add("is-file")

    wrapper = BeautifulSoup(
        f'<div id="{code_block_id}" class="block-code-wrapper"></div>',
        features="html.parser",
    )

    soup = BeautifulSoup(
        pymdownx_highlight.highlight(
            match.group(4),
            lexer,
            PigeonFormatter(
                filename=filename,
                cssclass=" ".join(attrs.get("class")),
                linespans=code_block_str + str(code_index) + code_line_str,
            ),
        ),
        features="html.parser",
    )

    for el in soup.find_all("span", {"class": "special"}):
        child: Tag = soup.new_tag("span", attrs={"class": "\\"})
        child2: Tag = soup.new_tag("span", attrs={"class": "no-select"})
        child2.string = el.string
        el.string = ""
        el.append(child)
        el.append(child2)

    wrapper.contents[0].append(soup)

    code_anchor: Tag = soup.new_tag(
        "a",
        attrs={
            "class": " ".join([config["mdx_configs"]["toc"]["permalink_class"], "no-open"]),
            "href": f"#{code_block_id}",
        },
    )
    code_anchor.string = config["mdx_configs"]["toc"]["permalink"]
    wrapper.contents[0].contents[0].contents[0].append(code_anchor)

    return str(wrapper)


def replace_inline_text(match, page=None, config={}) -> str:
    lexer: Any = lexers.get(match.group(1), None)
    if not lexer:
        return match.group(0)

    attrs: dict[str, str] = {}

    if match.group(3):
        attrs = get_attrs(re.match(esc(REGEX.attr), match.group(3)))

    css_class: str | None = attrs.get("class", None)
    attrs["class"] = set(["block-code", "block-code-inline", "lang-" + lexer.name.lower()])

    if css_class:
        attrs["class"].add(css_class)

    soup = BeautifulSoup(
        pymdownx_highlight.highlight(
            match.group(4),
            lexer,
            PigeonFormatter(
                filename=None,
                linenos=False,
                cssclass=" ".join(attrs.get("class")),
                linespans=code_inline_lines_spans_prefix,
            ),
        ),
        features="html.parser",
    )

    # remove line ids for inline code spans
    for el in soup.find_all("span", {"id": f"{code_inline_lines_spans_prefix}1"}):
        el.attrs.pop("id", "")

    for el in soup.find_all("span", {"class": "special"}):
        child: Tag = soup.new_tag("span", attrs={"class": "\\"})
        child2: Tag = soup.new_tag("span", attrs={"class": "no-select"})
        child2.string = el.string
        el.string = ""
        el.append(child)
        el.append(child2)

    code: Tag = soup.contents[0].contents[0]
    code.name = "code"
    code.attrs.setdefault("class", " ".join(attrs.get("class")))

    return str(code).replace("\n", "").strip()


def pigeon_highlight(markdown: str, page=None, config={}) -> str:
    global code_index
    code_index = 0

    markdown = re.sub(
        lexer_match,
        lambda match: replace_text(match, page, config),
        markdown,
        flags=re.MULTILINE | re.DOTALL,
    )

    markdown = re.sub(
        lexer_inline_match,
        lambda match: replace_inline_text(match, page, config),
        markdown,
    )

    return markdown
