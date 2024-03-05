local p = {}

local function makeInvokeFunc(funcName)
	return function (frame)
		return p[funcName](require("Module:GetArgs")(frame))
	end
end

p.trait = makeInvokeFunc('_trait')
p.main = p.trait

function p._trait(args, kwargs)
    return args[1] or "MISSING_TRAIT"
end

return p