import Module from './../module.mjs'
import * as mainapp from './user.mjs'

const Section = $fgta5.Section
const frm = new $fgta5.Form('userHeaderEdit-frm');

const TitleWhenNew = 'New User'
const TitleWhenView = 'View User'
const TitleWhenEdit = 'Edit User'

const btn_edit = new $fgta5.ActionButton('userHeaderEdit-btn_edit')
const btn_save = new $fgta5.ActionButton('userHeaderEdit-btn_save')


export async function init(self, args) {
	const Crsl = self.Context.Crsl
	const secname = self.Context.Sections[mainapp.HEADEREDIT].sectionId

	Crsl.Items[secname].addEventListener(Section.EVT_BACKBUTTONCLICK, async (evt)=>{
		backToList(self, evt)
	})

	frm.addEventListener('locked', (evt) => { frm_locked(self, evt) });
	frm.addEventListener('unlocked', (evt) => { frm_unlocked(self, evt) });
	frm.render()

	btn_edit.addEventListener('click', (evt)=>{ btn_edit_click(self, evt) })
	btn_save.addEventListener('click', (evt)=>{ console.log('save')})
	
	btn_edit.disabled = true
	
}


export async function openData(self, params) {
	var Context = self.Context	

	var args = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			user_id: params.keyvalue
		})
	}

	var mask = $fgta5.Modal.createMask()
	var loader = new $fgta5.Dataloader() 
	try {
		var resp = await loader.load('/user/header-open-data', args)
		if (resp.code!=0) {
			throw new Error('server: ' + resp.message)
		}

		var result = resp.result 

		console.log(result)
		frm.setData(result)

		// var secname = Context.Sections[mainapp.HEADEREDIT].sectionId
		// var section = Context.Crsl.Items[secname] 	
		// section.show()

	} catch (err) {
		console.error(err)
		await $fgta5.MessageBox.error(err.message)
		throw err
	} finally {
		mask.close();
		loader.dispose()
		loader = null
		mask = null
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
	const Crsl = self.Context.Crsl
	const secname = self.Context.Sections[mainapp.HEADEREDIT].sectionId
	Crsl.Items[secname].Title = TitleWhenView
}

async function  frm_unlocked(self, evt) {
	const Crsl = self.Context.Crsl
	const secname = self.Context.Sections[mainapp.HEADEREDIT].sectionId
	if (frm.isNew()) {
		Crsl.Items[secname].Title = TitleWhenNew
	} else {
		Crsl.Items[secname].Title = TitleWhenEdit
	}
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