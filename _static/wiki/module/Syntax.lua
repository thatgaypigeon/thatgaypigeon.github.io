local p = {}


-- → Imports
-- ------------------------
local Yesno = require("Module:Yesno")
local X = require("Module:NotEmpty")
local String = require("Module:String")
local Link = require("Module:Link").__link


-- → Shortcuts
-- ------------------------
local CREATE = mw.html.create
local DECODE = mw.text.decode
local TS = tostring

local TRIMLEFT = String.__trimSubstringLeft

local bk1 = "<span class='bk'>{{</span>"
local bk2 = "<span class='bk'>}}</span>"
local htg = "<span class='ht'>#</span>"
local inv = "<span class='n'>invoke</span>"
local cln = "<span class='dm'>:</span>"
local bar = "<span class='dm'>&#124;</span>"
local eqs = "<span class='eq'>=</span>"

-- → MW Objects
-- ------------------------
local frame = mw.getCurrentFrame()


-- → Invoker
-- ------------------------
local function makeInvokeFunc(funcName) return function (frame) return p[funcName](require("Module:GetArgs")(frame)) end end



-- -----------------------------
-- → Module
-- -----------------------------


-- → (Main)
-- ------------------------

-- NOTE: not completed
-- p.main = makeInvokeFunc('_syntax')
-- p.syntax = p.main

-- function p._syntax(args, kwargs)
--     return "<code>"..table.concat(args, "").."</code>"
-- end


-- → Template
-- ------------------------
p.template = makeInvokeFunc('_template')
p.t, p.templateSyntax = p.template, p.template

function p._template(args, kwargs)
	local template = TRIMLEFT(table.remove(args, 1) or "", "Template:") or ""
	local isTemplate
	
	if template == "" then
		isTemplate = false
	else
		isTemplate = true
		template = "<span class='n'>"..template.."</span>"
	end
    
    -- add args
    for _, arg in pairs(args) do template = template..bar..arg end
    
	-- add kwargs
	if (not isTemplate) and #kwargs == 1 then for kwarg, value in pairs(kwargs) do template = template.."<span class='kw'>"..kwarg.."</span>"..eqs..value end
	else for kwarg, value in pairs(kwargs) do template = template..bar.."<span class='kw'>"..kwarg.."</span>"..eqs..value end
	end
	
	if isTemplate then template = bk1..template..bk2 end
	
	-- wrap
	template = "<code class='syntax template-syntax'>"..template.."</code>"
	
	return template
end

p.templateLink = makeInvokeFunc('_templateLink')
p.tl, p.templateSyntaxLink = p.templateLink, p.templateLink

function p._templateLink(args, kwargs)
	args[1] = Link("Template:"..args[1], nil, args[1])
	return p._template(args, kwargs)
end


-- → Module
-- ------------------------
p.module = makeInvokeFunc('_module')
p.m, p.moduleSyntax = p.module, p.module

function p._module(args, kwargs)
	local _module = TRIMLEFT(table.remove(args, 1) or "", "Module:") or ""
	local isModule
	
	if _module and _module ~= "" then
		isModule = true
		_module = "<span class='n'>".._module.."</span>"
	else
		isModule = false
		_module = ""
	end
    
    -- add args
    for _, arg in pairs(args) do _module = _module..bar..arg end
    
	-- add kwargs
    for kwarg, value in pairs(kwargs) do
    	if kwarg ~= "mw_frame" then _module = _module..bar.."<span class='kw'>"..kwarg.."</span>"..eqs..value end
    end
    
	if isModule then _module = bk1..htg..inv..cln.._module..bk2 end
	
	-- wrap
	_module = "<code class='syntax module-syntax'>".._module.."</code>"

	return _module
end

p.moduleLink = makeInvokeFunc('_moduleLink')
p.ml, p.moduleSyntaxLink = p.moduleLink, p.moduleLink

function p._moduleLink(args, kwargs)
	args[1] = Link("Module:"..args[1], nil, args[1])
	return p._module(args, kwargs)
end


return p