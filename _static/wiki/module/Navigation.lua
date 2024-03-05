local p = {}


-- → Imports
-- ------------------------
local String = require("Module:String")


-- → Shortcuts
-- ------------------------
local CREATE = mw.html.create
local TS = tostring

local SPLIT = String.__split


-- → MW Objects
-- ------------------------
local frame = mw.getCurrentFrame()


-- → Invoker
-- ------------------------
local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end



-- -----------------------------
-- → Module
-- -----------------------------


-- → NAVIGATION (main)
-- ------------------------

p.main = makeInvokeFunc('_navigation')
p.navigation, p.nav = p.main, p.main

function p._navigation(args, kwargs)
	local wrapper = CREATE("tr"):addClass("navigation-item")
	local cells = {}
	
	-- filter args
	for index, arg in pairs(args) do if arg and arg ~= "" then table.insert(cells, arg) end end
	
	-- create cells
	for index, cell in pairs(cells) do
		local class = "navigation-item-header"
		local rowspan = kwargs["rowspan"..TS(index)]
		local colspan = kwargs["colspan"..TS(index)]
		
		-- "final cell" changes
		if index == #cells then
			class = "navigation-item-content"
			colspan = "100%"
		end
		
		cells[index] = CREATE("td"):addClass(class):wikitext(cell)

		if rowspan and rowspan ~= "" then cells[index] = cells[index]:attr("rowspan", rowspan) end
		if colspan and colspan ~= "" then cells[index] = cells[index]:attr("colspan", colspan) end
	end
	
	-- add cells to wrapper
	for _, cell in pairs(cells) do wrapper:node(cell) end

    return TS(wrapper)
end


-- NAVBOX
-- ------------------------

p.navbox = makeInvokeFunc('_navbox')

function p._navbox(args, kwargs)
    -- create navbox
    local navbox = CREATE("div")
    	:addClass("navbox mw-collapsible mw-collapsed")
    	:tag("div")
    		:addClass("navbox-header")
    		:wikitext(frame:expandTemplate{ title = "Navbar" , args = { (kwargs.template or kwargs.name or "Navbox") } })
    		:tag("span")
	    		:addClass("navbox-title")
	    		:wikitext(kwargs.header or kwargs.title or kwargs.name or "Navbox")
	    		:allDone()
    	:tag("div")
    		:addClass("navbox-content mw-collapsible-content")
	    	:tag("table")
	    		:wikitext(table.concat(args, ""))
				:allDone()
    	
    return TS(navbox)
end


return p