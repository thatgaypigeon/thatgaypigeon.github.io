return function ( frame, as_json )
	if type(frame) ~= "table" then frame = mw.getCurrentFrame() end
	
	local args = {}
	local kwargs = {}
	local json = {}
	
	for k, v in pairs(require("Module:Arguments").getArgs(frame, {removeBlanks = false, trim = false})) do
		if as_json then
			-- cannot store index as number, is converted to string anyways
			json[tostring(k):lower()] = v
		else
			if type(k) == "number" then
				table.insert(args, v)
			else
				-- lowercase all args, as per [[Manual:Lua#Parameters]] and [[Manual:Templates#Parameters]]
				kwargs[k:lower()] = v
			end
		end
	end
	
	-- kwargs.mw_frame = frame
	
	if as_json then return json end

	return args, kwargs
end