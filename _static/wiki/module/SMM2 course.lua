local p = {}

local Yesno = require("Module:Yesno")
local String = require("Module:String")
local X = require("Module:Exists")

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
    -- collect like-args, process missing args
    local name = kwargs.name or kwargs.title
    if not X(name) then return PreProcess("{{Error|Error in {{m|SSM2 course}}: {{c|\"name\"}} was not given.}}") end

    local id = kwargs.id or kwargs.course_id
    if not X(id) then return PreProcess("{{Error|Error in {{m|SSM2 course}}: {{c|\"id\"}} was not given.}}") end

    local author = kwargs.author or kwargs.maker or kwargs.creator
    if not X(author) then return PreProcess("{{Error|Error in {{m|SSM2 course}}: {{c|\"author\"}} was not given.}}") end


    local infobox = mw.html.create("infobox")
        :attr("type", "smm2-course")
        :tag("data"):tag("default"):wikitext(name):allDone()
        :tag("data"):tag("default"):wikitext(id):allDone()
        :tag("data"):tag("default"):wikitext(author):allDone()
    local wrapper = mw.html.create("div")
        :attr("class", "infobox-wrapper special-infobox infobox-smm2-course")
        :wikitext(PreProcess(tostring(infobox)))
    return tostring(wrapper)
end


-- ID

p.id = makeInvokeFunc('_id')

function p._id(args, kwargs)
	local id = args[1] or kwargs.id

	id = tostring(id):gsub('%W', '') -- remove non-alphanumeric characters
	
	if #id ~= 9 then
		id = string.rep("?", (9))
		-- return PreProcess("{{Error|Error in {{m|SSM2 course}}: {{c|\"id\"}} is invalid.}}")
	end
	
	local idSep = tostring(mw.html.create("span"):attr("class", "id-sep"):wikitext("-"))
	
	return (id:sub(1, 3) or "???")..idSep..(id:sub(4, 6) or "???")..idSep..(id:sub(7, 9) or "???")
end

return p