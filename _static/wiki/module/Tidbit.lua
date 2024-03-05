local p = {}

local function makeInvokeFunc(funcName)
	return function (frame)
		return p[funcName](require("Module:GetArgs")(frame))
	end
end

p["type"] = makeInvokeFunc('_type')

function p._type(args, kwargs)
	if not args[1] or args[1] == "" then return "" end
	local t = {}
	for _, item in ipairs(require("Module:String")._split(args[1], (kwargs.delim or ", "))) do
		table.insert(t, item.."[[Category:"..item.." tidbits]]")
	end
	return mw.getCurrentFrame():expandTemplate{title = "Hlist", args = t }
end

p.source = makeInvokeFunc('_source')

function p._source(args, kwargs)
	return args[1]
end

return p