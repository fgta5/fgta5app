const ME = {}

export function init(self) {
	const MOD = self.MOD
	ME.tbl = MOD.tbl_userHeader
}

export async function handleGridEvents(self) {
	
}


export async function loadData(self, criteria={}, limit=0, offset=0, sort={}) {
	const tbl = ME.tbl
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
			searchtext: searchtext,
			offset: offset,
			limit: limit,
			sort: sort
		})
	}

	const mask = $fgta5.Modal.Mask()
	const loader = new $fgta5.Dataloader() 
	loader.Load('/user/list', args, (err, response)=>{
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