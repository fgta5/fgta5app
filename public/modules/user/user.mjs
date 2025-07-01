import userBase from './user-base.mjs'


const fnRegistry = {}

export default class extends userBase {
	async main(args) {
		await super.main(args)
		await main(this, args)
	}

	getFunction(functionname) {
		return fnRegistry[functionname]
	}
}


async function main(self, args) {
	
}

async function userHeaderNew(self) {
	return {
		user_fullname: 'Agung Nugroho DW'
	}
}
