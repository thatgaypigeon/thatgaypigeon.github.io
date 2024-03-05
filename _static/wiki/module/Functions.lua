local p = {}

function p.reverseTable(t)
	for i = 1, math.floor(#t/2) do
	   local j = #t - i + 1
	    t[i], t[j] = t[j], t[i]
	end
	return t
end

return p