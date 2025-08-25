import Module from './../module.mjs'

const Context = {}
const btn_login = document.getElementById('btn_login')
const obj_username = document.getElementById('obj_username')
const obj_password = document.getElementById('obj_password')


export default class extends Module {
	constructor() {
		super()
	}

	async main(args={}) {
		console.log('initializing module...')
		const self = this

		await main(self, args)
	}

}


async function main(self, args) {
	btn_login.addEventListener('click', (evt)=>{
		btn_login_click(self, evt)
	})
}

async function btn_login_click(self, evt) {
	console.log('login')
	const username = obj_username.value
	const password = obj_password.value
	

	let mask = $fgta5.Modal.createMask()
	try {
		// login, tidak pakai self.apiCall, karena akan bypass session
		const apiLogin = new $fgta5.ApiEndpoint('login/do-login')
		const result = await apiLogin.execute({username, password})

		console.log(result)
	} catch (err) {
		console.log(err)
		$fgta5.MessageBox.error(err.message)
	} finally {
		mask.close()
		mask = null
	}
}