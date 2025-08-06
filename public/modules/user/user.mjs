import Module from './../module.mjs'
import Context from './user-context.mjs'
import * as userHeaderList from './userHeaderList.mjs'
import * as userHeaderEdit from './userHeaderEdit.mjs'

const app = Context.app
const Crsl = Context.Crsl


export default class extends Module {
	constructor() {
		super()
	}

	async main(args={}) {
		console.log('initialising module...')
		app.setTitle('User')
		app.showFooter(true)
		
		args.autoLoadGridData = true
		
		try {
			await userHeaderList.init(self, args)
			await userHeaderEdit.init(self, args)


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

	} catch (err) {
		throw err
	}
}