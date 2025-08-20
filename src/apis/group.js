import pgp from 'pg-promise';

import db from '../app-db.js'
import Api from '../api.js'
import sqlUtil from '@agung_dhewe/pgsqlc'


export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
	}

	// dipanggil dengan model snake syntax
	// contoh: header-list --> headerList
	//         header-open-data --> headerOpenData
	async headerList(body) { return await headerList(this, body) }

}

async function headerList(self, body) {
	const { criteria={}, limit=0, offset=0, columns=[], sort={} } = body
	var max_rows = limit==0 ? 10 : limit
	var nextoffset = null

	const data = [
		{group_id:10, group_name:'Finance'},
		{group_id:20, group_name:'Operation'},
		{group_id:30, group_name:'IT'}
	]

	return {
		criteria: criteria,
		limit:  max_rows,
		nextoffset: nextoffset,
		data: data
	}

}