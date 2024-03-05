local p = {}
function p.count(frame)
    local _, n = frame.args[1]:gsub(frame.args[2]," ")
    return n
end
return p