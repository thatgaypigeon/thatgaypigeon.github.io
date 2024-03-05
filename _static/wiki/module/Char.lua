local p = {}

function p.char(frame)
	local chars = {}
	for i, ch in ipairs(frame.args) do
		table.insert(chars, tonumber(ch))
	end
	if #chars < 1 then
		local template = frame:getParent()
		for i, ch in ipairs(template.args) do
			table.insert(chars, tonumber(ch))
		end
	end
	return mw.ustring.char(unpack(chars))
end

function p.flag(frame)
	local code = frame.args[1]
	if not code or #code < 1 then
		code = frame:getParent().args[1] or ""
	end
	code = mw.ustring.gsub(mw.ustring.upper(code), "-", "")
	local codepoints = {mw.ustring.codepoint(code, 1, -1)}
	local a = 0x1F1E6
	if #codepoints > 2 then
		a = 0xE0061
	end
	for i, codepoint in ipairs(codepoints) do
		codepoints[i] = a + (codepoint - 65)
	end
	if #codepoints > 2 then
		table.insert(codepoints, 1, 0x1F3F4)
		table.insert(codepoints, 0xE007F)
	end
	return mw.ustring.char(unpack(codepoints))
end

return p