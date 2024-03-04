from pygments.lexer import RegexLexer as _RegexLexer

from extensions.utils.pygments import CustomTokens

tokens: dict[str, str] = {
    "Special": "rgxs",
    "Anchor": "rgxa",
    "Meta": "rgxm",
    "Other": "rgxx",
    "Escape": "rgxe",
    "Quantifier": "rgxq",
    "Group": "rgxg",
    "Class": "rgxc",
    "Start": "rgxst",
    "End": "rgxnd",
    "Flag": "rgxf",
    "Operator": "rgxo",
    "Generic": "rgx",
}

CustomTokens.add_tokens(group="Regex", *[(name, code) for name, code in tokens.items()])

Tokens = CustomTokens.Regex


class RegexLexer(_RegexLexer):
    name = "Regex"
    aliases = ["regex"]
    filenames = [""]

    tokens = {
        "root": [
            (r"\\(n|r|t|0)", Tokens.Special),
            (r"\\(?:G|A|Z|z|b|B)|\^|\$", Tokens.Anchor),
            (r"\\(?:s|S|d|D|w|W|X|C|R|N|v|V|h|H|K|#)", Tokens.Meta),
            (r"\\.{1}", Tokens.Escape),
            (r"\?|\*|\+|\{(?:.*?)\}", Tokens.Quantifier),
            (r"\(|\)", Tokens.Group),
            (r"\[(.*?)\]", Tokens.Class),
            (r"^/", Tokens.Start),
            (r"(?<!\\)/", Tokens.End),
            (r"[gmixsuXUAJn]+$", Tokens.Flag),
            (r"\.|\|", Tokens.Operator),
            (r".", Tokens.Generic),
        ]
    }


__all__ = ["RegexLexer"]
