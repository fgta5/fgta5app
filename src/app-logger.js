import { dblog } from './app-db.js'


export default new (class {
	access(user, modulename, url, errormessage) {
		console.log(modulename, url, errormessage)
	}
})()

