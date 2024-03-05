import logging
import os
import re

from bs4 import BeautifulSoup, Tag
from wikitextprocessor import WikiNode, Wtp
from wikitextprocessor.parser import NodeKind

from extensions import wiki_template_wrapper
from extensions.pigeon import process_markdown
from extensions.utils import lchop, list_files, rchop

logging.basicConfig(level=logging.ERROR)
logging.getLogger("wikitextprocessor").setLevel(logging.ERROR)


def get_content_model(page) -> str | None:
    if page.endswith(".css"):
        return "css"
    elif page.endswith(".js"):
        return "javascript"
    elif page.endswith(".json"):
        return "json"
    elif page.endswith(".lua"):
        return "Scribunto"

    return None


class Namespace:
    def __init__(
        self,
        id: int | None,
        name: str,
        prefix: str = None,
        pages_dir: str = None,
        pages_ext: str = None,
        content_model: str = "wikitext",
        ignore=False,
    ) -> None:
        self.id: int | None = id
        self.name: str = name
        self.prefix: str = prefix if prefix is not None else self.name
        self.prefixc: str = self.prefix + ":" if self.prefix else self.prefix
        self.pages_dir: str = (
            pages_dir if pages_dir is not None else os.path.join("src/_static/wiki/", self.name.lower())
        )
        self.pages_ext: str = f".{pages_ext}" if pages_ext is not None else ""
        self.content_model: str = content_model
        self.ignore = ignore

        self.pages: list[str] = list_files(self.pages_dir)

    def pathify(self, page_name: str, ext: bool = True):
        page_title = (page_name + self.pages_ext) if ext else page_name
        return os.path.join(self.pages_dir, page_title)

    def depathify(self, page_name: str):
        return rchop(lchop(page_name, self.pages_dir + os.sep), self.pages_ext).replace(os.sep, "/")


NS_MAIN = Namespace(id=0, name="(main)", prefix="", pages_dir="src/wiki/", pages_ext="md")
NS_FILE = Namespace(id=6, name="File", ignore=True)
# NS_MEDIAWIKI = Namespace(id=8, name="MediaWiki")
NS_TEMPLATE = Namespace(id=10, name="Template")
# NS_HELP = Namespace(id=12, name="Help")
# NS_CATEGORY = Namespace(id=14, name="Category")
NS_MODULE = Namespace(id=828, name="Module", pages_ext="lua", content_model="Scribunto")

NS_TEMPLATE_STYLES = Namespace(id=None, name="TemplateStyles")


namespaces: list[Namespace] = [
    NS_MAIN,
    NS_FILE,
    # NS_MEDIAWIKI,
    NS_TEMPLATE,
    # NS_HELP,
    # NS_CATEGORY,
    NS_MODULE,
    NS_TEMPLATE_STYLES,
]

EXTRA_HTML_TAGS: dict[str, dict[str, list[str]]] = {
    "title": {"parents": ["infobox"], "content": ["phrasing"]},
    "default": {"parents": ["title", "caption"], "content": ["phrasing"]},
    "image": {"parents": ["infobox"], "content": ["phrasing"]},
    "figure": {"parents": ["infobox"], "content": ["phrasing"]},
    "figcaption": {"parents": ["infobox"], "content": ["phrasing"]},
    "infobox": {"parents": ["phrasing"], "content": ["phrasing"]},
    "caption": {"parents": ["image"], "content": ["phrasing"]},
    "source": {"parents": ["phrasing"], "content": ["phrasing"]},
    "group": {"parents": ["infobox"], "content": ["phrasing"]},
    "header": {"parents": ["group"], "content": ["phrasing"]},
    "data": {"parents": ["infobox", "group"], "content": ["phrasing"]},
    "label": {"parents": ["data"], "content": ["phrasing"]},
}


class Wtp_(Wtp):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    # Suppress debugs and warnings
    def debug(self, *args, **kwargs) -> None:
        return None

    def warning(self, *args, **kwargs) -> None:
        return None


def init_wtp() -> Wtp_:
    wtp = Wtp_(project="pigeonwiki")

    for namespace in filter(
        lambda ns: ns.id is not None and ns.id >= 0 and not ns.ignore,
        namespaces,
    ):
        for page in namespace.pages:
            name = namespace.depathify(page)
            content_model: str = get_content_model(page) or namespace.content_model

            with open(page, "r", encoding="utf-8") as f:
                contents = f.read()
                if redirect := re.search(r"^#REDIRECT \[\[(.*?)\]\]", contents):
                    wtp.add_page(
                        name,
                        namespace.id,
                        contents,
                        redirect_to=redirect.group(1),
                        model=content_model,
                    )
                else:
                    wtp.add_page(name, namespace.id, contents, model=content_model)

    wtp.allowed_html_tags = {**wtp.allowed_html_tags, **EXTRA_HTML_TAGS}

    return wtp


def parse_page(wtp: Wtp, page_name: str) -> str:
    def fix_wiki_links(node: WikiNode) -> str:
        nodes = []

        if not node.children:
            return wtp.node_to_html(node)

        for child in node.children:
            if isinstance(child, WikiNode) and child.kind == NodeKind.HTML and child.sarg == "a":
                child = f'<a href="{child.attrs.get("href", "")}">{"".join(wtp.node_to_html(n) for n in child.children)}</a>'
            elif isinstance(child, WikiNode):
                child = f"<{child.sarg}>{fix_wiki_links(child)}</{child.sarg}>"

            nodes.append(child)

        return "".join(nodes)

    with open(NS_MAIN.pathify(page_name, ext=False), "r", encoding="utf-8") as f:
        html = []
        template_style_sources = set()
        meta = False

        contents = f.read()

        wtp.start_page(NS_MAIN.depathify(page_name))

        root: WikiNode = wtp.parse(process_markdown(contents))

        for node in root.children:
            if isinstance(node, WikiNode) and node.loc == 1 and wtp.node_to_html(node) == "<hr>":
                meta = True
                continue

            if meta:
                if isinstance(node, WikiNode) and wtp.node_to_html(node) == "<hr>":
                    meta = False
                continue

            # print(index, node, node.kind if isinstance(node, WikiNode) else None, node.largs if isinstance(node, WikiNode) else None)
            # process_markdown optionally remove wrapped "<p>" tag

            if (
                isinstance(node, WikiNode)
                and isinstance(node.children[0], WikiNode)
                and node.children[0].kind == NodeKind.TEMPLATE
            ):
                node = node.children[0]

            if isinstance(node, WikiNode) and node.largs and node.largs[0][0].strip().endswith("infobox"):
                # template_name = node.largs[0][0].strip()

                args = {
                    arg[0].split("=")[0].strip(): "".join(
                        ["=".join(string.strip() for string in arg[0].split("=")[1:])]
                        + [
                            (
                                arg_item.largs[0][0]
                                if isinstance(arg_item, WikiNode) and arg_item.kind == NodeKind.URL
                                else wtp.node_to_html(arg_item)
                                if isinstance(arg_item, WikiNode)
                                else wtp.node_to_html(wtp.parse(arg_item))
                            )
                            for arg_item in arg[1:]
                        ]
                    ).strip()
                    for arg in node.largs[1:]
                }

                soup = BeautifulSoup(wtp.node_to_html(node), features="html.parser")

                infobox: Tag = soup.find("infobox")

                filtered_elements = filter(
                    lambda element: isinstance(element, Tag) and element.attrs.get("source", None) is not None,
                    infobox.descendants,
                )

                elements_to_extract = set()
                elements_to_replace = set()

                for element in filtered_elements:
                    source: str = element.attrs.get("source")
                    default: Tag = element.find("default", recursive=False)
                    if source not in args.keys():
                        if not default:
                            elements_to_extract.add(element)
                            continue

                        default.string = wtp.expand(element.text)
                        default.unwrap()
                        del element.attrs["source"]
                    else:
                        if element.name == "data":
                            new_div: Tag = soup.new_tag("div", attrs={"class": "infobox-data"})

                            new_label_wrapper: Tag = soup.new_tag("div", attrs={"class": "infobox-data-label"})
                            new_label: Tag = BeautifulSoup(
                                process_markdown(element.find("label").text),
                                features="html.parser",
                            )
                            if len(new_label.contents) == 1 and new_label.contents[0].name == "p":
                                new_label.contents[0].unwrap()
                            new_label_wrapper.insert(0, new_label)

                            new_value_wrapper: Tag = soup.new_tag("div", attrs={"class": "infobox-data-value"})
                            new_value: Tag = BeautifulSoup(
                                process_markdown(args.get(source)),
                                features="html.parser",
                            )
                            if len(new_value.contents) == 1 and new_value.contents[0].name == "p":
                                new_value.contents[0].unwrap()
                            new_value_wrapper.insert(0, new_value)

                            new_div.insert(0, new_label_wrapper)
                            new_div.insert(1, new_value_wrapper)

                            elements_to_replace.add((element, new_div))
                        elif element.name == "figure":
                            new_img = soup.new_tag(
                                "img",
                                attrs={"src": f"/_static/wiki/file/{args.get(source)}"},
                            )
                            element.insert(0, new_img)
                            element.attrs.setdefault("class", "infobox-image")
                            del element.attrs["source"]
                        elif element.name in ["figcaption"]:
                            new_value: Tag = soup.new_tag(element.name)
                            new_value.append(
                                BeautifulSoup(
                                    process_markdown(args.get(source)),
                                    features="html.parser",
                                ).contents[0]
                            )
                            elements_to_replace.add((element, new_value))
                        else:
                            new_value: Tag = soup.new_tag("div", attrs={"class": f"infobox-{element.name}"})
                            new_value.append(
                                BeautifulSoup(
                                    process_markdown(args.get(source)),
                                    features="html.parser",
                                )
                            )
                            elements_to_replace.add((element, new_value))

                for element in elements_to_extract:
                    element.extract()

                for element in elements_to_replace:
                    element[0].replace_with(element[1])

                for element in filter(
                    lambda el: isinstance(el, Tag)
                    and el.name
                    in [
                        "group",
                        "header",
                        # "figure",
                        # "figcaption",
                        "title",
                        "data",
                        "label",
                        "default",
                    ],
                    infobox.descendants,
                ):
                    element.attrs["class"] = f"infobox-{element.name}"
                    element.name = "div"

                infobox.name = "div"
                infobox.attrs.setdefault("class", "infobox")

                # print(infobox.prettify())

                node = f'<div class="{wiki_template_wrapper}">{str(soup)}</div>'

            elif isinstance(node, WikiNode):
                # print(node)

                node = fix_wiki_links(node)

                # print(node)

                # if node.kind == NodeKind.URL:
                #     node = wtp.node_to_html(node)
                # elif node.kind == NodeKind.TEMPLATE:
                #     node = f'<div class="{wiki_template_wrapper}">{(wtp.node_to_html(node))}</div>'
                # else:
                #     node = wtp.node_to_html(node)

            # print(node)

            node_soup = BeautifulSoup(node, features="html.parser")

            # print(node_soup.prettify())

            for styles in node_soup.find_all("templatestyles"):
                template_style_sources.add(
                    rchop(
                        lchop(styles.attrs.get("src", None), NS_TEMPLATE.prefixc),
                        "/styles.css",
                    )
                )
                styles.extract()

            node = process_markdown(str(node_soup))

            node = node.replace(r"{{PAGENAME}}", NS_MAIN.depathify(page_name))

            html.append(node)

    template_style_soup = BeautifulSoup('<div class="template-styles"></div>', features="html.parser")

    for source in filter(lambda source: source, template_style_sources):
        link: Tag = template_style_soup.new_tag(
            "link",
            attrs={
                "class": "template-styles",
                "href": f"/{os.path.join(lchop(NS_TEMPLATE_STYLES.pages_dir, "src/"), rchop(source, "/") + ".css").replace(os.sep, "/")}",
                "rel": "stylesheet",
                "type": "text/css",
            },
        )
        template_style_soup.append(link)

    wiki_styles: Tag = template_style_soup.new_tag(
        "link",
        attrs={
            "class": "template-styles",
            "href": "/_static/css/wiki.css",
            "rel": "stylesheet",
            "type": "text/css",
        },
    )
    template_style_soup.append(wiki_styles)

    html.insert(0, str(template_style_soup))

    text = "\n".join(html)

    return text
