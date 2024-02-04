import re

from markdown.extensions import Extension
from markdown.treeprocessors import Treeprocessor


class ToneTreeProcessor(Treeprocessor):
    def run(self, root):
        for elem in root.iter("*"):
            if elem.text is not None:
                match = re.search(r"\{\s*\/(.*?)\s*\}", elem.text)
                if match:
                    matched_text = match.group(1)
                    elem.set("tone", matched_text)
                    elem.text = re.sub(
                        r"\{\s*\/" + re.escape(matched_text) + r"\s*\}", "", elem.text
                    ).strip()


class ToneExtension(Extension):
    def extendMarkdown(self, md):
        md.treeprocessors.register(ToneTreeProcessor(), "tone_tree_processor", 175)


def makeExtension(*args, **kwargs):
    return ToneExtension(*args, **kwargs)
