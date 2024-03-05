local p = {}

function p.repeatString(frame)
	local repeats = tonumber(frame.args[2]) or 1
	return string.rep(frame.args[1], repeats) or nil
end

return p