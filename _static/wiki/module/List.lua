local p = {}

local Yesno = require("Module:Yesno")
local String = require("Module:String")

local frame = mw.getCurrentFrame()

local function makeInvokeFunc(funcName)
	return function (frame)
		return p[funcName](require("Module:GetArgs")(frame))
	end
end

p.list = makeInvokeFunc('_list')
p.main, p.listify = p.list, p.list
function p._list(args, kwargs) return tostring( _makeUnorderedList(args, kwargs) ) end

p.plain = makeInvokeFunc('_plain')
p.plainList = p.plain
function p._plain(args, kwargs) return _makeUnorderedList(args, kwargs, 'plain-list') end

p.arrow = makeInvokeFunc('_arrow')
p.arrows, p.arrowList = p.arrow, p.arrow
function p._arrow(args, kwargs)
	if kwargs['arrow-style'] and kwargs['arrow-style'] ~= "" then return _makeUnorderedList(args, kwargs, 'arrow-list-'..kwargs['arrow-style']) end
	return _makeUnorderedList(args, kwargs, 'arrow-list')
end

p.chevron = makeInvokeFunc('_chevron')
p.chevrons, p.chevronList = p.chevron, p.chevron
function p._chevron(args, kwargs) return _makeUnorderedList(args, kwargs, 'chevron-list') end

p.triangle = makeInvokeFunc('_triangle')
p.triangles, p.triangleList = p.triangle, p.triangle
function p._triangle(args, kwargs) return _makeUnorderedList(args, kwargs, 'triangle-list') end

p.star = makeInvokeFunc('_star')
p.stars, p.starList = p.star, p.star
function p._star(args, kwargs) return _makeUnorderedList(args, kwargs, 'star-list') end

p.flower = makeInvokeFunc('_flower')
p.flowers, p.flowerList = p.flower, p.flower
function p._flower(args, kwargs) return _makeUnorderedList(args, kwargs, 'flower-list') end

p.diamond = makeInvokeFunc('_diamond')
p.diamonds, p.diamondList = p.diamond, p.diamond
function p._diamond(args, kwargs) return _makeUnorderedList(args, kwargs, 'diamond-list') end

p.heart = makeInvokeFunc('_heart')
p.hearts, p.heartList = p.heart, p.heart
function p._heart(args, kwargs) return _makeUnorderedList(args, kwargs, 'heart-list') end

p.checkbox = makeInvokeFunc('_checkbox')
p.checkboxes, p.checkboxList = p.checkbox, p.checkbox
function p._checkbox(args, kwargs) return _makeUnorderedList(args, kwargs, 'checkbox-list') end

p.tick = makeInvokeFunc('_tick')
p.ticks, p.tickList = p.tick, p.tick
function p._tick(args, kwargs) return _makeUnorderedList(args, kwargs, 'tick-list') end

p.alphabetical = makeInvokeFunc('_alphabetical')
p.alpha, p.alphabeticalList = p.alphabetical, p.alphabetical
function p._alphabetical(args, kwargs) return _makeOrderedList(args, kwargs, 'alphabetical-list') end

p.greek = makeInvokeFunc('_greek')
p.greekList = p.greek
function p._greek(args, kwargs) return _makeOrderedList(args, kwargs, 'greek-list') end

p.latin = makeInvokeFunc('_latin')
p.latinList = p.latin
function p._latin(args, kwargs) return _makeOrderedList(args, kwargs, 'latin-list') end

p.horizontal = makeInvokeFunc('_horizontal')
p.horizontalList = p.horizontal
function p._horizontal(args, kwargs) return _makeUnorderedList(args, kwargs, 'horizontal-list') end

p.inline = makeInvokeFunc('_inline')
p.inlineList = p.inline
function p._inline(args, kwargs) return _makeUnorderedList(args, kwargs, 'inline-list') end

p.column = makeInvokeFunc('_column')
p.columns, p.columnList = p.column, p.column
function p._column(args, kwargs) return _makeOrderedList(args, kwargs, 'column-list') end

p.custom = makeInvokeFunc('_custom')
p.columnList = p.custom
function p._custom(args, kwargs) return _makeUnorderedList(args, kwargs, 'custom-list') end

-- Inner functions
function _makeList(args, kwargs, _type, _class)
	local styles = frame:preprocess( tostring( mw.html.create( 'templatestyles', { selfClosing = true } ):attr( 'src', 'Template:List/styles.css' ) ) )
	local list = require("Module:HTML")._html(mw.html.create( _type or 'ul' ):addClass( _class ), kwargs)
    for _, arg in ipairs(args) do list:node(tostring(mw.html.create('li'):wikitext(arg))):done() end
	return tostring(styles).."\n"..tostring(list)
end

function _makeOrderedList(args, kwargs, _class) return _makeList(args, kwargs, 'ol', _class) end
function _makeUnorderedList(args, kwargs, _class) return _makeList(args, kwargs, 'ul', _class) end

return p
