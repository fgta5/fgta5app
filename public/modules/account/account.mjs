import Module from './../module.mjs'

const app = new $fgta5.Application('account')

const ME = {}
const BASE_PATH = 'public/modules/account'
const ID_HEADER_LIST = 'accountHeaderList'
const ID_HEADER_EDIT = 'accountHeaderEdit'

const EL_HEADER_LIST = document.getElementById(ID_HEADER_LIST)
const EL_HEADER_EDIT = document.getElementById(ID_HEADER_EDIT)


// ui: account
export default class extends Module {
	async main(args) {
		await render()
		await main(this, args)
	}
}

async function render(self, args) {
	// fetch all section contents
	EL_HEADER_LIST.innerHTML = await Module.GetContent(`${BASE_PATH}/${ID_HEADER_LIST}.html`) 
	EL_HEADER_EDIT.innerHTML = await Module.GetContent(`${BASE_PATH}/${ID_HEADER_EDIT}.html`) 


	

}


async function main(self, args) {
	app.SetTitle("Account")

	
}