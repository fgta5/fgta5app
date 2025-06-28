export default class Api {
	#req
	#res
	#next

	constructor(req, res, next) {
		this.#req = req
		this.#res = res
		this.#next = next
	}

	get req() { return this.#req }
	get res() { return this.#res }
	get next() { return this.#next }

	async handleRequest(methodName, body) {
		if (typeof this[methodName] === 'function') {
			const result = await this[methodName](body)
			const response = JSON.stringify(result)
			return response 
		} else {
			this.res.status(404).send(`Method "${methodName}" tidak ditemukan.`)
		}
	}
}


