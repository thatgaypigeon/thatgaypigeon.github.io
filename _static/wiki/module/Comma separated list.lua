local p = {}

local GetArgs = require("Module:GetArgs")
local YesNo = require("Module:Yesno")
local Linkify = require("Module:Link").__link

local function makeInvokeFunc(funcName)
	return function (frame)
		args, kwargs = GetArgs(frame)
		return p[funcName](args, kwargs)
	end
end

p.list = makeInvokeFunc('_list')
p.main = p.list

function p._list(args, kwargs)
	if tonumber(kwargs.removestart) then
		for i=1, tonumber(kwargs.removestart) do
			table.remove(args, i)
		end
	end
	
	if tonumber(kwargs.removeend) then
		for i=1, tonumber(kwargs.removeend) do
			table.remove(args, i)
		end
	end
	
	-- collect synonymous args
	local arg_lastDelim = not(kwargs.nolastdelim) or kwargs.oxford or kwargs.serial or kwargs.series
	local arg_delim = kwargs.separator or kwargs.sep or kwargs.delimeter or kwargs.delim
	local arg_conj = kwargs.conjunction or kwargs.conj
	local arg_delimOverride = kwargs.separatoroverride or kwargs.sepoverride or kwargs.delimeteroverride or kwargs.delimoverride
	local arg_conjOverride = kwargs.conjunctionoverride or kwargs.conjoverride
	local arg_noConj = kwargs.noconjunction or kwargs.noconj
	
	if not(YesNo(kwargs.link or false) == false) then
		for i, v in pairs(args) do
			if args[i] and args[i] ~= "" then args[i] = Linkify(v) end
		end
	end
	
	local defaultDelim = ","
	for i, v in pairs(args) do
		if string.find(v, ",") then
			defaultDelim = ";"
			break
		end
	end
	
	_lastDelim = YesNo(arg_lastDelim or false)
	delim = arg_delimOverride or ((arg_delim or defaultDelim) .. " ")
	conj = (arg_noConj and delim) or (arg_conjOverride or ((#args > 2 and _lastDelim == true and delim or " ") .. (arg_conj or "and") .. " "))
	return mw.text.listToText(args, delim, conj)
end

return p