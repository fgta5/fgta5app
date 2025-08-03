import pgp from 'pg-promise';

import db from '../app-db.js'
import Api from '../api.js'
import sqlUtil from '@agung_dhewe/pgsqlc'

// api: account
export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
	}

	// dipanggil dengan model snake syntax
	// contoh: header-list
	//         header-open-data
	async headerList(body) { return await headerList(this, body) }
	async headerOpenData(body) { return await headerOpenData(this, body) }



}

async function headerList(self, body) {
	const { criteria={}, limit=0, offset=0, columns=[], sort={} } = body
	const searchMap = {
		searchtext: `user_fullname ILIKE '%' || \${searchtext} || '%' OR user_id=try_cast_bigint(\${searchtext}, 0)`,
		searchgroup: `group_id = \${searchgroup}`,
		user_isdisabled: `user_isdisabled = \${user_isdisabled}`
	};

	try {
	
		// hilangkan criteria '' atau null
		for (var cname in criteria) {
			if (criteria[cname]==='' || criteria[cname]===null) {
				delete criteria[cname]
			}
		}


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

async function headerOpenData(self, body) {
	try {
		const { user_id } = body 
		const queryParams = {user_id: user_id}
		const sql = 'select * from core."user" where user_id = \${user_id}'
		const data = await db.one(sql, queryParams);

		if (data==null) { throw new Error("data tidak ditemukan") }	
		const { group_name } = await sqlUtil.lookupdb(db, 'core."group"', 'group_id', data.group_id)
		data.group_name = group_name

		return data
	} catch (err) {
		throw err
	}
}