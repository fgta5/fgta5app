import pgp from 'pg-promise';

import db from '../app-db.js'
import Api from '../api.js'
import sqlUtil from '@agung_dhewe/pgsqlc'
import user from './user.js';


const moduleName = 'container'

// api: account
export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
	}

	// dipanggil dengan model snake syntax
	// contoh: header-list
	//         header-open-data
	async init(body) { return await login_init(this, body) }	
	async doLogin(body) { return await login_doLogin(this, body) }	
}


async function login_init(self, body) {

}

async function login_doLogin(self, body) {
	try {
		const {username, password} = body

		// dummy login dulu
		if (username=='agung') {
			// setup session
			self.req.session.user = {
				userId: '234',
				userName: 'agung',
				userFullname: 'Agung Nugroho',
				isLogin: true
			}

			return self.req.session.user
		} else {
			return null
		}
	} catch (err) {
		throw err
	}
}