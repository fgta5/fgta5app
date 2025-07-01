import Module from './../module.mjs'
import * as userHeaderEdit from './userHeaderEdit.mjs'
import * as userHeaderList from './userHeaderList.mjs'

const app = new $fgta5.Application('user')
const Carousell = $fgta5.SectionCarousell
const currentUrlDir = 'public/modules/user'
const MOD = {
	SECTION: {
		HEADERLIST : 'userHeaderList',
		HEADEREDIT : 'userHeaderEdit',
	},
	userHeaderList: document.getElementById('userHeaderList'),
	userHeaderEdit: document.getElementById('userHeaderEdit'),

	userHeaderEditForm: null // disini belum ada karena halaman belum di fetch
}

export default class userBase extends Module {
	
	get MOD() { return MOD }
	get Application() { return app }
	
	async main(args) {
		app.SetTitle('User')
		await render(this)

		userHeaderEdit.handleHeaderEvents(this)
	}

	async btnHeaderNew_click(evt) { await userHeaderEdit.btnHeaderNew_click(this, evt) }
	async btnHeaderSave_click(evt) { await userHeaderEdit.btnHeaderSave_click(this, evt) }
	async btnHeaderDelete_click(evt) { await userHeaderEdit.btnHeaderDelete_click(this, evt) }
	async btnHeaderEdit_click(evt) { await userHeaderEdit.btnHeaderEdit_click(this, evt) }
}

async function render(self) {
	// inlcude halaman
	const [headerList, headerEdit] = await Promise.all([
		Module.GetContent(`${currentUrlDir}/userHeaderList.html`),
		Module.GetContent(`${currentUrlDir}/userHeaderEdit.html`),
	]);
	MOD.userHeaderList.innerHTML = headerList
	MOD.userHeaderEdit.innerHTML = headerEdit

	MOD.userHeaderEditForm = new $fgta5.Form('userHeaderEditForm');

	setupCarousell(self)
}


async function setupCarousell(self) {
	const floatingButtonAll = document.getElementsByClassName('floating-button') 
	MOD.Crsl = new Carousell(app.Nodes.Main) 
	MOD.Crsl.addEventListener(Carousell.EVT_SECTIONSHOWING, (evt)=>{
		for (let btn of floatingButtonAll) {
			btn.classList.add('hidden')
		}
		setTimeout(()=>{
			for (let btn of floatingButtonAll) {
				btn.classList.remove('hidden')
				btn.style.animation = 'dropped 0.3s forwards'
				setTimeout(()=>{
					btn.style.animation = 'unset'	
				}, 300)
			};
		}, 500)
	})

	
}

