import Module from './../module.mjs'


const app = new $fgta5.Application('mainapp')
const urlDir = 'public/modules/user'
const Context = {
	Application: app,
	Sections: {
		userHeaderList: {sectionId:'userHeaderList-section', html:`${urlDir}/userHeaderList.html`, mjs:'userHeaderList.mjs'},
		userHeaderEdit: {sectionId:'userHeaderEdit-section', html:`${urlDir}/userHeaderEdit.html`, mjs:'userHeaderEdit.mjs'},
		Extender: {sectionId:'extender-templates', html:`${urlDir}/user-ext.html`, mjs:'user-ext.mjs'},
	},
	Modules: null
}

export const HEADERLIST = 'userHeaderList'
export const HEADEREDIT = 'userHeaderEdit'
export const Extender = 'Extender'

export default class extends Module {
	constructor() {
		super()
		this.Context = Context
		this.import = async (mjs) => {
			return await import(`./${mjs}`) 
		}
	}

	async main(args={}) {
		console.log('initialising module...')
		app.setTitle('User')
		app.showFooter(true)
		
		args.autoLoadGridData = true
		
		try {
			
			
			// include semua halaman yang dibutuhkan
			await this.loadSections(Context.Sections)

			// load and init modules
			Context.Crsl = new $fgta5.SectionCarousell(app.Nodes.Main) 
			await this.loadModules(Context.Sections, args)

			// render dan setup halaman
			await render(this)

		} catch (err) {
			throw err
		}
	}

}

async function render(self) {
	try {
		const footerButtonsContainer =  document.getElementsByClassName('footer-buttons-container')
		self.renderFooterButtons(footerButtonsContainer)
	
		Context.Crsl.addEventListener($fgta5.SectionCarousell.EVT_SECTIONSHOWING, (evt)=>{
			var sectionId = evt.detail.commingSection.Id
			for (let cont of footerButtonsContainer) {
				var currContainerSectionId = cont.getAttribute('data-section')
				if (currContainerSectionId==sectionId) {
					setTimeout(()=>{
						cont.classList.remove('hidden')
						cont.style.animation = 'dropped 0.3s forwards'
						setTimeout(()=>{
							cont.style.animation = 'unset'	
						}, 300)
					}, 500)
				} else {
					cont.classList.add('hidden')
				}
			}
		})

		for (var modulename in Context.Modules) {
			var module = Context.Modules[modulename]
			if (typeof module.render ==='function') {
				module.render(self)
			}
		}
	} catch (err) {
		throw err
	}
}