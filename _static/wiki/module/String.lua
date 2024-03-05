local p = {}


-- → MW objects
-- ------------------------
local frame = mw.getCurrentFrame()


-- → Invoker
-- ------------------------
local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end



-- -----------------------------
-- → Module
-- -----------------------------

-- → SPLIT
-- ------------------------

p.split = makeInvokeFunc('_split')

function p._split(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]
    local substr = kwargs.substring or kwargs.substr or kwargs["sub"] or args[2]
    local index = tonumber(kwargs.index or args[3]) or 1

    -- preprocess - unnecessary??
    -- str = frame:preprocess(str)
    -- substr = frame:preprocess(substr)

    return p.__split(str, substr, index)
end

function p.__split(str, substr, index)
    assert(str and str ~= "", "No string provided")
    assert(type(str) == "string", "Input not of type string")
    
    assert(substr and substr ~= "", "No substring provided")
    assert(type(substr) == "string", "Input not of type string")

    local sub, find = string.sub, string.find
    local insert = table.insert

    local t = {}
    local pos = 1

    while pos > 0 do
        local startOfPat, endOfPat = find(tostring(str or "") or "", substr, pos, true)

        if startOfPat then
            local substr = sub(str, pos, startOfPat - 1)
            insert(t, substr)
            pos = endOfPat + 1
        else
            local substr = sub(str, pos)
            insert(t, substr)
            pos = 0
        end
    end

    if index then return t[index] else return t end
end


-- → SPLIT FIRST
-- ------------------------

p.splitFirst = makeInvokeFunc('_splitFirst')

function p._splitFirst(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]
    local substr = kwargs.substring or kwargs.substr or kwargs["sub"] or args[2]
    local index = tonumber(kwargs.index or args[3]) or 1

    -- preprocess -- unnecessary??
    -- str = Frame:preprocess(str)
    -- substr = Frame:preprocess(substr)

    return p.__splitFirst(str, substr, index)
end

function p.__splitFirst(str, substr, index)
    assert(str and str ~= "", "No string provided")
    assert(type(str) == "string", "Input not of type string")
    
    assert(substr and substr ~= "", "No substring provided")
    assert(type(substr) == "string", "Input not of type string")

    local sub, find = string.sub, string.find

    local pos = find(str, substr, 1, true)

    if not pos then return str end

    local substr1 = sub(str, 1, pos - 1)
    local substr2 = sub(str, pos + #substr)

    local t = {substr1, substr2}

    if index then return t[index] else return t end
end


-- → SPLIT LAST
-- ------------------------

p.splitLast = makeInvokeFunc('_splitLast')

function p._splitLast(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]
    local substr = kwargs.substring or kwargs.substr or kwargs["sub"] or args[2]
    local index = tonumber(kwargs.index or args[3]) or 1

    -- preprocess -- unnecessary??
    -- str = frame:preprocess(str)
    -- substr = frame:preprocess(substr)

    return p.__splitLast(str, substr, index)
end

function p.__splitLast(str, substr, index)
    assert(str and str ~= "", "No string provided")
    assert(type(str) == "string", "Input not of type string")
    
    assert(substr and substr ~= "", "No substring provided")
    assert(type(substr) == "string", "Input not of type string")

    local sub, find, reverse = string.sub, string.find, string.reverse

    local reversedStr = reverse(str)
    local reversedsubstr = reverse(substr)
    local startPos, endPos = find(reversedStr, reversedsubstr, 1, true)

    if not startPos then return str end

    local reversedSubstr1 = sub(reversedStr, 1, startPos - 1)
    local reversedSubstr2 = sub(reversedStr, startPos + #reversedsubstr)

    local substr1 = reverse(reversedSubstr2) -- swapped
    local substr2 = reverse(reversedSubstr1) -- swapped

    local t = {substr1, substr2}

    if index then return t[index] else return t end
end


-- → TRIM
-- ------------------------

p.trim = makeInvokeFunc('_trim')

function p._trim(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]

    -- preprocess -- unnecessary??
    -- str = Frame:preprocess(str)

    return p.__trim(str)
end

function p.__trim( str )
	if not str then return "" end
    -- assert(str, "No string provided")
    -- assert(type(str) == "string", "Input not of type string")
    return str:gsub("^%s+", ""):gsub("%s+$", "")
end


-- → TRIM LEFT
-- ------------------------

p.trimLeft = makeInvokeFunc('_trimLeft')

function p._trimLeft(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]

    -- preprocess -- unnecessary??
    -- str = frame:preprocess(str)

    return p.__trimLeft(str)
end

function p.__trimLeft( str )
    assert(str, "No string provided")
    assert(type(str) == "string", "Input not of type string")
    return str:gsub("^%s+", "")
end


-- → TRIM RIGHT
-- ------------------------

p.trimRight = makeInvokeFunc('_trimRight')

function p._trimRight(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]

    -- preprocess -- unnecessary??
    -- str = frame:preprocess(str)

    return p.__trimRight(str)
end

function p.__trimRight( str )
    assert(str, "No string provided")
    assert(type(str) == "string", "Input not of type string")
    return str:gsub("%s+$", "")
end


-- → TRIM SUBSTRING
-- ------------------------

p.trimSubstring = makeInvokeFunc('_trimSubstring')

function p._trimSubstring(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]
    local substr = kwargs.substring or kwargs.substr or kwargs["sub"] or args[2]

    -- preprocess -- unnecessary??
    -- str = frame:preprocess(str)
    -- substr = frame:preprocess(substr)

    return p.__trimSubstring(str, substr)
end

function p.__trimSubstring(str, substr)
    while str:sub(1, #substr) == substr do str = str:sub(    #substr + 1) end -- trim start
    while str:sub(  -#substr) == substr do str = str:sub(1, -#substr - 1) end -- trim end
    return str
end


-- → TRIM SUBSTRING LEFT
-- ------------------------

p.trimSubstringLeft = makeInvokeFunc('_trimSubstringLeft')

function p._trimSubstringLeft(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]
    local substr = kwargs.substring or kwargs.substr or kwargs["sub"] or args[2]

    -- preprocess -- unnecessary??
    -- str = frame:preprocess(str)
    -- substr = frame:preprocess(substr)

    return p.__trimSubstringLeft(str, substr)
end

function p.__trimSubstringLeft(str, substr)
    while str:sub(1, #substr) == substr do str = str:sub(    #substr + 1) end -- trim start
    return str
end


-- → TRIM SUBSTRING RIGHT
-- ------------------------

p.trimSubstringRight = makeInvokeFunc('_trimSubstringRight')

function p._trimSubstringRight(args, kwargs)
    local str = kwargs["string"] or kwargs.str or args[1]
    local substr = kwargs.substring or kwargs.substr or kwargs["sub"] or args[2]

    -- preprocess -- unnecessary??
    -- str = frame:preprocess(str)
    -- substr = frame:preprocess(substr)

    return p.__trimSubstringRight(str, substr)
end

function p.__trimSubstringRight(str, substr)
    while str:sub(  -#substr) == substr do str = str:sub(1, -#substr - 1) end -- trim end
    return str
end


return p