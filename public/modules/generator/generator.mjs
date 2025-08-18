import Module from './../module.mjs'
import Context from './generator-context.mjs'
import * as generatorList from './generatorList.mjs'
import * as generatorEdit from './generatorEdit.mjs'
import * as generatorExtender from './generator-ext.mjs'

const app = Context.app
const Crsl = Context.Crsl


export default class extends Module {
	constructor() {
		super()
	}

	async main(args={}) {
		
		console.log('initializing module...')
		app.setTitle('Generator')
		app.showFooter(true)
		
		args.autoLoadGridData = true

		const self = this

		// self.Extender untuk meampung fungsi-fungsi dalam generator-ext.mjs
		self.Extender = {}

		// module-module yang di load perlu di pack dulu ke dalam variable
		// jangan import lagi module-module ini di dalam mjs tersebut
		// karena akan terjadi cyclic redudancy pada saat di rollup
		self.Modules = {
			generatorList,
			generatorEdit,
			generatorExtender
		}

		try {
			
			// inisiasi sisi server
			const apiGen = new $fgta5.ApiEndpoint('/generator/init')
			try {
				const result = await apiGen.execute({ })
				console.log(result)
			} catch (err) {
				throw err
			} finally {
				apiGen.dispose()
			}


			await Promise.all([
				generatorList.init(self, args),
				generatorEdit.init(self, args),
				generatorExtender.init(self, args)
			])

			// render dan setup halaman
			await render(self)


			// setup web socket
			const userId = 'u001';
			const ws = new WebSocket(`ws://localhost:8080/?userId=${userId}`);

			ws.onmessage = (event) => {
				const { jobId, status } = JSON.parse(event.data);
				console.log(`Job ${jobId} status: ${status}`);
			};

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

		// generator-ext.mjs, export function extendPage(self) {} 
		// jangan exekusi langsung dari userExtender, karena akan error saat di rollup
		const extendPage = self.Modules.generatorExtender.extendPage
		if (typeof extendPage === 'function') {
			extendPage(self)
		} else {
			console.warn(`'extendPage' tidak diimplementasikan di extender`)
		}

	} catch (err) {
		throw err
	}
}