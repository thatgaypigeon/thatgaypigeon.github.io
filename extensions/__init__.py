esc_seq = r"\\"

word_strict = r"(?:[a-zA-Z\d\-\_]+)"
word = r"(?:([a-zA-Z\d-\_\:\;\=\,\.\#]|\\\")+)"
escape_quotes = r"\"(\\.|[^\"])*\""
word_or_quotes = r"(?<=\")[^\"]*(?=\")|\w+"
key_value = r"([^=\s]+)\s*=\s*\"?((?:\\\"|[^\"])*?)\"?"


block_types: dict[str, dict[str, str]] = {
    "/": {"class": "block", "title": "Information"},
    "&": {"class": "block block-info", "title": "Information"},
    # "*": {"class": "block block-", "title": ""},
    # "-": {"class": "block block-", "title": ""},
    # "=": {"class": "block block-", "title": ""},
    "+": {"class": "block block-note", "title": "Note"},
    "?": {"class": "block block-help", "title": "Help"},
    "!": {"class": "block block-warn", "title": "Warning"},
}


class REGEX:
    attr: str = r"\{\s*:(.*?)\s*\}"
    badge: str = r"\[\s*:(.*?)(?:(?:\ +)(.*?))?\s*\]"
    block: str = r"((" + "|".join("\\" + t for t in block_types.keys()) + r")\4\4)\s*([^\n]+)?\n(.+)"
    code_ref: str = r":(" + word_strict + r"):`(.*?)(?:\|(.*?))?`"
    dl: str = r"(?:^|\n)(( *)([:;]+)( *)(.*))"
    emoji: str = r":(" + word_strict + r"):"
    hatnote: str = r"!>>( *)(.*)"
    tone: str = r"\{\s*\/(.*?)\s*\}"
    tooltip: str = r"\{\s*\?(.*?)\s*\}"
    template: str = r"\{\{\s*(.*)\s*\}\}"
    url: str = r"\[([^\[\]]*)\]\((.*?)\)"
    wikilink: str = r"\[\[([^\|\#\n\r]*?)(?:#([^\|\n\r]*?))?(?:\s*\|\s*(.*?))?\]\]"


quotes: list[str] = ['"', "'"]

pigeon_docs_dir = "/projects/pigeon/docs"

mermaid_input_file = "_/.mermaid/in.mmd"
mermaid_output_file = "_/.mermaid/out.svg"
mermaid_config = "extensions/config/.mermaidrc.json"

badge_type_map: dict[str, dict[str, str]] = {
    "array": {
        "icon": "ph-brackets-square",
        "name": "Array",
    },
    "any": {
        "icon": "ph-dots-three",
        "name": "Any",
    },
    "bool": {
        "icon": "ph-code",
        "name": "Boolean",
    },
    "frac": {
        "icon": "ph-percent",
        "name": "Fraction",
    },
    "function": {
        "icon": "ph-function",
        "name": "Function",
    },
    "generator": {
        "icon": "ph-brackets-round",
        "name": "Generator",
    },
    "int": {
        "icon": "ph-number-one",
        "name": "Integer",
    },
    "none": {
        "icon": "ph-selection",
        "name": "None",
    },
    "number": {
        "icon": "ph-hash",
        "name": "Number",
    },
    "object": {
        "icon": "ph-brackets-curly",
        "name": "Object",
    },
    "str": {
        "icon": "ph-quotes",
        "name": "String",
    },
}

badge_prefix_map: dict[str, dict[str, str]] = {
    "param": {"tooltip": "Parameter"},
    "returns": {"tooltip": "Return type"},
    "type": {"tooltip": "Type"},
}

badge_map: dict[str, dict[str, str]] = {
    "builtin": {"icon": "ph-hammer", "tooltip": "Built-in method", "doc_dir": "builtins"},
    "class_method": {"icon": "ph-gear", "tooltip": "Class method"},
    "constant": {"icon": "ph-barricade", "content": "Constant"},
    "default": {"icon": "ph-checks", "tooltip": "Default value"},
    "deprecated": {
        "icon": "ph-trash",
        "tooltip": "Deprecated",
        "type": "error",
    },
    "destructive": {
        "icon": "ph-warning-octagon",
        "tooltip": "Destructive",
        "type": "warning",
    },
    "experimental": {
        "icon": "ph-flask",
        "tooltip": "Experimental",
        "type": "info",
    },
    "immutable": {"icon": "ph-pencil-slash", "content": "Immutable"},
    "instance_method": {"icon": "ph-note-pencil", "tooltip": "Instance method"},
    "new": {"icon": "ph-confetti", "tooltip": "New!", "type": "success"},
    "optional": {"icon": "ph-seal-question", "content": "Optional", "tooltip": "This parameter is optional"},
    "property": {"icon": "ph-check", "tooltip": "Property"},
    "pseudo_type": {
        "icon": "ph-sparkle",
        "type": "info",
        "content": "Pseudo-type",
    },
    "required": {"icon": "ph-seal-warning", "content": "Required", "tooltip": "This parameter is required"},
    "unassignable": {
        "icon": "ph-prohibit",
        "tooltip": "Cannot be assigned",
        "type": "warning",
        "content": "Unassignable",
    },
    "untypable": {
        "icon": "ph-prohibit",
        "tooltip": "Not supported in type annotations",
        "type": "warning",
        "content": "Untypable",
    },
    "version": {
        "class": "badge-version",
        "icon": "ph-tag",
        "tooltip": "Version added",
        "content": "[{0}](/projects/pigeon/releases/v{0})",
    },
}

badge_map.setdefault("method", badge_map.get("builtin"))

code_ref_map: dict[str, str] = {
    "true": "boolean/true",
    "false": "boolean/false",
    "int": "integer",
    "frac": "fraction",
    "str": "string",
}

emoji_map: dict[str, str] = {"check": "white_check_mark", "cross": "x"}

base_template_path = "src/_static/templates/"

wiki_template_wrapper = "wiki-template-wrapper"
