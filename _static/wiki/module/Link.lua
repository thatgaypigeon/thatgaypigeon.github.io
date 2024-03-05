local p = {}

local Yesno = require("Module:Yesno")
local String = require("Module:String")
local X = require("Module:NotEmpty")

local DECODE = mw.text.decode
local CREATE = mw.html.create
local TRIM = String.__trim
local TS = tostring

local frame = mw.getCurrentFrame()
local title = mw.title.getCurrentTitle()

local arrow = frame:expandTemplate{ title = "a" }

-- → Supplementary functions
-- ------------------------

local function isValidURLTarget(url)
    -- REGEX to match a valid URL target
    local pattern = "^%a[%w+.-]*://%S+$"

    -- check if the URL matches the pattern
    return string.match(url, pattern) ~= nil
end


local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end


-- LINK (main)

p.main = makeInvokeFunc('_link')
p.l, p.link, p.linkify = p.main, p.main, p.main

function p._link(args, kwargs)
    local pageName = TRIM(kwargs.page or kwargs.pagename or kwargs.title or kwargs.pagetitle or args[1]) or ""
    local displayName = TRIM(kwargs.name or kwargs.display or kwargs.displayname or args[2]) or ""
    local sectionName = TRIM(kwargs.section or kwargs.sectionname or args[3]) or ""
    local ctx = TRIM(kwargs.ctx or args[4])
    local displayOverride = Yesno(kwargs.displaynameoverride) or Yesno(kwargs.displayoverride) or Yesno(kwargs.override)
    local noDisplayCtx = Yesno(kwargs.nodisplayctx)

    return p.__link( pageName, sectionName, displayName, ctx, displayOverride, noDisplayCtx )
end

function p.__link( __pageName, __sectionName, __displayName, __ctx, __displayOverride, __noDisplayCtx )
    -- final (output) names
    local pageName
    local sectionName
    local displayName

    -- internal names
    local _pageName
    local _sectionName
    local _displayName

    -- internal bools
    local _samePage = false

    -- internal funcs
    local finder = function ( str, substr )
    	if (type(str) ~= "string") or not X(str) then return "", "" end
    	
        local split = String.__splitFirst

        if not str:find(substr) then return "", "" end

        if str:sub(1, 1) == substr then
            return "", str:sub(2, -1)
        elseif str:sub(-1, -1) == substr then
            return str:sub(1, -2), ""
        else
            local s = split(str, substr)
            return s[1] or "", s[2] or ""
        end
    end

    if X(__pageName) then _pageName, _displayName = finder(__pageName, "|") end

    if X(_pageName) then _pageName, _sectionName = finder(_pageName, "#")
    elseif X(__pageName) then _pageName, _sectionName = finder(__pageName, "#")
    end

    if X(_pageName) then
        pageName = _pageName
    elseif X(__pageName) then
        pageName = __pageName
    else
        pageName = title.prefixedText
        _samePage = true
    end

    -- hard-coded check
    if __pageName:sub(1, 1) == "#" or __pageName:sub(1, 1) == "|" then
        pageName = title.prefixedText
        _samePage = true
    end

    if X(__sectionName) then sectionName = __sectionName else sectionName = (_sectionName or ""):gsub("/", " "..arrow.." ") or nil end
    if X(__displayName) then displayName = __displayName else displayName = _displayName end

    if not X(displayName) then
        if X(__ctx) and not X(__noDisplayCtx) then
            displayName = pageName.." ("..__ctx..")"
            _samePage = false
        else
            displayName = pageName
        end
    end

    if X(sectionName) and displayName ~= "" and not __displayOverride then
        if _samePage then
            displayName = "§"..DECODE("&nbsp;")..sectionName
        else
            displayName = displayName.." §"..DECODE("&nbsp;")..sectionName
        end
    end

    if X(__ctx) then pageName = pageName.." ("..__ctx..")" end

    local out = TRIM(pageName) or ""

    if X(sectionName) then out = out.."#"..TRIM(sectionName) end
    if X(displayName) then out = out.."|"..TRIM(displayName) end

    assert(out, "No arguments were given")

    return "[["..out.."]]"
end


-- EXTERNAL LINK

p.external = makeInvokeFunc('_externalLink')
p.e, p.ex, p.ext, p.el, p.eL, p.externalLink = p.external, p.external, p.external, p.external, p.external, p.external

function p._externalLink(args, kwargs)
    local trim = String.__trim

    local pageName = trim(kwargs.page or kwargs.link or kwargs.url or args[1]) or ""
    local displayName = trim(kwargs.name or kwargs.display or kwargs.displayname or args[2]) or ""
    local sectionName = trim(kwargs.section or kwargs.sectionname or args[3]) or ""
    local displayOverride = Yesno(kwargs.displaynameoverride) or Yesno(kwargs.displayoverride) or Yesno(kwargs.override)
    local types = string.lower(kwargs.type or "")

    return p.__externalLink( pageName, sectionName, displayName, displayOverride, types )
end

function p.__externalLink( __pageName, __sectionName, __displayName, __displayOverride, __type )
    -- final (output) names
    local pageName
    local sectionName
    local displayName

    -- internal names
    local _pageName
    local _sectionName
    local _displayName

    -- internal bools
    local _samePage = false

    -- internal funcs
    local finder = function ( str, sub )
        local split = String.__splitFirst

        if not X(str) or not str:find(sub) then return "", "" end

        if str:sub(1, 1) == sub then
            return "", str:sub(2, -1)
        elseif str:sub(-1, -1) == sub then
            return str:sub(1, -2), ""
        else
            local s = split(str, sub)
            return s[1] or "", s[2] or ""
        end
    end

    __type = __type or ""

    if __type:find("r") then __pageName = __pageName:gsub(" ", "_") end

    if X(__pageName) then _pageName, _displayName = finder(_pageName, " ") end

    if X(_pageName) then _pageName, _sectionName = finder(_pageName, "#")
    elseif X(__pageName) then _pageName, _sectionName = finder(__pageName, "#")
    end

    if X(_pageName) then
        pageName = _pageName
    elseif X(__pageName) then
        pageName = __pageName
    else
        pageName = frame:callParserFunction( 'canonicalurl', title.prefixedText )
        _samePage = true
    end

    -- hard-coded check
    if __pageName:sub(1, 1) == "#" or __pageName:sub(1, 1) == " " or __pageName:sub(1, 5) == "{{space}}" then
        pageName = frame:callParserFunction( 'canonicalurl', title.prefixedText )
        _samePage = true
    end

    if X(__sectionName) then sectionName = __sectionName else sectionName = _sectionName end
    if X(__displayName) then displayName = __displayName else displayName = _displayName end

    if not X(displayName) and not pageName:find(" ") then displayName = pageName end

    if X(sectionName) and not __displayOverride then
        if _samePage then
            displayName = "§"..DECODE("&nbsp;")..sectionName
        else
            displayName = displayName.." §"..DECODE("&nbsp;")..sectionName
        end
    end

    local out = TRIM(pageName) -- :gsub(" ", "_")) or ""

    if X(sectionName) then out = out.."#"..TRIM(sectionName) end
    if X(displayName) then out = out.." "..TRIM(displayName) end

    assert(out, "No content was given")

    local wrapper
    
    if __type:find("p") then wrapper = CREATE("span"):addClass("plainlinks") end

    if out:sub(1, 8) ~= "https://" and out:sub(1, 7) ~= "http://" then
        if __type:find("w") then
            out = mw.site.server.."/wiki/"..out
        elseif __type:find("s") then
            out = mw.site.server.."/"..out
        else
            out = "https://"..out
        end
    end
    
    assert(isValidURLTarget(String.__splitFirst(out, " ")[1]), "URL target of \""..String.__splitFirst(out, " ")[1].."\" is invalid")

    out = "["..out.."]"

    if wrapper then return TS(wrapper:wikitext(out)) end

    return out
end

return p