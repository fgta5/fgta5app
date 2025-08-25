import pgp from 'pg-promise';

import db from '../app-db.js'
import Api from '../api.js'
import sqlUtil from '@agung_dhewe/pgsqlc'

const moduleName = 'container'


// dummy program
const programs = {
	appgen: {type:'program', name:'generator', title:'Generator', url:'appgen'},
	account: {type:'program', name:'account', title:'Account', icon:'images/iconprograms/mcfly.png'},
	departement: {type:'program', name:'departement', title:'Departemen', icon: 'images/iconprograms/mcfly.png'},
	lokasi: {type:'program', name:'lokasi', title:'Lokasi', icon: 'images/iconprograms/medicine.png'},
	periode: {type:'program', name:'periode', title:'Periode', icon: 'images/iconprograms/mountain.png'},
	jurnal: {type:'program', name:'jurnal', title:'Jurnal Umum', icon: 'images/iconprograms/packman.png', disabled:true},
	payment: {type:'program', name:'payment', title:'Pembayaran', icon: 'images/iconprograms/photo.png'},
	hutang: {type:'program', name:'hutang', title:'Hutang', icon: 'images/iconprograms/pin.png'},
	user: {type:'program', name:'user', title:'User', icon: 'images/iconprograms/pizza.png'},
	group: {type:'program', name:'group', title:'Group', icon: 'images/iconprograms/speakers.png'},
	crud01: {type:'program', name:'crud01', title:'Simple CRUD', icon: 'images/iconprograms/speakers.png', url:'http://localhost:3000/user'},
}


// api: account
export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
		this.cekLogin(req)

		// set context dengan data session saat ini
		this.context = {
			userId: req.session.user.userId,
			userName: req.session.user.userName,
			userFullname: req.session.user.userFullname,
			sid: req.sessionID,
			notifierId: Api.generateNotifierId(moduleName, req.sessionID),
			notifierSocket: req.app.locals.appConfig.notifierSocket,
			notifierServer: req.app.locals.appConfig.notifierServer,
		}

		
	}

	// dipanggil dengan model snake syntax
	// contoh: header-list
	//         header-open-data
	async init(body) { return await container_init(this, body) }	
}


async function container_init(self, body) {
	console.log('init container')
	self.req.session.sid = self.req.sessionID

	try {
		return {
			title: 'Application',
			userId: self.context.userId,
			userFullname: self.context.userFullname,
			sid: self.context.sid ,
			notifierId: self.context.notifierId,
			notifierSocket: self.context.notifierSocket,
			programs: getDummyProgram(),
			favourites: getDummyFavourites()
		}
	} catch (err) {
		throw err
	}
}


function getDummyFavourites() {
	return [ 'appgen', 'crud01', 'account',  'periode']
}

function getDummyProgram() {
	return [
		programs.appgen,

		{
			title: 'Accounting',
			border: false,
			items: [
				{
					icon: 'images/icon-food.svg',
					title: 'Master data',
					items: [
						programs.account,
						programs.departement,
						programs.lokasi,
						programs.periode
					]
				},
				{
					title: 'Transaksi',
					border: false,
					items: [
						programs.jurnal,
						programs.payment,
						programs.hutang



					]
				}
			]
		},
		{
			title: 'Administrator',
			border: false,
			items: [
				programs.user,
				programs.group,
			]
		},
		
		programs.crud01,
	]
}