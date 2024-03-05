local p = {}
	
function p.number(frame)
	math.randomseed(os.time())
	math.random(); math.random(); math.random()
	local min = tonumber(frame.args[1]) or 0
	local max = tonumber(frame.args[2]) or 100
    local r = math.random(min, max)
    return r
end

return p