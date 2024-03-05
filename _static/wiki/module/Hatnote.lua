local p = {}


-- → Imports, config
-- ------------------------
local cfg = require("Module:Hatnote/config")

local Yesno = require("Module:Yesno")
local Link = require("Module:Link").__link


-- → Shortcuts
-- ------------------------
local CREATE = mw.html.create
local TS = tostring

local HATNOTE = CREATE("div"):addClass("hatnote")


-- → MW objects
-- ------------------------
-- local frame = mw.getCurrentFrame()


-- → Invoker
-- ------------------------
local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end


-- → Supplementary functions
-- ------------------------
local function hatnoteGroup(args, pre)
	if pre and pre ~= "" then pre = pre.." " else pre = "" end
	local group = CREATE("div"):addClass("hatnote-group"):wikitext(pre..table.concat(args, " "))
    return TS(group)
end


-- -----------------------------
-- → Module
-- -----------------------------


-- → About
-- ------------------------

p.about = makeInvokeFunc('_about')

function p._about(args, kwargs)
	local topic = table.remove(args, 1)
	local about = HATNOTE:wikitext("This page is about "..topic..".")
	
	-- alter {{distinguish}} text if exists
	for index, arg in pairs(args) do args[index] = arg:gsub(cfg.distinguishText, cfg.distinguishTextAlt) end
	
	local hatnote = hatnoteGroup(args, TS(about))
	
    return TS(hatnote)
end


-- → Group
-- ------------------------ 

p.group = makeInvokeFunc('_group')
p.hatnoteGroup = p.group

function p._group(args, kwargs)
	return hatnoteGroup(args)
end


return p