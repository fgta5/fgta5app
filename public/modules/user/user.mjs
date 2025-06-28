import Module from './../module.mjs'

const app = new $fgta5.Application('user')


export default class extends Module {
	async main(args) {
		await render(this)
		await main(this, args)
	}
}


async function render(self) {

}

async function main(self, args) {
	app.SetTitle('User')
}