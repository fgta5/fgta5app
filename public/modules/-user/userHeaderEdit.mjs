import Module from './../module.mjs'

const Section = $fgta5.Section
const TitleWhenNew = 'New User'
const TitleWhenView = 'View User'
const TitleWhenEdit = 'Edit User'

const FN_userHeaderNew = 'userHeaderNew'
const FN_userHeaderSaved = 'userHeaderSaved'
const FN_userHeaderSaving = 'userHeaderSaving'


const ME = {}
let lastNewDataInit = null

export async function init(self) {
	const MOD = self.MOD
	ME.frm = MOD.frm_userHeader
	ME.allButtonNew = document.getElementsByName('button-header-new')
	ME.allButtonSave = document.getElementsByName('button-header-save')
	ME.allButtonDelete = document.getElementsByName('button-header-delete')
	ME.allButtonEdit = document.getElementsByName('button-header-edit')
	ME.allButtonReset = document.getElementsByName('button-header-reset')

	handleHeaderEditEvents(self)
}



export function handleHeaderEditEvents(self) {
	const MOD = self.MOD
	const frm = ME.frm
	
	ME.allButtonNew.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnNew_click(self, evt)
		})
	});

	ME.allButtonSave.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnSave_click(self, evt)
		})
	});

	ME.allButtonDelete.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnDelete_click(self, evt)
		})
	});

	ME.allButtonEdit.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnEdit_click(self, evt)
		})
	});

	ME.allButtonReset.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnReset_click(self, evt)
		})
	});

	MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].addEventListener(Section.EVT_BACKBUTTONCLICK, async (evt)=>{
		// cek apakah ada perubahan data
		let goback = false
		if (frm.IsChanged()) {
			var ret = await $fgta5.MessageBox.Confirm(Module.BACK_CONFIRM)
			if (ret=='ok') {
				goback = true
			}
		} else {
			goback = true
		}

		if (goback) {
			frm.Reset()
			evt.detail.fn_ShowNextSection()
		}
	})

	frm.addEventListener('locked', (evt) => { frm_locked(self, evt) });
	frm.addEventListener('unlocked', (evt) => { frm_unlocked(self, evt) });
	frm.Render()



	// object
	frm.Inputs.obj_group_id.addEventListener('selecting', (evt)=>{
		obj_group_id_selecting(self, evt)
	})
}


async function obj_group_id_selecting(self, evt) {
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

	cbo.Wait()
	cbo.AbortHandler = () => { loader.Abort() }	
	try {
		var resp = await loader.Load('/group/headerlist', args)
		if (resp.code!=0) {
			throw new Error('server: ' + resp.message)
		}

		for (var row of resp.result.data) {
			evt.detail.addRow(row.group_id, row.group_name, row)
		}
		dialog.SetNext(resp.result.nextoffset, resp.result.limit)
	} catch (err) {
		$fgta5.MessageBox.Error(err.message)
	} finally {
		cbo.Wait(false)
	}
}


export async function  frm_locked(self, evt) {
	const MOD = self.MOD
	MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].Title = TitleWhenView
}

export async function  frm_unlocked(self, evt) {
	const MOD = self.MOD
	const frm = ME.frm
	if (frm.IsNew()) {
		MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].Title = TitleWhenNew
	} else {
		MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].Title = TitleWhenEdit
	}
}

export async function openData(self, param) {
	const MOD = self.MOD
	const frm = ME.frm

	const args = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			user_id: param.keyvalue
		})
	}

	const mask = $fgta5.Modal.Mask()
	const loader = new $fgta5.Dataloader() 
	try {
		const resp = await loader.Load('/user/headeropendata', args)
		if (resp.code!=0) {
			throw new Error('server: ' + resp.message)
		}
		frm.SetData(resp.result)
		MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].Show()
	} catch (err) {
		await $fgta5.MessageBox.Error(err.message)
	} finally {
		mask.close();
	}
}


export async function btnNew_click(self, evt) {
	const MOD = self.MOD
	const frm = ME.frm

	let cancel_new = false
	if (frm.IsChanged()) {
		var ret = await $fgta5.MessageBox.Confirm(Module.NEWDATA_CONFIRM)
		if (ret=='cancel') {
			cancel_new = true
		}
	}

	if (cancel_new) {
		return
	}

	// setup id
	const autoid = frm.AutoID
	const primarykey = frm.PrimaryKey
	const obj_pk = frm.Inputs[primarykey]
	const el = document.getElementById(primarykey)
	if (autoid) {
		obj_pk.Disabled = true
		el.setAttribute('placeholder', '[AutoID]')
	} else {
		obj_pk.Disabled = false
		el.setAttribute('placeholder', 'ID')
	}


	const section = evt.target.closest('section')
	const sectionname = section.getAttribute('name')
	if (sectionname!=MOD.SECTION.HEADEREDIT) {
		MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].Show()
	}

	// kalau perlu munculkan dialog disini
	let newDataInit = {}
	const fn_dialogNew = self.getFunction(FN_userHeaderNew)
	if (typeof fn_dialogNew==='function') {
		newDataInit = await fn_dialogNew(self)
	}

	frm.NewData(newDataInit)
	frm.Lock(false)
	
	lastNewDataInit = newDataInit
}




export async function btnSave_click(self, evt) {
	const frm = ME.frm

	// cek dulu apakah ada error
	


	const args = {}
	const fn_saving = self.getFunction(FN_userHeaderSaving)
	if (typeof fn_saving==='function') {
		await fn_saved(self, frm, args)
	}

	if (args.Cancel==='true') {
		return
	}


	let result
	if (args.Handled!==true) {
		const data = frm.GetData()
		result = await SaveData(data)
	}

	const newid = '12345'
	const fn_saved = self.getFunction(FN_userHeaderSaved)
	if (typeof fn_saved==='function') {
		await fn_saved(self, frm)
	}

	// saat sudah berhasil save, set ID menjadi disabled	
	const autoid = frm.AutoID
	const primarykey = frm.PrimaryKey
	const obj_pk = frm.Inputs[primarykey]
	if (!autoid) {
		obj_pk.Disabled = true
	} else {
		obj_pk.Value = newid
	}




	frm.AcceptChanges()

}




export async function btnDelete_click(self, evt) {
	const frm = ME.frm

	let cancel_delete = false
	var ret = await $fgta5.MessageBox.Confirm(Module.DELETE_CONFIRM)
	if (ret=='cancel') {
		cancel_delete = true
	}


	let delete_success = false
	if (frm.IsNew()) {
		frm.Reset()
		delete_success = true
	} else {
		if (frm.IsChanged()) {
			frm.Reset()
		}

		// call api delete
		delete_success = true
	}

	if (delete_success) {
		backToList(self)
	} 		

}

export async function btnEdit_click(self, evt) {
	const frm = ME.frm

	if (frm.IsLocked()) {
		// user mau inlock
		frm.Lock(false)
	} else {
 		if (frm.IsChanged() || frm.IsNew()) {
			await $fgta5.MessageBox.Warning(Module.EDIT_WARNING)
			return
		}
		frm.Lock(true)
	}
}

export async function btnReset_click(self, evt) {
	const frm = ME.frm

	let cancel_reset = false
	if (frm.IsChanged()) {
		var ret = await $fgta5.MessageBox.Confirm(Module.RESET_CONFIRM)
		if (ret=='cancel') {
			cancel_reset = true
		}
	}  
	
	if (cancel_reset) {
		return
	}
	
	if (frm.IsNew()) {
		frm.NewData(lastNewDataInit)
	} else {
		frm.Reset()
	}
}


function backToList(self) {
	const MOD = self.MOD
	MOD.Crsl.Items[MOD.SECTION.HEADERLIST].Show()
}

async function SaveData() {

}

