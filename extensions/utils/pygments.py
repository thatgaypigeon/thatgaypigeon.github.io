from pygments.token import STANDARD_TYPES, _TokenType


class CustomTokens:
    @classmethod
    def create_token(cls, name: str, code: str, group: str = "Token") -> _TokenType:
        if not hasattr(cls, group):
            setattr(cls, group, type(group, (), {}))
        token = _TokenType((*group.split("."), name))
        setattr(getattr(cls, group), name, token)
        STANDARD_TYPES[token] = code
        return token

    @classmethod
    def add_tokens(cls, *args, **kwargs):
        for arg in args:
            cls.create_token(*arg, **kwargs)
