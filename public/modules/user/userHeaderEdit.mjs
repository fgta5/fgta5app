import Module from './../module.mjs'

const Section = $fgta5.Section
const TitleWhenNew = 'New User'
const TitleWhenView = 'View User'
const TitleWhenEdit = 'Edit User'


let lastNewDataInit = null


export function handleHeaderEvents(self) {
	const MOD = self.MOD
	const allButtonsHeaderNew = document.getElementsByName('button-header-new')
	const allButtonsHeaderSave = document.getElementsByName('button-header-save')
	const allButtonsHeaderDelete = document.getElementsByName('button-header-delete')
	const allButtonsHeaderEdit = document.getElementsByName('button-header-edit')
	const allButtonsHeaderReset = document.getElementsByName('button-header-reset')


	allButtonsHeaderNew.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnHeaderNew_click(self, evt)
		})
	});

	allButtonsHeaderSave.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnHeaderSave_click(self, evt)
		})
	});

	allButtonsHeaderDelete.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnHeaderDelete_click(self, evt)
		})
	});

	allButtonsHeaderEdit.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnHeaderEdit_click(self, evt)
		})
	});

	allButtonsHeaderReset.forEach(btn => {
		btn.addEventListener('click', (evt)=>{
			btnHeaderReset_click(self, evt)
		})
	});

	MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].addEventListener(Section.EVT_BACKBUTTONCLICK, async (evt)=>{
		// cek apakah ada perubahan data
		let goback = false
		if (MOD.userHeaderEditForm.IsChanged()) {
			var ret = await $fgta5.MessageBox.Confirm(Module.BACK_CONFIRM)
			if (ret=='ok') {
				goback = true
			}
		} else {
			goback = true
		}

		if (goback) {
			MOD.userHeaderEditForm.Reset()
			evt.detail.fn_ShowNextSection()
		}
	})

	MOD.userHeaderEditForm.addEventListener('locked', (evt) => { userHeaderEditForm_locked(self, evt) });
	MOD.userHeaderEditForm.addEventListener('unlocked', (evt) => { userHeaderEditForm_unlocked(self, evt) });
	MOD.userHeaderEditForm.Render()
}


export async function  userHeaderEditForm_locked(self, evt) {
	const MOD = self.MOD
	MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].Title = TitleWhenView
}

export async function  userHeaderEditForm_unlocked(self, evt) {
	const MOD = self.MOD
	if (MOD.userHeaderEditForm.IsNew()) {
		MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].Title = TitleWhenNew
	} else {
		MOD.Crsl.Items[MOD.SECTION.HEADEREDIT].Title = TitleWhenEdit
	}
}

export async function btnHeaderNew_click(self, evt) {
	const MOD = self.MOD

	let cancel_new = false
	if (MOD.userHeaderEditForm.IsChanged()) {
		var ret = await $fgta5.MessageBox.Confirm(Module.NEWDATA_CONFIRM)
		if (ret=='cancel') {
			cancel_new = true
		}
	}

	if (cancel_new) {
		return
	}

	// setup id
	const autoid = MOD.userHeaderEditForm.AutoID
	const primarykey = MOD.userHeaderEditForm.PrimaryKey
	const obj_pk = MOD.userHeaderEditForm.Inputs[primarykey]
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
	const fn_dialogNew = self.getFunction('userHeaderNew')
	if (typeof fn_dialogNew==='function') {
		newDataInit = await fn_dialogNew(self)
	}

	MOD.userHeaderEditForm.NewData(newDataInit)
	MOD.userHeaderEditForm.Lock(false)
	
	lastNewDataInit = newDataInit
}

export async function btnHeaderSave_click(self, evt) {
	const MOD = self.MOD
	

	const newid = '12345'



	// saat sudah berhasil save, set ID menjadi disabled	
	const autoid = MOD.userHeaderEditForm.AutoID
	const primarykey = MOD.userHeaderEditForm.PrimaryKey
	const obj_pk = MOD.userHeaderEditForm.Inputs[primarykey]
	if (!autoid) {
		obj_pk.Disabled = true
	} else {
		obj_pk.Value = newid
	}

	MOD.userHeaderEditForm.AcceptChanges()

}

export async function btnHeaderDelete_click(self, evt) {
	const MOD = self.MOD

	let cancel_delete = false
	var ret = await $fgta5.MessageBox.Confirm(Module.DELETE_CONFIRM)
	if (ret=='cancel') {
		cancel_delete = true
	}


	let delete_success = false
	if (MOD.userHeaderEditForm.IsNew()) {
		MOD.userHeaderEditForm.Reset()
		delete_success = true
	} else {
		if (MOD.userHeaderEditForm.IsChanged()) {
			MOD.userHeaderEditForm.Reset()
		}

		// call api delete
		delete_success = true
	}

	if (delete_success) {
		backToList(self)
	} 		

}

export async function btnHeaderEdit_click(self, evt) {
	const MOD = self.MOD
	if (MOD.userHeaderEditForm.IsLocked()) {
		// user mau inlock
		console.log('mau unlock')
		MOD.userHeaderEditForm.Lock(false)
	} else {
		console.log('mau lock')
 		if (MOD.userHeaderEditForm.IsChanged() || MOD.userHeaderEditForm.IsNew()) {
			await $fgta5.MessageBox.Warning(Module.EDIT_WARNING)
			return
		}
		MOD.userHeaderEditForm.Lock(true)
	}
}

export async function btnHeaderReset_click(self, evt) {
	const MOD = self.MOD

	let cancel_reset = false
	if (MOD.userHeaderEditForm.IsChanged()) {
		var ret = await $fgta5.MessageBox.Confirm(Module.RESET_CONFIRM)
		if (ret=='cancel') {
			cancel_reset = true
		}
	}  
	
	if (cancel_reset) {
		return
	}
	
	if (MOD.userHeaderEditForm.IsNew()) {
		MOD.userHeaderEditForm.NewData(lastNewDataInit)
	} else {
		MOD.userHeaderEditForm.Reset()
	}
}


function backToList(self) {
	const MOD = self.MOD
	MOD.Crsl.Items[MOD.SECTION.HEADERLIST].Show()
}