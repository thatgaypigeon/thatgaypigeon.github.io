local p = {}

function p.rating(frame)
    ---@type number
    local score = tonumber(frame.args[1]) or 0

    ---@type number
    local total

    ---@type number
    local pseudo_total
    
    ---@type boolean
    local special = false

    if score <= 5 then
        pseudo_total = 5
    elseif score <= 10 then
        pseudo_total = 10
    else
        pseudo_total = math.floor(score + 0.5)
    end

    total = tonumber(frame.args[2]) or pseudo_total

    if frame.args[3] == "special" or frame.args.special == "yes" then
        special = true
    end

    if score <= total then
        local stars = {}

        if score % 1 == 0 then
            for i = score, 1, -1
            do
                table.insert(stars, '<span class="rating-star rating-star-full"></span>')
            end

            for i = (total - score), 1, -1
            do
                table.insert(stars, '<span class="rating-star rating-star-empty"></span>')       
            end
        else
            for i = score, 1, -1
            do
                table.insert(stars, '<span class="rating-star rating-star-full"></span>')
            end

            table.insert(stars, '<span class="rating-star rating-star-half"></span>')

            for i = (total - score) - 1, 1, -1
            do
                table.insert(stars, '<span class="rating-star rating-star-empty"></span>')       
            end
        end
        
        local str_score = string.gsub(tostring(score), '%.', '-')
        local str_total = string.gsub(tostring(total), '%.', '-')

        if special then
            table.insert(stars, 1, '<span class="rating rating-special rating-score-'..str_score..' rating-outof-'..str_total..'">')
        else
            table.insert(stars, 1, '<span class="rating rating-score-'..str_score..' rating-outof-'..str_total..'">')
        end
        table.insert(stars, '</span>')

        return table.concat(stars, "")
    else
        return "Error in [[Template:Rating]]!"
    end    
end

return p