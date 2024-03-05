local p = {}

local String = require("Module:String")

local function makeInvokeFunc(funcName)
	return function (frame)
		return p[funcName](require("Module:GetArgs")(frame))
	end
end

p.splitBr = makeInvokeFunc('_splitBr')
p.main, p.splitbr = p.splitBr, p.splitBr

function p._splitBr(args, kwargs)
    ---@type string
    local str = mw.getCurrentFrame():preprocess(kwargs.string or kwargs.str or args[1])
    
    if (not str) or str == "" then return "" end
    
    local t = {str}
    for _, Break in ipairs(Breaks) do
    	local t2 = {}
    	for _, item in ipairs(t) do if item ~= "" then for _, split in ipairs(String._split(item, Break)) do table.insert(t2, split) end end end
    	t = t2
    end
    
    for i, item in ipairs(t) do t[i] = "<li>"..item.."</li>" end
    
    return mw.getCurrentFrame():expandTemplate{ title = "Plainlist", args = { table.concat(t, "") } }
end

Breaks = {
    "\n\n",
    "\n",
    "\r",
    "<br>",
    "<br/>",
    "<br >",
    "<br />"
}

return p