import subprocess

from bs4 import BeautifulSoup, Tag
from mkdocs.structure.pages import Page
from mkdocs.structure.toc import AnchorLink

from extensions import mermaid_config, mermaid_input_file, mermaid_output_file, wiki_template_wrapper
from extensions.pigeon import process_markdown
from extensions.utils import lchop, slugify
from extensions.utils.highlight import pigeon_highlight
from extensions.utils.wiki import init_wtp, parse_page

wtp = None


def on_pre_build(config):
    global wtp
    wtp = init_wtp()


def on_page_markdown(markdown: str, page: Page, config, files):
    if page.file.src_uri.startswith("wiki/"):
        markdown = parse_page(wtp, lchop(page.file.src_uri, "wiki/"))

    markdown = pigeon_highlight(markdown, page, config=config)

    return markdown


def on_page_content(html, page: Page, **kwargs):
    soup = BeautifulSoup(html, "html.parser")

    def set_custom_attr_recursive(toc_item: AnchorLink):
        element = soup.find(attrs={"id": toc_item.id})

        if element:
            if title := element.attrs.get("toc", None):
                title = slugify(title)
                toc_item.__setattr__("title", title)
                toc_item.__setattr__("id", title)
                element.attrs["id"] = title
                element.find("a", attrs={"class": "anchor"})["href"] = "#" + title
                element.attrs.pop("toc", None)

        for child in toc_item.children:
            set_custom_attr_recursive(child)

    for toc_item in page.toc.items:
        set_custom_attr_recursive(toc_item)

    return str(soup)


def on_post_page(html: str, page: Page, config):
    soup = BeautifulSoup(html, "html.parser")

    head: Tag = soup.find("head")
    main: Tag = soup.find("main")
    article: Tag = soup.find("article")

    for link in main.find_all("link"):
        head.append(link.extract())

    for div in main.find_all("div", attrs={"class": "template-styles"}):
        div.decompose()

    for template in main.find_all("div", attrs={"class": wiki_template_wrapper}):
        template.unwrap()

    for mermaid_src in main.find_all("div", attrs={"class": "mermaid"}):
        mermaid_src: Tag

        with open(mermaid_input_file, "w", encoding="utf-8") as f:
            f.write(mermaid_src.text)

        with open(mermaid_output_file, "w", encoding="utf-8") as f:
            f.write("")

        subprocess.run(
            ["mmdc", "-i", mermaid_input_file, "-o", mermaid_output_file, "-c", mermaid_config],
            shell=True,
            capture_output=True,
        )

        with open(mermaid_output_file, "r", encoding="utf-8") as f:
            mermaid = BeautifulSoup(f.read(), features="html.parser")

            svg = mermaid.find("svg")

            if svg:
                allowed_svg_attrs = [
                    "viewbox",
                    "xmlns",
                    "xmlns:xlink",
                    "role",
                    "aria-roledescription",
                ]

                for attr in filter(lambda attr: attr not in allowed_svg_attrs, svg.attrs.copy().keys()):
                    svg.attrs.pop(attr)

                svg.attrs.setdefault("width", svg.attrs.get("viewbox", "0 0 100% 0").split(" ")[2])
                svg.attrs.setdefault("height", svg.attrs.get("viewbox", "0 0 0 100%").split(" ")[3])

                for style in mermaid.find_all("style"):
                    style.decompose()

                for span in mermaid.find_all("span", attrs={"class": "nodeLabel"}):
                    span: Tag
                    processed_text = BeautifulSoup(process_markdown(span.string), features="html.parser")

                    span.clear()
                    span.append(processed_text)

                    if (p := span.find("p", recursive=False)) and len(span.contents) == 1:
                        p.unwrap()

                    span.name = "div"
                    classes = set(span.attrs.get("class", []))
                    classes.add("nodeLabel")
                    span.attrs.setdefault("class", list(classes))

                for element in svg.select("g.legend > rect"):
                    element.attrs.setdefault("rx", "var(--mermaid-legend-rect-border-radius, 0)")
                    element.attrs.setdefault("ry", "var(--mermaid-legend-rect-border-radius, 0)")

                for rect in svg.find_all("rect", attrs={"class": ["basic", "label-container"]}):
                    rect.attrs["rx"] = "var(--mermaid-label-rect-border-radius)"
                    rect.attrs["ry"] = "var(--mermaid-label-rect-border-radius)"

                wrapper: Tag = soup.new_tag("div", attrs={"class": "mermaid-wrapper"})
                wrapper.append(mermaid)

                mermaid_src.clear()
                mermaid_src.attrs.setdefault("class", []).extend(["no-select"])
                mermaid_src.append(wrapper)

        if not head.find("link", attrs={"id": "mermaid-styles"}):
            mermaid_styles = soup.new_tag(
                "link",
                attrs={
                    "id": "mermaid-styles",
                    "href": "/_static/css/mermaid.css",
                    "rel": "stylesheet",
                    "type": "text/css",
                },
            )
            head.append(mermaid_styles)

        for element in mermaid_src.descendants:
            if isinstance(element, Tag) and element.attrs.get("style", None):
                element.attrs.pop("style")

    return str(soup)
