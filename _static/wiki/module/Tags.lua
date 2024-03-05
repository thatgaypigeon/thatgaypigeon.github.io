local p = {}

local cfg = require("Module:Tags/config")
local globalCfg = require("Module:Config")

local Link = require("Module:Link").__link
local Yesno = require("Module:Yesno")

local CREATE = mw.html.create
local TRIM = require("Module:String").__trim
local TS = tostring

local frame = mw.getCurrentFrame()
local title = mw.title.getCurrentTitle()


-- → Supplementary functions
-- ------------------------
local function base64Encode(data)
	local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    return ( (data:gsub('.', function(x) 
        local r, b = '', x:byte()
        for i = 8, 1, -1 do r = r..(b % 2^i - b % 2^(i - 1) > 0 and '1' or '0') end
        return r
    end)..'0000'):gsub('%d%d%d?%d?%d?%d?', function(x)
        if (#x < 6) then return '' end
        local c = 0
        for i = 1, 6 do c = c + (x:sub(i, i) == '1' and 2^(6 - i) or 0) end
        return b:sub(c + 1, c + 1)
    end)..( { '', '==', '=' } )[#data % 3 + 1])
end


-- → Module
-- ------------------------
local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end


-- TAGS (main)

p.main = makeInvokeFunc('_tags')
p.t, p.tag, p.tags, p.tagger = p.main, p.main, p.main, p.main

function p._tags(args, kwargs)
    assert(args ~= {}, "tags not given")
    
    local tags = {}
    for _, arg in ipairs(args) do
    	arg = TRIM(arg)
    	if cfg[arg] then
    		local tagName = "tag-"..cfg[arg].portal:gsub(" ", "-")
    		local tag = CREATE("div"):addClass("indicator-tag-image"):attr("data-image", base64Encode(cfg[arg].img)):wikitext(Link("Portal:"..cfg[arg].portal, nil, cfg[arg].portal))
			table.insert(tags, frame:callParserFunction( "#tag", { "indicator", TS(tag), name = tagName } ) )
		end
	end

    if Yesno(frame:preprocess("{{#ifexist:Joke:"..title.text.."|true}}"), false) then
        local jokeArticle = Link("Joke:"..title.text, nil, "Joke article "..globalCfg.arrow)
        table.insert(tags, jokeArticle)
    end

    local wrapper = TS(CREATE("div")
        :addClass("tags-wrapper")
        :wikitext(table.concat(tags)))

    return wrapper
end


return p