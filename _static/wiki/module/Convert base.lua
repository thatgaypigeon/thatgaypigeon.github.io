local p = {}

local function makeInvokeFunc(funcName)
	return function (frame)
		return p[funcName](require("Module:GetArgs")(frame))
	end
end

p.convertBase = makeInvokeFunc('_convertBase')
p.main, p.convert = p.convertBase, p.convertBase

function p._convertBase( args, kwargs )
	n = tonumber(math.floor(args[1])) or 0
	if n == 0 then return "" end
	b = tonumber(args[2]) or 10
	
	local t = _convertDigits( n, b )
	local after = "<sub>"..tostring(b).."</sub>"
	
	if b <= 36 then
		if require("Module:Yesno")(kwargs.raw) then return table.concat(t) end
		return table.concat(t)..after
	end
	
	if require("Module:Yesno")(kwargs.raw) then return table.concat(t, ":") end
	return table.concat(t, kwargs.mw_frame:expandTemplate{ title = "Ghost", args = { name="colon" } })..after
end

function _convertDigits( n, b )
	n = tonumber(n) or 0
	if n == 0 then return {} end
	
    b = tonumber(b) or 10
    local digits = _convertToList( n, b )
    local t = {}
    if b <= 36 then
    	for _, d in ipairs(digits) do
    		if d <= 9 then table.insert(t, tostring(d))
    		else table.insert(t, string.char(d+55))
    		end
		end
    else
    	for _, d in ipairs(digits) do table.insert(t, tostring(d)) end
	end
    
    return t
end

function _convertToList( n, b )
	-- from base 10 only
	n = tonumber(n) or 0
	if n == 0 then return {} end
	
	b = tonumber(b) or 10
	local digits = {}
	while n > 0 do
		table.insert(digits, tonumber(n % b))
		n = math.floor(n / b)
	end
	
	return require("Module:Functions").reverseTable(digits)
end

return p