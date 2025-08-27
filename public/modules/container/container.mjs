const appElementId = 'mainapp'
const appmgr = new $fgta5.AppManager(appElementId)
const Context = {}

export default class extends Module {
	constructor() {
		super()
	}

	async main(args={}) {
		await main(this, args)
	}
}


async function main(self, args) {
	const appmain = document.getElementById(appElementId)
	appmain.classList.add('hidden')

	try {
		// inisiasi sisi server
		try {
			const result = await Module.apiCall(`/container/init`, { })
			Context.notifierId = result.notifierId
			Context.notifierSocket = result.notifierSocket
			Context.userId = result.userId
			Context.userFullname = result.userFullname
			Context.sid = result.sid
			Context.title = result.title
			Context.programs = result.programs
			Context.favourites = result.favourites
		} catch (err) {
			throw err
		} 

		// setup Application Manager
		appmgr.setTitle(Context.title)
		appmgr.setUser({userid:Context.userId , displayname:Context.userFullname, profilepic:''})
		appmgr.setMenu(Context.programs)
		appmgr.setFavourite(Context.favourites)

		appmgr.addEventListener('logout', (evt)=>{
			appmgr_logout(self, evt)
		})


	} catch (err) {
		throw err
	}
}

async function appmgr_logout(self, evt) {
	let mask = $fgta5.Modal.createMask()
	try {
		const apiLogout = new $fgta5.ApiEndpoint('login/do-logout')
		const result = await apiLogout.execute({})
		if (result) {
			sessionStorage.removeItem('nextmodule');
			sessionStorage.removeItem('login_nexturl');
			sessionStorage.removeItem('login');
			location.href = '/login'
		}
	} catch (err) {
		console.log(err)
		$fgta5.MessageBox.error(err.message)
	} finally {
		mask.close()
		mask = null
	}
}