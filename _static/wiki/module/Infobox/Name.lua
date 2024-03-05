return function (args, kwargs)
    local CREATE = mw.html.create
    local TS = tostring
    local TN = tonumber

    local STRING = require("Module:String")

    local BR = TS(CREATE("br"))

    PreProcess = function (s) return mw.getCurrentFrame():preprocess(s) end

    local officialName = ""
    local nativeNames = ""

    local mainName = ""

    -- collect like-args, process missing args
    local name = kwargs.name or kwargs.title
    if not require("Module:Exists")(name) then return PreProcess("{{Error|Error in {{m|Infobox name}}: {{c|\"name\"}} was not given.}}") end

    local _commonName = kwargs.common_name or kwargs.common or kwargs.cmn or kwargs.c or name
    local _officialName = kwargs.official_name or kwargs.official or kwargs.off or kwargs.o or nil

    mainName = TS(CREATE("span"):addClass("common-name"):wikitext(_commonName))

    if _officialName then officialName = BR..TS(CREATE("span"):addClass("official-name"):attr("title", "Official name"):wikitext(_officialName):css( "font-size", "small")) end

    local nativeNameChecks = {"native_name", "native", "nat", "n", "local_name", "locale", "local", "loc", "l"}
    local nativeNamesTable = {}
    for kwarg, value in pairs(kwargs) do
        for _, check in ipairs(nativeNameChecks) do
            if kwarg == check then table.insert(nativeNamesTable, value) break
            elseif kwarg:sub(1, #check) == check and TN(kwarg:sub(#check + 1, #kwarg)) then table.insert(nativeNamesTable, value) break end
        end
    end

    if #nativeNamesTable ~= 0 then
        nativeNames = CREATE("div"):addClass("native-names-wrapper"):css( "font-size", "x-small")
        for _, _name in ipairs(nativeNamesTable) do nativeNames:tag("div"):addClass("native-name"):wikitext(_name):done() end
        nativeNames = BR..TS(nativeNames:allDone())
    end

    return CREATE("header")
        :wikitext(mainName..officialName..nativeNames)
end