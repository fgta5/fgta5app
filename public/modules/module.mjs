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

	static isMobileDevice() {
		return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
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
	async loadSections(sections) { await loadSections(this, sections) }
	async loadModules(sections, args) { return await loadModules(this, sections, args) }

	renderFooterButtons(footerButtonsContainer) { renderFooterButtons(this, footerButtonsContainer) }

}


async function loadSections(self, sections) {
	const entries = Object.entries(sections);
	const fnFetchContent = async (key, sectionId, html) => {
		try {
			if (html!=null) {
				const content = await Module.getContent(`${html}`)
				const el = document.getElementById(sectionId)
				if (el==null) {
					throw new Error(`${key}: element untuk <section> '${sectionId}' tidak ditemukan`)
				}
				el.innerHTML = content
			}

		} catch (err) {
			throw err
		}
	} 

	try {
		await Promise.all(
			entries.map(([key, { sectionId, html }]) => fnFetchContent(key, sectionId, html))
		)
	} catch (err) {
		throw err
	}

}

function assignModule(key, modules, index) {
  return [key, modules[index]];
}

async function loadModules(self, sections, args) {
	const entries = Object.entries(sections);
	const fnImportModule =  async (key, mjs) => {
		if (mjs!=null) {
			if (typeof self.import==='function') {
				return await self.import(mjs) 
			} else {
				return await import(`./${mjs}`)
			}
		} else {
			return null
		} 
	}

	try {
		const loadedModules = await Promise.all(
			entries.map(([key, { mjs }]) => fnImportModule(key, mjs))
		)

		const modules = Object.fromEntries(
			entries.map(([key], i) => assignModule(key, loadedModules, i))
		);

		// jika ada extender
		if (modules.Extender!=null) {
			if (typeof modules.Extender.extendPage==='function') {
				modules.Extender.extendPage(self)
			}
		}


		for (var name in modules) {
			const module = modules[name]
			if (module===null) {
				continue
			}
			if (typeof module.init === 'function') {
				module.init(self, args)
			}
		}

		return modules		
	} catch (err) {
		throw err
	}
}


function renderFooterButtons(self, footerButtonsContainer) {
	const footer = document.querySelector('footer.fgta5-app-footer')
	footer.innerHTML = ''

	// masukkan semua footerButtonsContainer ke footer
	for (var bc of Array.from(footerButtonsContainer)) {
		var section = bc.closest('section')
		bc.setAttribute('data-section', section.id)

		footer.appendChild(bc)
	}
}