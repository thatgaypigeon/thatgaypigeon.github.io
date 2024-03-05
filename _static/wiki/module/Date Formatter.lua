local p = {}

local Date = require("Module:Date")._Date
local X = require("Module:NotEmpty")

local CREATE = mw.html.create
local TS = tostring

local function makeInvokeFunc(funcName)
    return function (frame)
        local args, kwargs = require("Module:GetArgs")(frame)
        PreProcess = function( s ) return frame:preprocess( s ) end
        return p[funcName](args, kwargs)
    end
end


-- DATEFORMATTER (main)

p.main = makeInvokeFunc('_dateFormatter')
p.date, p.d, p.formatter, p.format, p.f, p.date_formatter, p.dateFormatter = p.main, p.main, p.main, p.main, p.main, p.main, p.main

function p._dateFormatter(args, kwargs)
	assert(args[1], "No date provided")
	
	local _date = Date(args[1])
	
	assert(_date, "Error parsing date")
	
	local day = _date:text("%-d")
	local month = _date:text("%B")
	local year = _date:text("%-Y")
	
	local ord
	
	if day[#day] == "1" then ord = "st"
	elseif day[#day] == "2" then ord = "nd"
	elseif day[#day] == "3" then ord = "rd"
	else ord = "th"
	end
	
	ord = TS(CREATE("sup"):wikitext(ord))
	
	local finalDate = day..ord.." "..month..", "..year
	
	local wrapper = CREATE("span"):attr("data-date", _date:text("ymd")):wikitext(finalDate)
	
    return TS(wrapper)
end


return p