local cfg = {
    tabs = {
        musician = { "Synopsis", "Discography", "Quotes" },
        band = { "Synopsis", "Discography", "Members" },
        album = { "Production", "Tracklist", "Versions" },
        song = { "Production", "Lyrics", "Versions" },
        video_game = { "Development", "Gameplay", "Characters", "Achievements", "Quotes" },
        person = { "Synopsis", "Quotes" },
        movie = { "Production", "Characters", "Cast", "Quotes" },
        tv_show = { "Production", "Characters", "Cast", "Quotes" },
        episode = { "Production", "Characters", "Cast", "Quotes" },
        location = { "Geography", "Synopsis", "Heirarchy" },
        character = { "Synopsis", "Relationships", "Quotes" },
    },
    icons = {
        Overview = "File:OOjs UI icon article-rtl.svg",

        Synopsis = "File:Font Awesome 5 solid hourglass-half.svg",
        Production = "File:OOjs UI icon advanced.svg",

		Versions = "File:Tabler-icons arrows-minimize.svg",
        Hierarchy = "File:Tabler-icons hierarchy-3.svg",
        
        Gallery = "File:OOjs UI icon imageGallery-ltr.svg",
        Quotes = "File:OOjs UI icon quotes-ltr.svg",
        Disambiguation = "File:OOjs UI icon page-disambiguation-ltr.svg",

        Other = "File:OOjs UI icon ellipsis.svg",
        -- Other / Extra
        Tidbits = "File:OOjs UI icon puzzle-ltr.svg",
        Categories = "File:OOjs UI icon tag-ltr.svg",
        Source = "File:OOjs UI icon markup.svg", -- OR : code, wikiText
        List = "File:OOjs UI icon stripeToC-rtl.svg",

        -- References?
    },
    classNames = {
        Overview = "page-tab-overview",

        Synopsis = "page-tab-synopsis",
        Production = "page-tab-production",

        Versions = "page-tab-versions",
        Discography = "page-tab-discography",
        Characters = "page-tab-characters",
        Cast = "page-tab-cast",
        Hierarchy = "page-tab-hierarchy",

        Gallery = "page-tab-gallery",
        Quotes = "page-tab-quotes",
        Disambiguation = "page-tab-disambiguation",

        Other = "page-tab-other",
        -- Other / Extra
        Tidbits = "page-tab-tidbits",
        Categories = "page-tab-categories",
        Source = "page-tab-source",
        List = "page-tab-list",

        -- References
    }
}


local tabs = cfg.tabs
local icons = cfg.tabs
local classNames = cfg.classNames

-- Aliases
tabs.band = tabs.musician
tabs.videogame, tabs["video game"] = tabs.video_game, tabs.video_game
tabs.film = tabs.movie
tabs.tv, tabs.show, tabs["tv show"] = tabs.tv_show, tabs.tv_show, tabs.tv_show

icons.Development = icons.Production

classNames.Development = classNames.Production

return cfg