local p = {}

local cfg = require("Module:Tabs/config")

local Yesno = require("Module:Yesno")
local Link = require("Module:Link").__link
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

-- → Module
-- ------------------------
local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end


-- TABS (main)

p.main = makeInvokeFunc('_tabs')
p.t, p.tab, p.tabs, p.tabber = p.main, p.main, p.main, p.main

function p._tabs(args, kwargs)
    local _type = kwargs.type or kwargs.types or kwargs.t or args[1]

    assert(_type, "\"type\" not given")

    local tabs = cfg.tabs[_type:lower()]

    assert(tabs, "type \"".._type.."\" not found")

    if Yesno(kwargs.disambiguation or kwargs.disambiguate or kwargs.disambig, false) then tabs.insert("Disambiguation") end
    if Yesno(kwargs.tidbits or kwargs.tidbit, true) then tabs.insert("Tidbits") end

    local namespace = title.nsText
    local pageName = namespace..title.baseText
    local subPageName = title.subpageText
    
    local activeTab
    for _, tab in ipairs(tabs) do if tab == subPageName then activeTab = tab end end

	if not activeTab then
		cfg.classNames.Overview = cfg.classNames.Overview.." page-tab-active"
		pageName = title.prefixedText
	end
	
    local list = CREATE("ul")
        :addClass("page-tabs")
        :tag("li")
            :addClass("page-tab "..cfg.classNames.Overview)
            :wikitext(Link(pageName, nil, "Overview"))
            :done()

    for _, tab in ipairs(tabs) do
    	if tab == subPageName then cfg.classNames[tab] = cfg.classNames[tab].." page-tab-active" end
        list:tag("li")
            :addClass("page-tab "..(cfg.classNames[tab] or tab))
            :wikitext(Link(pageName.."/"..tab, nil, tab))
            :done()
    end
    
    local headerDefaultImg = fileExists(pageName.." header.png") and pageName.." header.png" or nil
    local headerImg = kwargs.header or kwargs.image or kwargs.img or headerDefaultImg
    
    local header = headerImg and CREATE('img')
	    :attr('src', headerImg)
	    :attr('alt', "") or nil
	    
    local wrapper = CREATE("div"):addClass("page-tabs-wrapper")
    if header then wrapper:node(header:done()) end
	wrapper:node(list:done())

    return TS(wrapper)
end


return p