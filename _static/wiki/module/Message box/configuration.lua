--------------------------------------------------------------------------------
--                          Message box configuration                         --
--                                                                            --
-- This module contains configuration data for [[Module:Message box]].        --
--------------------------------------------------------------------------------

return {
	ambox = {
		types = {
			speedy = {
				class = 'ambox-speedy',
				image = 'Ambox warning pn.svg'
			},
			delete = {
				class = 'ambox-delete',
				image = 'Ambox warning pn.svg'
			},
			content = {
				class = 'ambox-content',
				image = 'Ambox important.svg'
			},
			style = {
				class = 'ambox-style',
				image = 'Edit-clear.svg'
			},
			move = {
				class = 'ambox-move',
				image = 'Merge-split-transwiki default.svg'
			},
			protection = {
				class = 'ambox-protection',
				image = 'Semi-protection-shackle-keyhole.svg'
			},
			notice = {
				class = 'ambox-notice',
				image = 'Information icon4.svg'
			}
		},
		default                     = 'notice',
		allowBlankParams            = {'talk', 'sect', 'date', 'issue', 'fix', 'subst', 'hidden'},
		allowSmall                  = true,
		smallParam                  = 'left',
		smallClass                  = 'mbox-small-left',
		substCheck                  = true,
		classes                     = {'metadata', 'ambox'},
		imageEmptyCell              = true,
		imageCheckBlank             = true,
		imageSmallSize              = '20x20px',
		imageCellDiv                = true,
		useCollapsibleTextFields    = true,
		imageRightNone              = true,
		sectionDefault              = 'article',
		allowMainspaceCategories    = true,
		templateCategory            = 'Article message templates',
	        templateCategoryRequireName = true,
		templateErrorCategory       = 'Article message templates with missing parameters',
		templateErrorParamsToCheck  = {'issue', 'fix', 'subst'},
		removalNotice               = '<small>[[Help:Maintenance template removal|Learn how and when to remove this template message]]</small>',
		templatestyles              = 'Module:Message box/ambox.css'
	},
	
	cmbox = {
		types = {
			speedy = {
				class = 'cmbox-speedy',
				image = 'Ambox warning pn.svg'
			},
			delete = {
				class = 'cmbox-delete',
				image = 'Ambox warning pn.svg'
			},
			content = {
				class = 'cmbox-content',
				image = 'Ambox important.svg'
			},
			style = {
				class = 'cmbox-style',
				image = 'Edit-clear.svg'
			},
			move = {
				class = 'cmbox-move',
				image = 'Merge-split-transwiki default.svg'
			},
			protection = {
				class = 'cmbox-protection',
				image = 'Semi-protection-shackle-keyhole.svg'
			},
			notice = {
				class = 'cmbox-notice',
				image = 'Information icon4.svg'
			}
		},
		default              = 'notice',
		showInvalidTypeError = true,
		classes              = {'cmbox'},
		imageEmptyCell       = true,
		templatestyles       = 'Module:Message box/cmbox.css'
	},
	
	fmbox = {
		types = {
			warning = {
				class = 'fmbox-warning',
				image = 'Ambox warning pn.svg'
			},
			editnotice = {
				class = 'fmbox-editnotice',
				image = 'Information icon4.svg'
			},
			system = {
				class = 'fmbox-system',
				image = 'Information icon4.svg'
			}
		},
		default              = 'system',
		showInvalidTypeError = true,
		classes              = {'fmbox'},
		imageEmptyCell       = false,
		imageRightNone       = false,
		templatestyles       = 'Module:Message box/fmbox.css'
	},
	
	imbox = {
		types = {
			speedy = {
				class = 'imbox-speedy',
				image = 'Ambox warning pn.svg'
			},
			delete = {
				class = 'imbox-delete',
				image = 'Ambox warning pn.svg'
			},
			content = {
				class = 'imbox-content',
				image = 'Ambox important.svg'
			},
			style = {
				class = 'imbox-style',
				image = 'Edit-clear.svg'
			},
			move = {
				class = 'imbox-move',
				image = 'Merge-split-transwiki default.svg'
			},
			protection = {
				class = 'imbox-protection',
				image = 'Semi-protection-shackle-keyhole.svg'
			},
			license = {
				class = 'imbox-license licensetpl',
				image = 'Imbox license.png' -- @todo We need an SVG version of this
			},
			featured = {
				class = 'imbox-featured',
				image = 'Cscr-featured.svg'
			},
			notice = {
				class = 'imbox-notice',
				image = 'Information icon4.svg'
			}
		},
		default              = 'notice',
		showInvalidTypeError = true,
		classes              = {'imbox'},
		imageEmptyCell       = true,
		below                = true,
		templateCategory     = 'File message boxes',
		templatestyles       = 'Module:Message box/imbox.css'
	},
	
	ombox = {
		types = {
			speedy = {
				class = 'ombox-speedy',
				image = 'Ambox warning pn.svg'
			},
			delete = {
				class = 'ombox-delete',
				image = 'Ambox warning pn.svg'
			},
			content = {
				class = 'ombox-content',
				image = 'Ambox important.svg'
			},
			style = {
				class = 'ombox-style',
				image = 'Edit-clear.svg'
			},
			move = {
				class = 'ombox-move',
				image = 'Merge-split-transwiki default.svg'
			},
			protection = {
				class = 'ombox-protection',
				image = 'Semi-protection-shackle-keyhole.svg'
			},
			notice = {
				class = 'ombox-notice',
				image = 'Information icon4.svg'
			}
		},
		default              = 'notice',
		showInvalidTypeError = true,
		classes              = {'ombox'},
		allowSmall           = true,
		imageEmptyCell       = true,
		imageRightNone       = true,
		templatestyles       = 'Module:Message box/ombox.css'
	},
	
	tmbox = {
		types = {
			speedy = {
				class = 'tmbox-speedy',
				image = 'Ambox warning pn.svg'
			},
			delete = {
				class = 'tmbox-delete',
				image = 'Ambox warning pn.svg'
			},
			content = {
				class = 'tmbox-content',
				image = 'Ambox important.svg'
			},
			style = {
				class = 'tmbox-style',
				image = 'Edit-clear.svg'
			},
			move = {
				class = 'tmbox-move',
				image = 'Merge-split-transwiki default.svg'
			},
			protection = {
				class = 'tmbox-protection',
				image = 'Semi-protection-shackle-keyhole.svg'
			},
			notice = {
				class = 'tmbox-notice',
				image = 'Information icon4.svg'
			}
		},
		default              = 'notice',
		showInvalidTypeError = true,
		classes              = {'tmbox'},
		allowSmall           = true,
		imageRightNone       = true,
		imageEmptyCell       = true,
		templateCategory     = 'Talk message boxes',
		templatestyles       = 'Module:Message box/tmbox.css'
	}
}