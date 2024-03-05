local p = {}


-- → HCARD (main)
-- ------------------------

function p._hCard( frame )
    return mw.text.jsonEncode(require("Module:GetArgs")(frame, true))
end

p.main = p._hCard


return p