import Module from '../module.mjs'
import Context from './user-context.mjs'
import * as userHeaderEdit from './userHeaderEdit.mjs'
import * as extender from './user-ext.mjs'

const Crsl =  Context.Crsl
const CurrentSectionId = Context.Sections.userheaderList
const CurrentSection = Crsl.Items[CurrentSectionId]

const tbl =  new $fgta5.Gridview('userHeaderList-tbl')
const pnl_search = document.getElementById('userHeaderList-pnl_search')
const btn_gridload = new $fgta5.ActionButton('userHeaderList-btn_gridload') 

export const Section = CurrentSection
export const SearchParams = {}

export async function init(self, args) {
	try {
		// extract custom search panel from template
		const tplSearchPanel = document.querySelector('template[name="custom-search-panel"]')
		if (tplSearchPanel!=null) {
			const clone = tplSearchPanel.content.cloneNode(true); // salin isi template
			pnl_search.prepend(clone)
		}
		
		// setup search panel
		const cmps = pnl_search.querySelectorAll('[fgta5-component][binding')
		for (var cmp of cmps) {
			var id = cmp.getAttribute('id')
			var componentname = cmp.getAttribute('fgta5-component')
			var binding = cmp.getAttribute('binding')
			SearchParams[binding] =  new $fgta5[componentname](id)
		}

		// user-ext.mjs, export function initSearchParams(self, SearchParams) {} 
		if (typeof extender.initSearchParams === 'function') {
			extender.initSearchParams(self, SearchParams)
		} 


		// add event listener
		tbl.addEventListener('nextdata', async evt=>{ tbl_nextdata(self, evt) })
		tbl.addEventListener('sorting', async evt=>{ tbl_sorting(self, evt) })
		tbl.addEventListener('cellclick', async evt=>{ tbl_cellclick(self, evt) })
		tbl.addEventListener('celldblclick', async evt=>{ tbl_celldblclick(self, evt) })

		btn_gridload.addEventListener('click', async evt=>{ btn_gridload_click(self, evt) })
			
		
	} catch (err) {
		throw err
	} finally {
		// load data
		if (args.autoLoadGridData===true) {
			await tbl_loadData(self)
		}
	}
}

export async function render(self) {
	console.log('userHeaderList render')
}

async function tbl_nextdata(self, evt) {
	var criteria = evt.detail.criteria
	var limit = evt.detail.limit
	var offset = evt.detail.nextoffset
	var sort = evt.detail.sort
	await tbl_loadData(self, {criteria, limit, offset, sort})
	tbl.scrollToFooter()
}

async function tbl_sorting(self, evt) {
	tbl.clear()
	var sort = evt.detail.sort
	var criteria = evt.detail.Criteria
	tbl_loadData(self, {criteria, sort})
}

async function tbl_cellclick(self, evt) {
	if (Module.isMobileDevice()) {
		await tbl_celldblclick(self, evt)
	}
}

async function tbl_celldblclick(self, evt) {
	var tr = evt.detail.tr
	var keyvalue = tr.getAttribute('keyvalue')
	var key = tr.getAttribute('key')

	userHeaderEdit.show()

	try {
		userHeaderEdit.openData(self, {key:key, keyvalue:keyvalue, tr:tr})
	} catch (err) {
		console.error(err)
		await $fgta5.MessageBox.error(err.message)

		// kembalikan ke list
		CurrentSection.show()
	}
}

async function btn_gridload_click(self, evt) {
	await tbl.clear()
	tbl_loadData(self)
}


async function tbl_loadData(self, params={}) {
	var { criteria={}, limit=0, offset=0, sort={} } = params

	// isi criteria
	for (var key in SearchParams) {
		var cmp = SearchParams[key]
		var valid = cmp.validate()
		if (!valid) {
			console.error('ada yang belum diisi')
			return false
		}
		criteria[key] = SearchParams[key].value
	}


	// cek sorting
	if (sort===undefined) {
		sort = tbl.getSort()
	}

	var args = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			columns: [],
			criteria: criteria,
			offset: offset,
			limit: limit,
			sort: sort
		})
	}

	var mask = $fgta5.Modal.createMask()
	var loader = new $fgta5.Dataloader() 
	try {
		var resp = await loader.load('/user/header-list', args)
		var code = resp.code
		var message = resp.message
		var result = resp.result

		if (code!=0) {
			var err = new Error('Server Error: ' + message)
			err.code = code
			throw err
		}

		if (offset===undefined) {
			tbl.clear()
		}
		tbl.addRows(result.data)
		tbl.setNext(result.nextoffset, result.limit)

	} catch (err) {
		console.error(err)
		$fgta5.MessageBox.error(err.message)
	} finally {
		mask.close()
		loader.dispose()
		loader = null
		mask = null
	}
	
}