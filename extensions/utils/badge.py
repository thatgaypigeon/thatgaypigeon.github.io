from extensions import badge_map, badge_prefix_map, badge_type_map


def create_badge(badge_name: str, content: str = "") -> str:
    text: str = None
    icon: str = None
    tooltip: str = None

    classes = set(["badge"])

    if badge_name in badge_prefix_map.keys():
        tooltip = badge_prefix_map.get(badge_name, {}).get("tooltip", None).format(content)
        icon = badge_type_map.get(content, {}).get("icon", None)

        if name := badge_type_map.get(content, {}).get("name", None):
            text = f"[{name}](/pigeon/docs/types/{name.lower()})"
        else:
            text = None
    else:
        if badge_content := badge_map.get(badge_name, {}).get("content", None):
            if content:
                content_parts: list[str] = content.split(",")
                text = badge_content.format(*content_parts)
            else:
                text = badge_content
        else:
            text = ""

        if tooltip_text := badge_map.get(badge_name, {}).get("tooltip", None):
            tooltip = tooltip_text

        icon = badge_map.get(badge_name, {}).get("icon", None)

    if text and text.strip() != "":
        text = f'<span class="text">{text}</span>'

    if icon:
        if tooltip:
            icon = f'<span class="icon-tooltip" tooltip="{tooltip}"><i class="ph-bold {icon}"></i></span>'
        else:
            icon = f'<span class="icon-tooltip"><i class="ph-bold {icon}"></i></span>'

    if badge_type := badge_map.get(badge_name, {}).get("type", None):
        classes.add(badge_type)

    if badge_class := badge_map.get(badge_name, {}).get("class", None):
        classes.add(badge_class)

    badge: str = f'<span class="{' '.join(sorted(classes))}">{icon}{text}</span>'

    return badge
