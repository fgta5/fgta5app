// import Module from './../module.mjs'
import Context from './user-context.mjs'


async function testAsync() {
	return '124'
}



export async function init(self, args) {
	console.log('initializing userExtender ...')
	// self.Extender.cbo_group_id_selecting = ({evt}) => { cbo_group_id_selecting(self, evt) }

	// tambahkan new user dialog
	Module.loadTemplate('dlg-newdata')
	Context.dlgNewData = new $fgta5.Dialog('dlg-newdata', {title:'New User'})
	Context.dlgNewData.addAsyncEventListener('showing', async (evt) => { dlgNewData_showing(self, evt) })
	Context.dlgNewData.addAsyncEventListener('ok', async (evt)=>{ await dlgNewData_ok(self, evt) })
}

export function initSearchParams(self, SearchParams) {
	// console.log(SearchParams)
	const cbo_searchgroup = SearchParams['searchgroup']
	cbo_searchgroup.addEventListener('selecting', (evt)=>{ cbo_group_id_selecting(self, evt) })
	cbo_searchgroup.addEventListener('change', (evt)=>{ cbo_group_id_change(self, evt) })

	// cbo.setSelected('20', 'Operations')
}


async function dlgNewData_showing(self, evt) {
	console.log('showing')
	var txt_email = document.getElementById('dlg-newdata-txt_email')
	txt_email.value = 'asdf'
}

async function dlgNewData_ok(self, evt) {
	var txt_email = document.getElementById('dlg-newdata-txt_email')

	evt.result = {
		user_email: txt_email.value
	}

	// evt.preventDefault(); 
}

export async function newData(self) {
	// buat dialog new data
	// var dlg = Context.dlgNewData 
	// var ret = await dlg.show()
	// return ret

	console.log('new data extender')
}




async function cbo_group_id_change(self, evt) {
	var userHeaderList = self.Modules.userHeaderList
	userHeaderList.loadData(self)
}

export async function cbo_group_id_selecting(self, evt) {
	console.log('extender: cbo_group_id_selecting()')

	const cbo = evt.detail.sender
	const dialog = evt.detail.dialog
	const loader = new $fgta5.Dataloader() // cbo.CreateDataLoader()

	var searchtext = evt.detail.searchtext!=null ? evt.detail.searchtext : ''
	var args = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			searchtext: searchtext,
			offset: evt.detail.offset,
			limit: evt.detail.limit,
			test_delay: 50,
			test_stop_at: 35
		})
	}

	console.log(args)

	cbo.wait()
	cbo.abortHandler = () => { loader.abort() }	
	try {
		var resp = await loader.load('/group/header-list', args)
		if (resp.code!=0) {
			throw new Error(resp.message)
		}

		for (var row of resp.result.data) {
			evt.detail.addRow(row.group_id, row.group_name, row)
		}
		dialog.setNext(resp.result.nextoffset, resp.result.limit)
	} catch (err) {
		$fgta5.MessageBox.error(err.message)
	} finally {
		cbo.wait(false)
	}
}