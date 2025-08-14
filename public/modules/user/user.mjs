import Module from './../module.mjs'
import Context from './user-context.mjs'
import * as userHeaderList from './userHeaderList.mjs'
import * as userHeaderEdit from './userHeaderEdit.mjs'
import * as userExtender from './user-ext.mjs'

const app = Context.app
const Crsl = Context.Crsl


export default class extends Module {
	constructor() {
		super()
	}

	async main(args={}) {
		
		console.log('initializing module...')
		app.setTitle('User')
		app.showFooter(true)
		
		args.autoLoadGridData = true

		const self = this

		// self.Extender untuk meampung fungsi-fungsi dalam user-ext.mjs
		self.Extender = {}

		// module-module yang di load perlu di pack dulu ke dalam variable
		// jangan import lagi module-module ini di dalam mjs tersebut
		// karena akan terjadi cyclic redudancy pada saat di rollup
		self.Modules = {
			userHeaderList,
			userHeaderEdit,
			userExtender
		}

		try {
			
			await Promise.all([
				userHeaderList.init(self, args),
				userHeaderEdit.init(self, args),
				userExtender.init(self, args)
			])

			// render dan setup halaman
			await render(self)

		} catch (err) {
			throw err
		}
	}

}

async function render(self) {
	try {
		const footerButtonsContainer =  document.getElementsByClassName('footer-buttons-container')
		self.renderFooterButtons(footerButtonsContainer)
	
		Crsl.addEventListener($fgta5.SectionCarousell.EVT_SECTIONSHOWING, (evt)=>{
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

		// user-ext.mjs, export function extendPage(self) {} 
		// jangan exekusi langsung dari userExtender, karena akan error saat di rollup
		const extendPage = self.Modules.userExtender.extendPage
		if (typeof extendPage === 'function') {
			extendPage(self)
		} else {
			console.warn(`'extendPage' tidak diimplementasikan di extender`)
		}

	} catch (err) {
		throw err
	}
}