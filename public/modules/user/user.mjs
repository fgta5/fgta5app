import Module from './../module.mjs'


const app = new $fgta5.Application('user')
const Carousell = $fgta5.SectionCarousell
const urlDir = 'public/modules/user'
const Context = {
	urlDir: 'public/modules/user',
	Sections: {
		HEADERLIST: {sectionId:'sec_headerList', html:`${urlDir}/userHeaderList.html`, mjs:'userHeaderList.mjs'},
		HEADEREDIT: {sectionId:'sec_headerEdit', html:`${urlDir}/userHeaderEdit.html`, mjs:'userHeaderEdit.mjs'},
		Extender: {sectionId:'extender-templates', html:`${urlDir}/user-ext.html`, mjs:'user-ext.mjs'},
	},
	Mods: {},
	tbl_userHeader: null,
	frm_userHeader: null,
}

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

		
		try {
			// include semua halaman yang dibutuhkan
			await this.loadSections(Context.Sections, args)

			// render dan setup halaman
			await render(this)


		} catch (err) {
			throw err
		}
	}
}





async function render(self) {
	try {
		// render sections
		Context.Crsl = new Carousell(app.Nodes.Main) 
		
	} catch (err) {
		throw err
	}
}