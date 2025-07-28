const RESET_CONFIRM = 'Sudah ada perubahan data, apakah akan direset?'
const NEWDATA_CONFIRM  = 'Sudah ada perubahan data, apakah akan membuat baru?'
const BACK_CONFIRM = 'Sudah ada perubahan data, apakah akan kembali ke list?'
const DELETE_CONFIRM = 'Apakah akan hapus data ini?'
const EDIT_WARNING = 'Silakan data di save atau di reset dahulu'


export default class Module {
	static get RESET_CONFIRM() { return RESET_CONFIRM }
	static get NEWDATA_CONFIRM() { return NEWDATA_CONFIRM }
	static get BACK_CONFIRM() { return BACK_CONFIRM }
	static get DELETE_CONFIRM() { return DELETE_CONFIRM }
	static get EDIT_WARNING() { return EDIT_WARNING }


	constructor() {
		
	}


	static async getContent(url) {
		try {
			const response = await fetch(url)
			if (!response.ok) {
				console.error(`HTTP Error: ${response.status}`)
				return `<div>${url}</div>`
			}
			const data = await response.text(); 
			return data
		} catch (err) {

		}
		
	}

	async getFunction(functionname) { return null }
	async loadSections(sections, args) { await loadSections(this, sections, args) }

}


async function loadSections(self, sections, args) {
	const entries = Object.entries(sections);
	try {
		const fnImport = async (key, sectionId, html, mjs) => {
			try {
				if (html!=null) {
					console.log(sectionId, html)
					const content = await Module.getContent(`${html}`)
					const el = document.getElementById(sectionId)
					if (el==null) {
						throw new Error(`${key}: element untuk <section> '${sectionId}' tidak ditemukan`)
					}
					el.innerHTML = content
				}
				
				if (mjs!=null) {
					if (typeof self.import==='function') {
						return await self.import(mjs) 
					} else {
						return await import(`./${mjs}`) 
					}
					
				} else {
					return null
				} 
			} catch (err) {
				throw err
			}
		} 

		// load html
		const modules = await Promise.all(
			entries.map(([key, { sectionId, html, mjs }]) => fnImport(key, sectionId, html, mjs))
		)
		
		for (var module of modules) {
			if (module===null) {
				continue
			}
			if (typeof module.init === 'function') {
				module.init(self, args)
			}
		}
	} catch (err) {
		throw err
	}

}
