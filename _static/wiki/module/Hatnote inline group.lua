local p = {}

local GetArgs = require("Module:GetArgs")
local Yesno = require("Module:Yesno")
local String = require("Module:String")

local function makeInvokeFunc(funcName)
	return function (frame)
		args, kwargs = GetArgs(frame)
		return p[funcName](args, kwargs)
	end
end

p.hatnoteInlineGroup = makeInvokeFunc('_hatnoteInlineGroup')
p.main, p.hatnoteinlinegroup = p.hatnoteInlineGroup, p.hatnoteInlineGroup

function p._hatnoteInlineGroup(args, kwargs)
    return require("Module:Separate by space")(args)
end

return p