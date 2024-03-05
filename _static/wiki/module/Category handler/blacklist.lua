-- This module contains the blacklist used by [[Module:Category handler]].
-- Pages that match Lua patterns in this list will not be categorised unless
-- categorisation is explicitly requested.

return {
	'^Main Page$', -- don't categorise the main page.

	-- Don't categorise the following pages or their subpages.
	-- "%f[/\0]" matches if the next character is "/" or the end of the string.
	'^Wikipedia:Cascade%-protected items%f[/\0]',
	'^User:UBX%f[/\0]', -- The userbox "template" space.
	'^User talk:UBX%f[/\0]',

	-- Don't categorise subpages of these pages, but allow
	-- categorisation of the base page.
	'^Wikipedia:Template index/.*$',

	-- Don't categorise archives.
	'/[aA]rchive',
	"^Wikipedia:Administrators' noticeboard/IncidentArchive%d+$",
}