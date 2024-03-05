local p = {}

local X = require("Module:Exists")
local NAME = require("Module:Infobox/Name")

local function makeInvokeFunc(funcName)
    return function (frame)
        local args, kwargs = require("Module:GetArgs")(frame)
        PreProcess = function( s ) return frame:preprocess( s ) end
        return p[funcName](args, kwargs)
    end
end


-- INFOBOX (main)

p.infobox = makeInvokeFunc('_infobox')
p.main = p.infobox

function p._infobox(args, kwargs)
    if kwargs.type == "band" then return p._band_infobox(args, kwargs)
    elseif kwargs.type == "orchestra" then return p._orchestra_infobox(args, kwargs)
    else return p._musician_infobox(args, kwargs) end
end

function p._musician_infobox(args, kwargs)
    -- collect like-args, process missing args
    local name = kwargs.name or kwargs.title

    if not X(name) then return PreProcess("{{Error|Error in {{c|Module:Musical artist infobox}}: {{c|\"name\"}} was not given.}}") end


    local infobox = mw.html.create("infobox")
        :attr("type", "musician")
        :node(NAME(args, kwargs))
    local wrapper = mw.html.create("div")
        :attr("class", "infobox-wrapper infobox-musical-artist infobox-musician")
        :wikitext(PreProcess(tostring(infobox)))
    return tostring(wrapper)
end


return p