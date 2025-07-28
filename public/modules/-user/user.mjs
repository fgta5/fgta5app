import userBase from './user-base.mjs'


const fnRegistry = {
	headerSearchInit: headerSearchInit
}

export default class extends userBase {
	async main(args={}) {
		args.customcontent = 'user-customcontent.html'
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

function headerSearchInit(self, params) {
	// var searchemail = params.searchemail
	// searchemail.SetSelected('eka.hasan@example.com', 'eka.hasan@example.com')
}