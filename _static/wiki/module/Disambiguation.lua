local p = {}


-- → Imports, config
-- ------------------------
local Yesno = require("Module:Yesno")
local NotEmpty = require("Module:NotEmpty")

local Date = require("Module:Date")._Date
local List = require("Module:List")._makeUnorderedList
local Link = require("Module:Link").__link

-- → Shortcuts
-- ------------------------
local CREATE = mw.html.create
local TS = tostring


-- → MW objects
-- ------------------------
local frame = mw.getCurrentFrame()
local title = mw.title.getCurrentTitle()


-- → Invoker
-- ------------------------
local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end



-- -----------------------------
-- → Module
-- -----------------------------

-- → DISAMBIGUATION (main)
-- ------------------------

p.main = makeInvokeFunc('_disambiguation')
p.disambiguation, p.disambiguate, p.disambiguationList, p.list = p.main, p.main, p.main, p.main

function p._disambiguation(args, kwargs)
    -- setup vars
    local perItem = 4 -- number of inline parameters per discography entry
    local itemIndex = 0 -- starting index
    local disambiguationItems = {}
    local item = disambiguationItems[1]
    local itemTitle
    local itemCtx
    local itemLink
    local itemDescription
    local itemDate

    -- cerate elements
    local spacer = ", " -- TS(CREATE("span"):addClass("item-spacer no-select"):wikitext("•"))
    local disambiguation = CREATE("ul"):addClass("disambiguation")

    -- add empty discography entries
    for i = 1, math.ceil(#args / perItem) do table.insert(disambiguationItems, CREATE("li"):addClass("disambiguation-item")) end

    -- new discography entry
    local function newItem()
        -- details = CREATE("span"):addClass("discography-item-details") -- reset details
        itemIndex = itemIndex + 1 -- increment index
        item = disambiguationItems[itemIndex] -- index new item
    end

    local count = 1

    for i, value in ipairs(args) do
        -- splits all args into "groups" of size perItem
        local index = (i - 1) % perItem + 1

        if index == 1 then
            -- setup new item
            newItem()
            
        	itemTitle = value or title.prefixedText
        elseif index == 2 then
            -- process ctx
            if not NotEmpty(value) and itemTitle == title.prefixedText then
            	error("no link was given for item"..tostring(itemIndex))
            else
	            itemLink = frame:preprocess("{{Link|"..itemTitle.."|ctx="..value.."|displayCtx=false}}") -- Link{__pageName = itemTitle, __ctx = value, __displayCtx = false}
            end
        elseif index == 3 then
        	-- process description
        	-- assert(NotEmpty(value) == false and NotEmpty(args[i-1]) == false, "no description or ctx was provided for element"..tostring(itemIndex))
        	itemDescription = value
        else
            -- process year
            if value and value ~= "" then 
	            local _date = Date(value)
	            assert(_date, "error parsing date")
	            itemDate = TS(CREATE("span"):addClass("date"):attr("title", _date:text("mdy")):wikitext(_date:text("%-Y")))
	
	            item:attr("data-date", value)
            end

            -- set details
            item:wikitext(itemLink..spacer..itemDescription..spacer..itemDate):allDone()
        end
    end
    
    for _, item in pairs(disambiguationItems) do disambiguation:node(item) end
    
    -- return wrapper
    return tostring(disambiguation)..tostring(mw.ustring.codepoint(args[4]))
end


return p