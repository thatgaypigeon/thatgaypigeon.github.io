local p = {}

function p._html(element, kwargs)
	if kwargs.id then element:attr('id', kwargs.id) end
	if kwargs.class then element:addClass(kwargs.class) end
	if kwargs.style then element:cssText(kwargs.style) end
	return element
end

return p