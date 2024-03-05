local p = {}

local X = require("Module:Exists")

local CREATE = mw.html.create
local TS = tostring

local function makeInvokeFunc(funcName)
    return function (frame)
        local args, kwargs = require("Module:GetArgs")(frame)
        PreProcess = function( s ) return frame:preprocess( s ) end
        return p[funcName](args, kwargs)
    end
end


-- REF (main)

p.main = makeInvokeFunc('_ref')
p.reference, p.ref, p.r = p.main, p.main, p.main

function p._ref(args, kwargs)
    local content = kwargs.reference or kwargs.ref or kwargs.r or args[1]
    assert(content, "No content was given")
    
    local group = kwargs.group or kwargs.g
    local name = kwargs.name or kwargs.n
    
    local src = kwargs.source or kwargs.src or kwargs.s
    local url = kwargs.url or kwargs.u or kwargs.link or kwargs.l
    local section = kwargs.url_section or kwargs.section or kwargs.sect
    
    local ref = CREATE("ref")
    if group then ref:attr("group", group) end
    if name then ref:attr("name", name) end

    return p.__ref( ref, content, src, url, section )
end

function p.__ref( __ref, __content, __src, __url, __section )
	__ref:wikitext(__content)
	-- if __url then __ref:wikitext(require("Module:Link").__externalLink( __url, __section, "\""..__content.."\"" )) end
	return PreProcess(TS(__ref))
end


return p