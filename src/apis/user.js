import Api from '../api.js'

// api: account
export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
	}

	async list(body) {
		return await list(this, body)
	}



}

async function list(body) {
	return {}
}