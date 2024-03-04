from bs4 import BeautifulSoup


def build_nested_dl(tags, content=None, soup=None):
    if not tags:
        return None

    if soup is None:
        soup = BeautifulSoup("<dl></dl>", "html.parser")

    root_dl = soup.find("dl")
    parent = root_dl

    for index, tag in enumerate(tags):
        if parent is None:
            parent = soup.new_tag("dl")
            root_dl.append(parent)

        child = None
        wrapper = None

        children = parent.findChildren(tag, recursive=False) if tag in ["dl", "dd"] else None

        if children:
            child = children[-1]
        else:
            children = parent.findChildren("dl", recursive=False)
            if children:
                child = children[-1]

        if index == len(tags) - 1:
            new_tag = soup.new_tag(tag)
            if content:
                content_soup = BeautifulSoup(content, "html.parser")
                new_tag.append(content_soup)
            parent.append(new_tag)
            parent = new_tag
        elif child:
            wrapper = children[0] if (children := child.findChildren("dl", recursive=False)) else None

            if not wrapper:
                wrapper = soup.new_tag("dl")
                child.append(wrapper)

            parent = wrapper

    return soup
