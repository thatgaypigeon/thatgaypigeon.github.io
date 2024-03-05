local p = {}

local X = require("Module:Exists")

local CREATE = mw.html.create

local function makeInvokeFunc(funcName)
    return function (frame)
        local args, kwargs = require("Module:GetArgs")(frame)
        PreProcess = function( s ) return frame:preprocess( s ) end
        return p[funcName](args, kwargs)
    end
end


-- NAME (main) 

p.main = makeInvokeFunc('_name')
p.name = p.main

function p._name(args, kwargs)
    local name = kwargs.common_name or kwargs.common or kwargs.cmn or kwargs.c or kwargs.name or kwargs.n or args[1]
    assert(name, "\"name\" was not given")

    local out = CREATE(kwargs.wrapper or kwargs.wrap or kwargs.w or "div")
        :addClass("name-wrapper")
        :tag("span")
            :addClass("name")
            :wikitext(name)
            :done()

    -- local officialName = kwargs.official_name or kwargs.official or kwargs.off or kwargs.o or nil
    -- if X(officialName) then out
    --     :tag("span")
    --         :addClass("official-name")
    --         :wikitext(officialName)
    --         :done()
    -- end

    ProcessRomanised(kwargs, out)
    ProcessTranslated(kwargs, out)

    return tostring(out)
end


-- → Supplementary functions
-- ------------------------

function ProcessTable(inputTable)
    -- remove duplicates
    local uniqueValues, resultTable = {}, {}
    local hasEmptyString = false
    for _, value in ipairs(inputTable) do
        -- convert to number
        local numericValue = tonumber(value)
        if value == "" and not hasEmptyString then
            hasEmptyString = true
        elseif numericValue and not uniqueValues[numericValue] then
            uniqueValues[numericValue] = true
            table.insert(resultTable, numericValue)
        end
    end
    -- sort
    table.sort(resultTable)
    -- create return table 
    local out = {}
    if hasEmptyString then table.insert(out, "") end
    -- convert items to string
    for _, value in ipairs(resultTable) do table.insert(out, tostring(value)) end
    -- output
    return out
end

function ProcessRomanised(kwargs, out)
    local checks = {"romanised_name", "romanized_name", "romanised", "romanized", "rom", "r"}
    local names = {}
    for kwarg, _ in pairs(kwargs) do
        for _, check in ipairs(checks) do
            if kwarg == check then table.insert(names, "") break
            elseif kwarg:sub(1, #check) == check and tonumber(kwarg:sub(#check + 1, #kwarg)) then table.insert(names, kwarg:sub(#check + 1, #kwarg)) break end
        end
    end

    if #names ~= 0 then
        local nchecks = {"romanisation", "romanization", "romn", "rn"}
        names = ProcessTable(names)
        local romanisations = CREATE("div"):addClass("romanisations-list mw-collapsible-content")
        for _, x in ipairs(names) do
            for _, check in ipairs(checks) do
                if X(kwargs[check..x]) then
                    local romanisedName = kwargs[check..x]
                    local romanisation
                    for _, ncheck in ipairs(nchecks) do
                        if not romanisation then romanisation = kwargs[ncheck..x] or nil break end
                    end
                    romanisations:tag("div")
                        :addClass("romanisation romanisation-"..x)
                        :tag("span")
                            :addClass("romanisation-marker")
                            :wikitext(romanisation or "")
                            :done()
                        :tag("span")
                            :addClass("romanisation-content")
                            :wikitext(romanisedName)
                            :done()
                        :done()
                break
                end
            end
        end
        local wrapper = CREATE("div")
            :addClass("romanisations-wrapper mw-collapsible mw-collapsed")
            :tag("div"):wikitext("Romanisations"):done()
            :node(romanisations:allDone())
        out:node(wrapper):allDone()
    end
end

function ProcessTranslated(kwargs, out)
    local checks = {"translated_name", "translated", "translate", "trans", "tra", "tr", "t"}
    local names = {}
    for kwarg, _ in pairs(kwargs) do
        for _, check in ipairs(checks) do
            if kwarg == check then table.insert(names, "") break
            elseif kwarg:sub(1, #check) == check and tonumber(kwarg:sub(#check + 1, #kwarg)) then table.insert(names, kwarg:sub(#check + 1, #kwarg)) break end
        end
    end

    if #names ~= 0 then
        local nchecks = {"translation", "trn", "tn"}
        names = ProcessTable(names)
        local translations = CREATE("div"):addClass("translations-list mw-collapsible-content")
        for _, x in ipairs(names) do
            for _, check in ipairs(checks) do
                if X(kwargs[check..x]) then
                    local name = kwargs[check..x]
                    local translation
                    for _, ncheck in ipairs(nchecks) do
                        if not translation then translation = kwargs[ncheck..x] or nil break end
                    end
                    translations:tag("div")
                        :addClass("translation translation-"..x)
                        :tag("span")
                            :addClass("translation-marker")
                            :wikitext(translation or "")
                            :done()
                        :tag("span")
                            :addClass("translation-content")
                            :wikitext(name)
                            :done()
                        :done()
                break
                end
            end
        end
        local wrapper = CREATE("div")
            :addClass("translations-wrapper mw-collapsible mw-collapsed")
            :tag("div"):wikitext("Translations"):done()
            :node(translations:allDone())
        out:node(wrapper):allDone()
    end
end

return p