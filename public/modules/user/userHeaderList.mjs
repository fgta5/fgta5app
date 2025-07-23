const ME = {}
const FN_HeaderSearchInit = 'headerSearchInit'

export async function init(self) {
	const MOD = self.MOD
	ME.tbl = MOD.tbl_userHeader

	ME.btn_userHeader_load = document.getElementById('btn_userHeader_load')
	ME.pnl_userHeader_params = document.getElementById('pnl_userHeader_params')
	
	// tambahkan custom search
	const tpl = document.querySelector('template[name="custom-search-panel"]')
	const clone = tpl.content.cloneNode(true); // salin isi template
	ME.pnl_userHeader_params.prepend(clone)


	ME.SearchParams = {}
	var cmps = ME.pnl_userHeader_params.querySelectorAll('[fgta5-component][binding')
	for (var cmp of cmps) {
		var id = cmp.getAttribute('id')
		var componentname = cmp.getAttribute('fgta5-component')
		var binding = cmp.getAttribute('binding')
		ME.SearchParams[binding] =  new $fgta5[componentname](id)
	}

	const fn_HeaderSearchInit = self.getFunction(FN_HeaderSearchInit)
	if (typeof fn_HeaderSearchInit==='function') {
		await fn_HeaderSearchInit(self, ME.SearchParams)
	}



	// handle events
	ME.tbl.addEventListener('nextdata', async evt=>{ tbl_nextdata(self, evt) })
	ME.tbl.addEventListener('sorting', async evt=>{ tbl_sorting(self, evt) })
	ME.tbl.addEventListener('celldblclick', async evt=>{ tbl_celldblclick(self, evt) })

	ME.btn_userHeader_load.addEventListener('click', async evt=>{ btn_userHeader_load_click(self, evt) })

}

function handleEvent() {
	
}


export async function loadData(self, params={}) {
	const tbl = ME.tbl
	const { criteria={}, limit=0, offset=0, sort={} } = params

	// isi criteria
	for (var key in ME.SearchParams) {
		const cmp = ME.SearchParams[key]
		// if (cmp.IsRequired) {
		var valid = cmp.Validate()
		if (!valid) {
			console.error('ada yang belum diisi')
			return false
		}
			
		// }
		
		criteria[key] = ME.SearchParams[key].Value
	}


	// cek sorting
	if (sort===undefined) {
		sort = tbl.GetSort()
	}




	const args = {
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

	const mask = $fgta5.Modal.Mask()
	const loader = new $fgta5.Dataloader() 
	loader.Load('/user/headerlist', args, (err, response)=>{
		console.log(response)
		const code = response.code
		const message = response.message
		const result = response.result

		if (code!=0) {
			console.error(message)
		}

		if (offset===undefined) {
			tbl.Clear()
		}
		tbl.AddRows(result.data)
		tbl.SetNext(result.nextoffset, result.limit)
		mask.close();
	})
}


function tbl_nextdata(self, evt) {
	const criteria = evt.detail.criteria
	const limit = evt.detail.limit
	const offset = evt.detail.nextoffset
	const sort = evt.detail.sort
	loadData(self, {criteria, limit, offset, sort})
}

function tbl_sorting(self, evt) {
	ME.tbl.Clear()

	const sort = evt.detail.sort
	const criteria = evt.detail.Criteria
	loadData(self, {criteria, sort})
}

function tbl_celldblclick(self, evt) {
	var tr = evt.detail.tr
	var keyvalue = tr.getAttribute('keyvalue')
	var key = tr.getAttribute('key')
	console.log(key, keyvalue)
}

async function btn_userHeader_load_click(self, evt) {
	await ME.tbl.Clear()
	loadData(self)
}