const RESET_CONFIRM = 'Sudah ada perubahan data, apakah akan direset?'
const NEWDATA_CONFIRM  = 'Sudah ada perubahan data, apakah akan membuat baru?'
const BACK_CONFIRM = 'Sudah ada perubahan data, apakah akan kembali ke list?'
const DELETE_CONFIRM = 'Apakah akan hapus data ini?'
const EDIT_WARNING = 'Silakan data di save atau di reset dahulu'


export default class Module {
	static get RESET_CONFIRM() { return RESET_CONFIRM }
	static get NEWDATA_CONFIRM() { return NEWDATA_CONFIRM }
	static get BACK_CONFIRM() { return BACK_CONFIRM }
	static get DELETE_CONFIRM() { return DELETE_CONFIRM }
	static get EDIT_WARNING() { return EDIT_WARNING }



	static async GetContent(url) {
		const response = await fetch(url)
		if (!response.ok) {
			console.error(`HTTP Error: ${response.status}`)
			return `<div>${url}</div>`
		}
		const data = await response.text(); 
		return data
	}

	async getFunction(functionname) { return null }

}