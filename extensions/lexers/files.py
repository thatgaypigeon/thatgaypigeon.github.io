from pygments.lexer import RegexLexer, bygroups
from pygments.token import Token

from extensions.utils.pygments import CustomTokens

tokens: dict[str, str] = {
    # "Indent": "i",
}

CustomTokens.add_tokens(group="Files", *[(name, code) for name, code in tokens.items()])

# Files = CustomTokens.Files


class FilesLexer(RegexLexer):
    name = "Files"
    aliases = ["files"]
    filenames = [""]

    tokens = {
        "root": [
            (
                r"^(\s*)(-)(\s)",
                bygroups(
                    Token.Text.Whitespace,
                    Token.Punctuation.Marker,
                    Token.Text.Whitespace,
                ),
            ),
            (r"\.", Token.Punctuation),
            (r"\w+", Token.Name),
            (r".", Token.Generic),
        ]
    }


__all__ = ["FilesLexer"]
