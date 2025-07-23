import Module from './../module.mjs'
import * as userHeaderEdit from './userHeaderEdit.mjs'
import * as userHeaderList from './userHeaderList.mjs'

const app = new $fgta5.Application('user')
const Carousell = $fgta5.SectionCarousell
const currentUrlDir = 'public/modules/user'
const MOD = {
	SECTION: {
		HEADERLIST : 'sec_headerList',
		HEADEREDIT : 'sec_headerEdit',
	},
	

	// disini belum ada karena halaman belum di fetch
	tbl_userHeader: null,
	frm_userHeader: null 
}

export default class userBase extends Module {
	
	get MOD() { return MOD }
	get Application() { return app }
	
	async main(args) {
		app.SetTitle('User')
		await render(this, args)

		await userHeaderEdit.init(this)
		await userHeaderList.init(this)
	
		userHeaderList.loadData(this)
	
	}
}
// args.customcontent!==undefined ? Module.GetContent(`${currentUrlDir}/user-customcontent.html`) :
async function render(self, args) {

	// inlcude halaman
	const sec_headerList = document.getElementById('sec_headerList')
	const sec_headerEdit = document.getElementById('sec_headerEdit')
	const [customcontent, headerListContent, headerEditContent] = await Promise.all([
		args.customcontent===undefined ? (()=>{return ''})() : Module.GetContent(`${currentUrlDir}/user-customcontent.html`),
		Module.GetContent(`${currentUrlDir}/userHeaderList.html`),
		// Module.GetContent(`${currentUrlDir}/userHeaderEdit.html`),
	]);
	sec_headerList.innerHTML = headerListContent
	// sec_headerEdit.innerHTML = headerEditContent

	MOD.tbl_userHeader = new $fgta5.Gridview('tbl_userHeader')
	// MOD.frm_userHeader = new $fgta5.Form('frm_userHeader');


	document.getElementById('customcontent').innerHTML = customcontent


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

