local p = {}


-- → Invoker
-- ------------------------
local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end



-- -----------------------------
-- → Module
-- -----------------------------


-- → Count (main)
-- ------------------------

p.main = makeInvokeFunc('_countParameters')
p.count, p.countParameters = p.main, p.main

function p._countParameters(args, kwargs)
    local count = 0
    for _, arg in pairs(args) do
    	 if arg and arg ~= "" then count = count + 1 end
    end
	return tostring(count)
end


return p