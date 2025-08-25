import Module from './../module.mjs'

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
			const result = await self.apiCall(`/container/init`, { })
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

		// console.log(Context.programs)


	} catch (err) {
		throw err
	}
}

