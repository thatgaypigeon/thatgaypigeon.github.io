local p = {}

local Yesno = require("Module:Yesno")
local String = require("Module:String")

local function makeInvokeFunc(funcName)
	return function (frame)
		return p[funcName](require("Module:GetArgs")(frame))
	end
end

p.glossary = makeInvokeFunc('_glossary')
p.main, p.glossary = p.glossary, p.glossary

function p._glossary(args, kwargs)
    local glossary = require("Module:HTML")._html(mw.html.create( 'dl' ):addClass( 'glossary' ), kwargs)
    if kwargs.header then glossary:node(  tostring( mw.html.create( 'span' ):addClass( 'glossary-header' ):wikitext( kwargs.header ) ) ):done() end
    glossary:wikitext( table.concat(args, "") )
	return tostring( glossary )
end

p.term = makeInvokeFunc('_term')

function p._term(args, kwargs)
	local term = require("Module:HTML")._html(mw.html.create( 'dt' ):wikitext( args[1] ), kwargs)
	table.remove(args, 1)
	for _, def in ipairs(args) do term:node( tostring( mw.html.create( 'dd' ):wikitext( def ) ) ):done() end
	return tostring( term )
end

return p