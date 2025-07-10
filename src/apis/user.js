import pgp from 'pg-promise';

import db from '../app-db.js'
import Api from '../api.js'
import sqlUtil from '@agung_dhewe/pgsqlc'

// api: account
export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
	}

	async headerlist(body) {
		return await headerlist(this, body)
	}

}

async function headerlist(self, body) {
	const { criteria={}, limit=0, offset=0, columns=[], sort={} } = body
	const searchMap = {
		searchtext: `user_fullname ILIKE '%' || \${searchtext} || '%' OR user_id=try_cast_bigint(\${searchtext}, 0)`,
		user_isdisabled: `user_isdisabled = \${user_isdisabled}`
	};

	try {
	
		var max_rows = limit==0 ? 10 : limit
		const tablename = 'core."user"'
		const {whereClause, queryParams} = sqlUtil.createWhereClause(criteria, searchMap) 
		const sql = sqlUtil.createSqlSelect({tablename, columns, whereClause, sort, limit:max_rows+1, offset, queryParams})
		const rows = await db.any(sql, queryParams);

		
		var i = 0
		const data = []
		for (var row of rows) {
			i++
			if (i>max_rows) { break }
			// kalau ada tambahan, atau modifikasi kolom bisa disini
			data.push(row)
		}

		var nextoffset = null
		if (rows.length>max_rows) {
			nextoffset = offset+max_rows
		}

		return {
			criteria: criteria,
			limit:  max_rows,
			nextoffset: nextoffset,
			data: data
		}
	} catch (err) {
		throw err
	}
}