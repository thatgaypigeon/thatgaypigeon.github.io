return function ( param )
    if param == nil then return false end
    
    if type(param) == "boolean" then return param       end
    if type(param) == "number"  then return param ~= 0  end
    if type(param) == "string"  then return param ~= "" end
    if type(param) == "table"   then return param ~= {} end

    return false
end