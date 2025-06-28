export default class Module {

	static async GetContent(url) {
		const response = await fetch(url)
		if (!response.ok) {
			console.error(`HTTP Error: ${response.status}`)
			return `<div>${url}</div>`
		}
		const data = await response.text(); 
		return data
	}
}