import Module from './../module.mjs'
import Context from './user-context.mjs'


const Crsl =  Context.Crsl
const CurrentSectionId = Context.Sections.userheaderEdit
const CurrentSection = Crsl.Items[CurrentSectionId]


const frm = new $fgta5.Form('userHeaderEdit-frm');

const TitleWhenNew = 'New User'
const TitleWhenView = 'View User'
const TitleWhenEdit = 'Edit User'
const EditModeText = 'Edit'
const LockModeText = 'Lock'

const btn_edit = new $fgta5.ActionButton('userHeaderEdit-btn_edit')
const btn_save = new $fgta5.ActionButton('userHeaderEdit-btn_save')
const btn_new = new $fgta5.ActionButton('userHeaderEdit-btn_new', 'userHeader-new')
const btn_del = new $fgta5.ActionButton('userHeaderEdit-btn_delete')
const btn_reset = new $fgta5.ActionButton('userHeaderEdit-btn_reset')
const btn_prev = new $fgta5.ActionButton('userHeaderEdit-btn_prev')
const btn_next = new $fgta5.ActionButton('userHeaderEdit-btn_next')


export const Section = CurrentSection


export async function init(self, args) {

	CurrentSection.addEventListener($fgta5.Section.EVT_BACKBUTTONCLICK, async (evt)=>{
		backToList(self, evt)
	})

	frm.addEventListener('locked', (evt) => { frm_locked(self, evt) });
	frm.addEventListener('unlocked', (evt) => { frm_unlocked(self, evt) });
	frm.render()

	btn_edit.addEventListener('click', (evt)=>{ btn_edit_click(self, evt) })
	btn_save.addEventListener('click', (evt)=>{ btn_save_click(self, evt)  })
	btn_new.addEventListener('click', (evt)=>{ btn_new_click(self, evt)})
	btn_del.addEventListener('click', (evt)=>{ btn_del_click(self, evt)})
	btn_reset.addEventListener('click', (evt)=>{ btn_reset_click(self, evt)})
	btn_prev.addEventListener('click', (evt)=>{ btn_prev_click(self, evt)})
	btn_next.addEventListener('click', (evt)=>{ btn_next_click(self, evt)})


}



export async function render(self) {
	console.log('userHeaderEdit render')
}


export async function newData(self, fromListSection) {
	// console.log('newdata')
	if (!fromListSection) {
		let cancel_new = false
		if (frm.isChanged()) {
			var ret = await $fgta5.MessageBox.confirm(Module.NEWDATA_CONFIRM)
			if (ret=='cancel') {
				cancel_new = true
			}
		}
		if (cancel_new) {
			return
		}
	}

	var autoid = frm.AutoID
	if (autoid) {
		setPrimaryKeyState(self, {disabled:true, placeholder:'[AutoID]'})
	} else {
		setPrimaryKeyState(self, {disabled:false, placeholder:'ID'})
	}

	frm.lock(false)
	frm.newData({})
	frm.acceptChanges()

	CurrentSection.Title = TitleWhenNew

	btn_edit.disabled = true
}

export async function openData(self, params) {
	var args = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			user_id: params.keyvalue
		})
	}

	setPrimaryKeyState(self, {disabled:true})

	var mask = $fgta5.Modal.createMask()
	var loader = new $fgta5.Dataloader() 
	try {
		var resp = await loader.load('/user/header-open-data', args)
		if (resp.code!=0) {
			throw new Error('server: ' + resp.message)
		}

		var data = resp.result 

		frm.setData(data)
		frm.acceptChanges()
		frm.lock()

	} catch (err) {
		throw err
	} finally {
		mask.close();
		loader.dispose()
		loader = null
		mask = null
	}
}


export async function saveData(self) {
	try {

	} catch (err) {
		throw err
	} finally {

	}
}

async function backToList(self, evt) {
	// cek apakah ada perubahan data
	let goback = false
	if (frm.isChanged()) {
		var ret = await $fgta5.MessageBox.confirm(Module.BACK_CONFIRM)
		if (ret=='ok') {
			goback = true
		}
		ret=null
	} else {
		goback = true
	}

	if (goback) {
		frm.reset()
		evt.detail.fn_ShowNextSection()
	}
}

async function  frm_locked(self, evt) {
	CurrentSection.Title = TitleWhenView

	btn_edit.setText(EditModeText)

	btn_edit.disabled = false
	btn_save.disabled = true
	btn_new.disabled = false
	btn_del.disabled = true
	btn_reset.disabled = true
	btn_prev.disabled = false
	btn_next.disabled = false

}

async function  frm_unlocked(self, evt) {
	CurrentSection.Title = TitleWhenEdit

	btn_edit.setText(LockModeText)

	btn_edit.disabled = false
	btn_save.disabled = false
	btn_new.disabled = true
	btn_del.disabled = false
	btn_reset.disabled = false
	btn_prev.disabled = true
	btn_next.disabled = true
}


async function setPrimaryKeyState(self, opt) {
	var primarykey = frm.PrimaryKey
	var obj_pk = frm.Inputs[primarykey]
	var el = document.getElementById(primarykey)
	var placeholder = opt.placeholder==null ? 'ID' : opt.placeholder

	obj_pk.disabled = opt.disabled===true
	el.setAttribute('placeholder', placeholder)
}

async function btn_edit_click(self, evt) {
	if (frm.isLocked()) {
		// user mau inlock
		frm.lock(false)
	} else {
		if (frm.isChanged() || frm.isNew()) {
			await $fgta5.MessageBox.warning(Module.EDIT_WARNING)
			return
		}
		frm.lock(true)
	}
}

async function btn_new_click(self, evt) {
	var sourceSection = evt.target.getAttribute('data-sectionsource') 

	var listsecid = Context.Sections[mainapp.HEADERLIST].sectionId
	var fromListSection = sourceSection===listsecid
	if (fromListSection) {
		// kalau tombol baru dari halaman list, munculkan section editor
		CurrentSection.show()
		newData(self, fromListSection)
	} else {
		newData(self)
	}
}

async function btn_save_click(self, evt) {
	console.log('save data')
	try {
		await saveData(self)
		frm.acceptChanges()
		btn_edit.disabled = false
	} catch (err) {
		console.err(err)
		await $fgta5.MessageBox.error(err.message)
	}
}

async function btn_del_click(self, evt) {
	console.log('delete data')
}


async function btn_reset_click(self, evt) {
	if (frm.isChanged() || frm.isNew()) {
		var resp = await $fgta5.MessageBox.confirm(Module.RESET_CONFIRM)
		if (resp!='ok') {
			return
		}
	}
	frm.reset()
}

async function btn_prev_click(self, evt) {
	console.log('prev')
}

async function btn_next_click(self, evt) {
	console.log('next')
}