from extensions.lexers.files import FilesLexer
from extensions.lexers.pigeon import PigeonLexer
from extensions.lexers.pigeonmd import PigeonMarkdownLexer
from extensions.lexers.regex import RegexLexer

lexers = {
    "pigeon": PigeonLexer(),
    "pigeon-md": PigeonMarkdownLexer(),
    "regex": RegexLexer(),
    "files": FilesLexer(),
}

lexer_match = (
    r"```(?:\b("
    + "|".join(lexers.keys())
    + r")(?=[ \|\n\r]))\s*(?:\|\s*(.*?))?\s*(\{\:[^\n\r]*\})?$(.*?)```"
)

lexer_inline_match = (
    r"`#!(?:\b("
    + "|".join(lexers.keys())
    + r"))\s*(?:\|\s*(.*?))?\s*(\{\:[^\n\r]*\})?(.*?)`"
)
