import os
import re
from typing import Any, Callable
from xml.etree.ElementTree import Element

from extensions import esc_seq


def decorate(func) -> Callable[..., Callable[..., Any]]:
    def _layer(*args, **kwargs) -> Callable[..., Any]:
        def _func(f) -> Any:
            return func(f, *args, **kwargs)

        return _func

    return _layer


def esc(string: str) -> str:
    return r"(" + esc_seq + "(" + string + "))"


def maybe_esc(string: str) -> str:
    return r"((?:" + esc_seq + ")?(" + string + "))"


def no_esc(string: str) -> str:
    return r"((?<!" + esc_seq + r")" + "(" + string + "))"


def esc_quotes(string) -> str:
    return re.sub(r"\\\"", '"', string)


def own_line(regex: str) -> str:
    return f"(?:^|\\n){regex}(?:$|\\n)"


def rchop(s: str, suffix: str) -> str:
    if suffix and s.endswith(suffix):
        return s[: -len(suffix)]
    return s


def lchop(s: str, prefix: str) -> str:
    if prefix and s.startswith(prefix):
        return s[len(prefix) :]
    return s


def replace_dict_values(data, params) -> Any:
    """
    Recursively replace dictionary values if their key matches a parameter name.

    :param data: The list of tuples containing dictionaries.
    :param params: A dictionary of parameter names and their new values.
    :return: The modified list of tuples.
    """
    for i, item in enumerate(data):
        if isinstance(item, tuple):
            for j, dict_item in enumerate(item):
                if isinstance(dict_item, dict):
                    data[i] = replace_dict_values(item, params)
        elif isinstance(item, dict):
            for key, value in item.items():
                if key in params:
                    item[key] = params[key]
                elif isinstance(value, dict):
                    item[key] = replace_dict_values([value], params)[0]
    return data


def list_files(path: str) -> list[str]:
    file_list: list[str] = []
    for root, dirs, files in os.walk(path):
        for name in files:
            file_list.append(os.path.join(root, name))

    return file_list


def slugify(string: str) -> str:
    return string.lower().replace(" ", "-")


def reveal(locals, args) -> None:
    length: int = len(max(args, key=len))
    print(*(f"{arg:{length}} = {locals[arg]}" for arg in args), "", sep="\n")


@decorate
def pigeon_md(
    func: Callable,
    pattern: str,
    flags: re.RegexFlag = 0,
    code: bool | None = None,
    replace_index: int | None = None,
    replace_str: str | None = None,
    replace_func: Callable | None = None,
    *args,
    **kwargs,
) -> Callable[..., str | None]:
    if code == False:
        pattern = r"(?<!`)" + pattern + r"(?!`)"
    elif code == True:
        pattern = r"`(" + pattern + r")`"

    def sub(text: str, element: Element = None) -> str | None:
        if text and pattern:
            text = re.sub(no_esc(pattern), lambda match: func(match, text, element, *args, **kwargs), text, flags=flags)
            text = re.sub(
                esc(pattern),
                replace_str
                if replace_str
                else (lambda match: replace_func(match))
                if replace_func
                else (lambda match: match.group(replace_index if replace_index is not None else 2)),
                text,
                flags=flags,
            )
            return text

    return sub
