local p = {}

local String = require("Module:String")

local function makeInvokeFunc(funcName)
	return function (frame)
		return p[funcName](require("Module:GetArgs")(frame))
	end
end

p.setRarity = makeInvokeFunc('_setRarity')
p.main, p.setrarity, p.set_rarity = p.setRarity, p.setRarity, p.setRarity

function p._setRarity(args, kwargs)
	local key = kwargs.key or kwargs["set-rarity"] or ""

    ---@type string
    local set = string.lower(kwargs.set or args[1] or "")
    if set ~= "" and key ~= "" then set = key end

    ---@type string
    local rarity = string.lower(kwargs.rarity or args[2] or kwargs.key or kwargs["set-rarity"] or set)
    if rarity ~= "" and key ~= "" then rarity = key end

    if checkSpecial(set) then return checkSpecial(set) end
    if checkSpecial(rarity) then return checkSpecial(rarity) end

    local _set = checkSet(set)
    local _rarity checkRarity(rarity)

    if not (_set and _rarity) then
		for _, delim in ipairs(Delims) do
			for _, split in ipairs(String._split(set, delim)) do
				if checkSet(split) then
					_set = checkSet(split)
					break
				end
			end
		end

		for _, delim in ipairs(Delims) do
			for _, split in ipairs(String._split(rarity, delim)) do
				if checkRarity(split) then
					_rarity = checkRarity(split)
					break
				end
			end
		end

		if (not _set) and (not _rarity) then return "" end
    end

    if (not _set) or _set == "" then _set = "MISSING" end
    if (not _rarity) or _rarity == "" then _rarity = "MISSING" end

	return _set.." - ".._rarity
end

p.set = makeInvokeFunc('_set')

function p._set(args, kwargs)
    ---@type string
    local set = string.lower(kwargs.set or args[1] or "")

    if checkSet(set) then return checkSet(set) end

	for _, delim in ipairs(Delims) do
		for _, split in ipairs(String._split(set, delim)) do
			if checkSet(split) then return checkSet(split) end
		end
	end

	return "UNKNOWN_SET"
end

p.rarity = makeInvokeFunc('_rarity')

function p._rarity(args, kwargs)
    ---@type string
    local rarity = string.lower(kwargs.rarity or args[1] or "")

    if checkRarity(rarity) then return checkRarity(rarity) end

	for _, delim in ipairs(Delims) do
		for _, split in ipairs(String._split(rarity, delim)) do
			if checkRarity(split) then return checkRarity(split) end
		end
	end

	return "UNKNOWN_RARITY"
end

function checkSpecial(str)
	str = string.lower(str)
    if str == "token" then
        return "Token"
    elseif str == "event" then
        return "Event"
    elseif str == "super" or str == "power" or str == "superpower" then
    	return "Superpower"
    end
    return false
end

function checkSet(set)
	if checkSpecial(set) then return checkSpecial(set) end
	if (not set) or set == "" then return false end
	for _, Set in ipairs(Sets) do
		if set == string.lower(Set.name) or set == tostring(Set.id) or set == "set"..tostring(Set.id) or set == "set-"..tostring(Set.id) or rarity == "set_"..tostring(Set.id) then return Set.name end
		for _, alias in ipairs(Set.aliases) do
			if set == string.lower(alias) then return Set.name end
		end
	end
	return false
end

function checkRarity(rarity)
	if checkSpecial(rarity) then return checkSpecial(rarity) end
	if (not rarity) or rarity == "" then return false end
	for _, Rarity in ipairs(Rarities) do
		if rarity == string.lower(Rarity.name) or rarity == tostring(Rarity.id) or rarity == "r"..tostring(Rarity.id) then return Rarity.name end
		for _, alias in ipairs(Rarity.aliases) do
			if rarity == string.lower(alias) then return Rarity.name end
		end
	end
	return false
end

Sets = {
    {
        name = "Basic",
        id = 0,
        aliases = {"Dawn"}
    },
    {
        name = "Premium",
        id = 1,
        aliases = {"Bloom"}
    },
    {
        name = "Galactic",
        id = 2,
        aliases = {"Galaxy", "Garden", "Gardens", "Galactic Gardens"}
    },
    {
        name = "Colossal",
        id = 3,
        aliases = {"Fossil", "Fossils", "Colossal Fossils"}
    },
    {
        name = "Triassic",
        id = 4,
        aliases = {"Triumph", "Triassic Triumph"}
    },
    {
        name = "Mythical",
        id = 5,
        aliases = {"Mythic", "Madness", "Mythical Madness"}
    }
}

Rarities = {
    {
        name = "Common",
        id = 0,
        aliases = {}
    },
    {
        name = "Uncommon",
        id = 1,
        aliases = {}
    },
    {
        name = "Rare",
        id = 2,
        aliases = {}
    },
    {
        name = "Super-Rare",
        id = 3,
        aliases = {"Super Rare", "SuperRare"}
    },
    {
        name = "Legendary",
        id = 4,
        aliases = {}
    },
    {
    	name = "Hero",
    	id = nil,
    	aliases = {}
    }
}

Delims = {
    "%s",
    "-",
    "|",
    ",",
    "_",
    "+"
}

return p
