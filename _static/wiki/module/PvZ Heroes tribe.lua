local getArgs = require('Module:Arguments').getArgs

local p = {}

local function makeInvokeFunc(funcName)
	return function (frame)
		local args = getArgs(frame)
		return p[funcName](args)
	end
end

p.tribe = makeInvokeFunc('_tribe')

function p._tribe(args)
    local _ctx
    if args.ctx ~= "" and args.ctx ~= nil then
        _ctx = args.ctx
    else
        _ctx = "PvZ Heroes"
    end

	local t = {}
    for key, arg in pairs(args) do
        table.insert(t, "[[Tribes (".._ctx..")#"..arg.."|"..arg.."]]")
    end
    return table.concat(t, " ")
end

p.tribeFromStr = makeInvokeFunc('_tribeFromStr')

function p._tribeFromStr(args)
    local _ctx
    if args.ctx ~= "" and args.ctx ~= nil then
        _ctx = args.ctx
    else
        _ctx = "PvZ Heroes"
    end

    local _string = require("Module:String")

	local t = {}
    for key, item in pairs(_string._split(args[1], ", ")) do
        table.insert(t, "[[Tribes (".._ctx..")#"..item.."|"..item.."]]")
    end
    return table.concat(t, " ")
end

return p