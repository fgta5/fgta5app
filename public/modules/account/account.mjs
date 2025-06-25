const app = new $fgta5.Application('account')


export default class AccountApp {
	async main(args) {
		await AccountApp_Main(this, args)
	}
}


async function AccountApp_Main(self, args) {
	app.SetTitle("Account")
}