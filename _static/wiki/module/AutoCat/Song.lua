local p = {}

local GetArgs = require("Module:GetArgs")
local Yesno = require("Module:Yesno")
local String = require("Module:String")

local function makeInvokeFunc(funcName)
	return function (frame)
		args, kwargs = GetArgs(frame)
		return p[funcName](args, kwargs)
	end
end

p.artist = makeInvokeFunc('_artist')

function p._artist(args, kwargs)
    local artists = args[1]
    local nocat = kwargs.nocat
    local delim = kwargs.delim or ", "
    
    local list = {}
    
    for artist in string.gmatch(artists, "([^"..",".."]+)") do
    	 table.insert(list, artist.."[[Category:Songs by "..artist.."]]")
    end

	return kwargs.mw_frame:expandTemplate{ title = "hlist", args = list }
end

return p