const ME = {}

export function init(self) {
	const MOD = self.MOD
	ME.tbl = MOD.tbl_userHeader
}

export async function handleGridEvents(self) {
	ME.tbl.addEventListener('nextdata', async evt=>{ tbl_nextdata(self, evt) })
	ME.tbl.addEventListener('sorting', async evt=>{ tbl_sorting(self, evt) })

}


export async function loadData(self, params={}) {
	const tbl = ME.tbl
	const { criteria={}, limit=0, offset=0, sort={} } = params
	const searchtext = criteria.searchtext ?? ''

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
			criteria: {
				searchtext: searchtext,
			},
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