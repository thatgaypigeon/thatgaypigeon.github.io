local p = {}

local Yesno = require("Module:Yesno")
local Link = require("Module:Link").__link
local Date = require("Module:Date")._Date
local X = require("Module:NotEmpty")

local CREATE = mw.html.create
local TRIM = require("Module:String").__trim
local TS = tostring

local frame = mw.getCurrentFrame()
local title = mw.title.getCurrentTitle()


-- → Supplementary functions
-- ------------------------

local function fileExists(fileName)
    return Yesno(frame:preprocess("{{#ifexist:File:"..fileName.."|Yes}}"), false)
end

local function concatWithSpacer(str, str2)
    if not str or str == "" then return (type(str2) == "string" and str2) or str end
    if type(str) == "string" and type(str2) == "string" and str2 ~= "" then return str .. spacer .. str2 end
    return str
end

local function addItem(object, name, value, tag, allowEmpty)
    if value then
        object:tag(tag or "div")
            :addClass("discography-item-"..name)
            :wikitext(value)
            :done()
    elseif allowEmpty then
        object:tag(tag or "div")
            :addClass("discography-item-"..name)
            :done()
    end
end

local function addFileIfExists(object, imgName, link)
    if fileExists(imgName) then 
        addItem(object, "image", "[[File:"..imgName.."|link="..(link or "").."]]")
    else
        addItem(object, "image-none", nil, nil, true)
    end
end

local function processAlbum(albumName, albumLink, noLink)
    if not X(albumName) then return nil
    elseif Yesno(noLink, false) then return albumName end

    return Link(albumLink or albumName, nil, albumName)
end

local function processArtist(artistName, artistLink, noLink)
    if not X(artistName) then return nil
    elseif Yesno(noLink, false) then return artistName end

    return Link(artistLink or artistName, nil, artistName)
end


local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end


-- DISCOGRAPHY (main)

p.main = makeInvokeFunc('_discography')
p.discog, p.disco, p.d = p.main, p.main, p.main

function p._discography(args, kwargs)
    -- setup vars
    local discographyItems = {}
    
    -- create elements
    spacer = TS(CREATE("span"):addClass("item-spacer no-select"):wikitext("•"))
    local discography = CREATE("div"):addClass("discography")
    
    local pageArtist
    if title.subpageText == "Discography" then pageArtist = title.baseText else pageArtist = title.text end
	
    for index, value in pairs(args) do
    	local item = CREATE("div"):addClass("discography-item")
    	
    	-- decode hCard (JSON)
    	local itemArgs = mw.text.jsonDecode(value)
    	
    	-- process args
    	-- local releaseDate = require("Module:Datetime").Date{itemArgs["date"] or itemArgs.year or itemArgs["3"], strict = true}
    	-- local rawDate = releaseDate.raw
    	-- local stringDate = releaseDate.str
    	-- local year = releaseDate.year
    	-- assert(year, "No year or date provided")
    	
    	local releaseDate = itemArgs["date"] or itemArgs.year or itemArgs[3]
    	local rawDate = releaseDate
    	local stringDate = releaseDate
    	local year = releaseDate:sub(1, 4)
    	
    	local album = itemArgs.album or itemArgs.title or itemArgs.name or itemArgs[1]
    	local albumLink = itemArgs.album_link or album
    	local albumOverride = itemArgs.album_override
    	local artist = itemArgs.artistName or itemArgs.artist or pageArtist
    	local artistLink = itemArgs.artist_link or artist
    	local artistOverride = itemArgs.artistOverride
    	local artwork = itemArgs.artwork or itemArgs.albumArtwork or itemArgs.cover or itemArgs.albumCover or itemArgs.image or itemArgs.img or album.." ("..artist..").png"
    	local genre = itemArgs.genre or itemArgs.style or itemArgs[2]
    	local releaseType = itemArgs["type"] or itemArgs.kind or itemArgs[6]
    	local instrumental = Yesno(itemArgs.instrumental or itemArgs.is_instrumental)
    	local language = itemArgs.language or itemArgs.lang
    	local with = itemArgs.with or itemArgs.collaboration or itemArgs.collab
    	local feat = itemArgs.featuring or itemArgs.feat or itemArgs.ft
    	local from = itemArgs.from or itemArgs.source
    	local notes = itemArgs.notes or itemArgs.details or itemArgs.extra or itemArgs.more
    	local count = itemArgs.song_count or itemArgs.count or itemArgs[4]
    	local length = itemArgs.length or itemArgs.duration or itemArgs["time"] or itemArgs[5]
    	
    	-- prep variables
    	count = count and count ~= "" and (tostring(count).." "..(tostring(count) == "1" and "song" or "songs")) or nil
    	if (language and language:lower() == "instrumental") or instrumental then language = "Instrumental" end
    	
    	-- create "rows"
    	local row1 = ""
		local row2 = ""
		
		local details1 = {year, genre, releaseType}
		local details2 = {count, length, language}
		
		for _, detail in pairs(details1) do row1 = concatWithSpacer(row1, detail) end
		for _, detail in pairs(details2) do row2 = concatWithSpacer(row2, detail) end
	    
    	-- add details to item
    	addFileIfExists(item, artwork, albumLink)
    	addItem(item, "album", albumOverride or Link(albumLink, nil, album), nil, true)
    	addItem(item, "details row1", row1)
    	addItem(item, "details row2", row2)
    	addItem(item, "artist", artistOverride or (artist ~= pageArtist and "by "..Link(artistLink, nil, artist) or nil))
    	addItem(item, "with", with and "with "..with or nil)
    	addItem(item, "feat", feat and "ft. "..feat or nil)
    	addItem(item, "from", from and "from "..from or nil)
    	addItem(item, "notes", notes)
    	
    	discography:node(item)
    	--]]
    end

    -- return wrapper
    return TS(discography)
end


return p