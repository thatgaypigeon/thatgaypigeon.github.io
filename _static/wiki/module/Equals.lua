return function( param, checks )
    if type(checks) ~= "table" then return false end
    for _, item in ipairs(checks) do if param == item then return true end end
    return false
end