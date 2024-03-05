local p = {}

-- helper functions
p._String = require('Module:String')
p._split = p._String.split

function p.winrate(frame)
	local parts = p._split(frame.args[1], "-")
    local percent = 100 * parts[1] / (parts[1] + parts[2])
    local percentRounded = math.floor(percent + 0.5)
    local percentRoundedTen = 10 * math.floor((percentRounded / 10) - 0.5)

    local s = '<div class="winrate">'..parts[1]..'<span class="ghostchar ghost-002f"></span>'..parts[2]..'<span class="ghostchar ghost-0020"></span><span class="ghostchar ghost-0028"></span><span class="percent-'..percentRounded..' percentR-'..percentRoundedTen..'-'..(percentRoundedTen + 10)..'">'..percentRounded..'%</span><span class="ghostchar ghost-0029"></span></div>'

    return s
end

return p