from pygments.lexers.markup import MarkdownLexer
from pygments.token import Comment, Generic, Name, Number, Operator, String, Text

from extensions.utils.pygments import CustomTokens

tokens: dict[str, str] = {
    "Generic": "g",
}

CustomTokens.add_tokens(
    group="PigeonMd", *[(name, code) for name, code in tokens.items()]
)

Tokens = CustomTokens.PigeonMd


class PigeonMarkdownLexer(MarkdownLexer):
    name = "Pigeon Markdown"
    aliases = ["pigeon-md"]
    filenames = ["*.pigeonmd", "*.pgnmd"]

    tokens = {
        "root": [
            (r"\s+", Text),
            (r"#.*$", Comment),
            (r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", Name),
            (r'"[^"]*"', String),
            (r"\d+", Number),
            (r"[+\-*/]", Operator),
            (r".", Generic),
        ]
    }


__all__ = ["PigeonMarkdownLexer"]
