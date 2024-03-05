return function (t)
	if not(t) or t == {} then return {} end
	return table.concat(t, " ")
end
