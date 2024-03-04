from pygments.lexer import RegexLexer, bygroups, include, words
from pygments.token import Token

from extensions.utils.pygments import CustomTokens

tokens: dict[str, str | dict[str, str]] = {
    "Console": "cns special",
    "Meta": "mt special",
    "Dictionary": "dc",
    "Boolean": "bo",
}

CustomTokens.add_tokens(
    *[(name, code) for name, code in tokens.items()], group="Pigeon"
)

CustomTokens.add_tokens(("Special", "osp"), group="Operator")
CustomTokens.add_tokens(("Function", "nbf"), group="Name.Builtin")

Pigeon = CustomTokens.Pigeon


class PigeonLexer(RegexLexer):
    name = "Pigeon"
    url = "https://pigeon.uk.to/pigeon"
    aliases = ["pigeon", "pgn"]
    filenames = ["*.pigeon", "*.pgn"]

    tokens = {
        "root": [
            include("_console"),
            (r"\n", Token.Text.Whitespace),
            (
                r'^(\s*)([bru]{,2})("""(?:.|\n)*?""")',
                bygroups(Token.Whitespace, Token.String.Affix, Token.String.Doc),
            ),
            (
                r"^(\s*)([bru]{,2})('''(?:.|\n)*?''')",
                bygroups(Token.Whitespace, Token.String.Affix, Token.String.Doc),
            ),
            (r"^ *\((class|function|method|object)\) *", Pigeon.Meta),
            (r"\A#!.+$", Token.Comment.Hashbang),
            (r"#.*$", Token.Comment),
            (r"\\\n|\\|\s+", Token.Text),
            include("constructor"),
            include("keywords"),
            include("builtins"),
            include("assignment"),
            include("string"),
            (
                r"^(import|from)",
                Token.Keyword.Namespace,
                "import",
            ),
            (r"\/.*\/", Token.Literal.Regex),
            (r" +", Token.Text.Whitespace),
            (r".", Token.Generic),
        ],
        "_console": [
            (r"(?:^|[\n\r\f])> ", Pigeon.Console),
        ],
        "_operator": [
            (r"=>", Token.Operator.Special),
            (
                r"(->)(\ +)?(\w+)",
                bygroups(
                    Token.Operator.Special, Token.Text.Whitespace, Token.Keyword.Type
                ),
            ),
            (r"[\+\-\*\/\%\=\<\>]=?|!=", Token.Operator),
        ],
        "args": [
            (
                r"(\*{1,2})(\w+)",
                bygroups(
                    Token.Operator.Special,
                    Token.Name.Variable.Magic,
                ),
            ),
            include("assignment"),
            ("\)", Token.Operator, "#pop"),
        ],
        "array": [
            (r"\[", Token.Punctuation, "#push", "array"),
            (r",", Token.Punctuation),
            (r"]", Token.Punctuation, "#pop"),
        ],
        "assignment": [
            include("_console"),
            (
                r"(\w+)(\ +)?(?:(:)(\ +)?(\w+)(\ +)?)?(=(?!>))(\ +)?",
                bygroups(
                    Token.Name.Variable,
                    Token.Text.Whitespace,
                    Token.Punctuation,
                    Token.Text.Whitespace,
                    Token.Keyword.Type,
                    Token.Text.Whitespace,
                    Token.Operator,
                    Token.Text.Whitespace,
                ),
            ),
            (
                r"(\w+)(\ +)?(?:(:)(\ +)?(\w+)(\ +)?)",
                bygroups(
                    Token.Name.Variable,
                    Token.Text.Whitespace,
                    Token.Punctuation,
                    Token.Text.Whitespace,
                    Token.Keyword.Type,
                    Token.Text.Whitespace,
                ),
            ),
            include("object"),
            (r",", Token.Punctuation, "#pop", "assignment"),
        ],
        "builtins": [
            (
                words(
                    ("sum",),
                    prefix=r"(?<!\.)",
                    suffix=r"\b",
                ),
                Token.Name.Builtin,
            ),
        ],
        "const": [
            (
                words(
                    ("false", "infinity", "nan", "null", "true", "undefined"),
                    suffix=r"\b",
                ),
                Token.Keyword.Constant,
            ),
        ],
        "constructor": [
            include("_console"),
            (
                words(
                    (
                        "err",
                        "func",
                        "gen",
                        "obj",
                    ),
                    prefix=r"(?<!\.)",
                    suffix=r"(\ +)",
                ),
                bygroups(Token.Keyword.Reserved, Token.Text.Whitespace),
                "object",
            ),
        ],
        "import": [
            include("_console"),
            (r"\bimport\b", Token.Keyword.Namespace),
            (r"\bas\b", Token.Keyword),
            (r" +", Token.Text.Whitespace),
            (r"\.|\/", Token.Punctuation),
            (r"\w+", Token.Name.Namespace),
        ],
        "keywords": [
            (
                words(
                    ("and", "or", "not", "xor", "nand", "nor", "xnor"),
                    suffix=r"\b",
                ),
                Token.Operator.Word,
            ),
            (
                words(
                    ("as", "if", "else", "return", "with", "for", "in"),
                    suffix=r"\b",
                ),
                Token.Keyword,
            ),
            (
                words(
                    ("self",),
                    prefix=r"(?<!\.)",
                    suffix=r"\b",
                ),
                Token.Name.Builtin.Pseudo,
            ),
        ],
        "keyword_methods": [
            (
                words(
                    (
                        "all",
                        "any",
                        "count",
                        "combine",
                        "contains",
                        "filter",
                        "find",
                        "find_all",
                        "flatten",
                        "index",
                        "insert",
                        "lock",
                        "lock_type",
                        "iterate",
                        "join",
                        "map",
                        "pop",
                        "push",
                        "remove",
                        "reverse",
                        "sort",
                    ),
                    suffix=r"\b(?=\()",
                ),
                Token.Name.Builtin.Function,
            ),
        ],
        "keyword_properties": [
            (
                words(
                    ("length",),
                    suffix=r"\b",
                ),
                Token.Name.Builtin,
            ),
        ],
        "object": [
            include("_console"),
            (
                words(
                    (
                        "array",
                        "boolean",
                        "number",
                        "string",
                    ),
                    prefix=r"(?<!\.)",
                    suffix=r"\b",
                ),
                Token.Name.Builtin,
            ),
            include("array"),
            include("const"),
            (r"\(", Token.Punctuation, "args"),
            (r"\)", Token.Punctuation),
            (r":", Token.Punctuation, "#pop"),
            (r"\b_\b", Token.Name.Builtin.Pseudo),
            include("string"),
            (r"\b\d+\b", Token.Number),
            (r"\b\.\b", Token.Punctuation),
            include("_operator"),
            include("keyword_methods"),
            include("keyword_properties"),
            include("keywords"),
            include("builtins"),
            (r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", Token.Name.Variable),
            (r"#.*$", Token.Comment),
            (r"\s", Token.Text.Whitespace),
            (r".", Token.Generic),
        ],
        "string": [
            (r'"[^"]*?"', Token.String),
        ],
    }


__all__ = ["PigeonLexer"]
