import re
from json import dumps

file_path = "../../../_static/css/styles.css"

contents: dict[int, dict[int, str]] = {}
INDENT = 2
LENGTH = 27
BULLET = "\u2192"
GAP = 2

major_len = 115
minor_len = 95
micro_len = 79


def sentenceCase(s: str) -> str:
    words: list[str] = s.split(" ")
    return " ".join([words[0][0].upper() + words[0][1:]] + words[1:])


def main() -> list[str]:
    major_count = 0

    content_index: int | None = None
    after_content_index: int | None = None

    with open(file_path, "r", encoding="utf-8") as f:
        prev_major: int = 0
        prev_minor: int = 0

        file_contents: list[str] = f.readlines()

        index = 0

        i = 0
        while i < len(file_contents):
            index += 1
            l = file_contents[i]
            line: str = l.strip()
            if re.fullmatch(r"^\/\/ -* .* -* \/\/$", line):
                title: str = " ".join(line.split(" ")[2:-2]).strip()
                if major_count == 0:
                    content_index = index
                elif content_index and not after_content_index:
                    after_content_index = index

                line_len: int = len(line)
                if line_len == major_len:
                    title = title.upper()
                    major_count += 1
                    prev_major = index
                    contents[index] = {0: title}
                    # ensure text is centred
                    file_contents[i] = (
                        "// " + f" {title} ".center(major_len - 6, "-") + " //\n"
                    )
                elif line_len == minor_len:
                    title = title.title()
                    if type(contents[prev_major]) == dict:
                        contents[prev_major][index] = {0: title}
                        prev_minor = index
                        # ensure text is centred
                        file_contents[i] = (
                            "// " + f" {title} ".center(minor_len - 6, "-") + " //\n"
                        )
                    # else:
                    #     print(f"Heading level 1 missing for heading \"{i}\"!")
                elif line_len == micro_len:
                    title = title.title()
                    if type(contents[prev_major][prev_minor]) == dict:
                        contents[prev_major][prev_minor][index] = title
                        # ensure text is centred
                        file_contents[i] = (
                            "// " + f" {title} ".center(micro_len - 6, "-") + " //\n"
                        )
                    # else:
                    #     print(f"Heading level 2 missing for heading \"{i}\"!")
                else:
                    print(f"Anomalous line length {line_len} at line {i}!")

            # Check mini-headers
            elif re.match(r"^\/\* .* \*\/$", l) and not re.fullmatch(
                r"^\/", file_contents[i + 1]
            ):
                file_contents[i] = (
                    f"/* \u2192 {' '.join(l.split(" ")[1:-1]).lstrip('\u2192').lstrip('->').strip()}\n// {'-' * 21} */\n"
                )

            # Format mini-headers
            elif re.match(r"^\/\* ", line) and re.fullmatch(
                r"^\/\/ -* \*\/$", file_contents[i + 1].strip()
            ):
                file_contents[
                    i
                ] = f"/* {'\u2192'} {sentenceCase(' '.join(l.split(' ')[1:]).lstrip('\u2192').lstrip('->').strip())}\n"
                file_contents[i + 1] = f"// {'-' * 21} */"
                index += 1
                if file_contents[i - 1].strip() != "":
                    file_contents.insert(i, "\n")
                    index += 1
                if file_contents[i + 1].strip() == "":
                    del file_contents[i + 1]
                    index -= 1

            # Insert empty lines either side of a header
            # before
            elif i > 0 and re.fullmatch(r"^\/\* -* \/\/$", line):
                if file_contents[i - 1].strip() != "":
                    file_contents.insert(i, "\n")
                    index += 1
            # after
            elif i < len(file_contents) and re.fullmatch(r"^\/\/ -* \*\/$", line):
                if file_contents[i + 1].strip() != "":
                    file_contents.insert(i + 1, "\n")
                    index += 1

            i += 1

    contents_str = f"""
/* This section is auto-generated. Please do not edit it manually! :) */

/* \u2192 Table of Contents
// {'-' * (LENGTH + 2)} //"""

    for line, content in contents.items():
        contents_str += f"\n{content[0].ljust(LENGTH - 1,' ')} {str(line)}"
        for line2, content2 in content.items():
            if line2 != 0:
                contents_str += f"\n{' ' * (INDENT - len(BULLET))}{BULLET} {content2[0].ljust(LENGTH - GAP - INDENT - len(BULLET), ' ')}{' ' * GAP}{str(line2)}"
                for line3, content3 in content2.items():
                    if line3 != 0:
                        contents_str += f"\n{' ' * ((2 * (INDENT)) - len(BULLET))}{BULLET} {content3.ljust(LENGTH - GAP - (2 * (INDENT)) - len(BULLET), ' ')}{' ' * GAP}{str(line3)}"

    contents_str += f"""
// {'-' * (LENGTH + 2)} */
"""

    if content_index and after_content_index:
        content_index += 3
        after_content_index -= 5
        del file_contents[content_index:after_content_index]
        file_contents.insert(content_index, contents_str)

    return file_contents


file_contents: list[str] = main()
file_contents = main()

with open(file_path, "w", encoding="utf-8") as f:
    f.write("".join(file_contents))
