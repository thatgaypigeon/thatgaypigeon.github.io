import re

from extensions import REGEX, word_strict
from extensions.utils import esc_quotes


def get_attrs(text):
    match = re.match(REGEX.attr, text)

    text_list = list(match.group(1))
    attrs = {}

    ids = re.findall(r"#(" + word_strict + r")", match.group(1))
    classes = re.findall(r"\.(" + word_strict + r")", match.group(1))
    tone_indicators = re.findall(r"(?<=/\")[^\"]*(?=\")|(?<=/)\w+", match.group(1))
    tooltips = re.findall(r"(?<=\?\")[^\"]*(?=\")|(?<=/)\w+", match.group(1))

    if ids:
        attrs["id"] = ids[-1]
    if tone_indicators:
        attrs["tone"] = ", ".join(tone_indicators)
    if tooltips:
        attrs["tooltip"] = tooltips[-1]

    for m in re.finditer(
        r"((" + word_strict + r")\s*=\s*(\"*\s*([^\"]*)\s*\"*)\s*)",
        match.group(1),
    ):
        key, value = esc_quotes(m.group(2)), esc_quotes(m.group(4))
        attrs[key] = [value] if key == "class" else value
        start, end = m.span()
        text_list[start:end] = [" "] * (end - start)

    if classes:
        attrs["class"] = " ".join(attrs.setdefault("class", []) + classes)

    return attrs
