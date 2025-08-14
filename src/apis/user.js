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
	async headerOpen(body) { return await headerOpen(this, body) }
	async headerUpdate(body) { return await headerUpdate(this, body)}
	async headerCreate(body) { return await headerCreate(this, body)}
	async headerDelete(body) { return await headerDelete(this, body) }
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

			
			// pasang extender di sini


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

async function headerOpen(self, body) {
	try {
		const { id } = body 
		const queryParams = {user_id: id}
		const sql = 'select * from core."user" where user_id = \${user_id}'
		const data = await db.one(sql, queryParams);

		if (data==null) { throw new Error("data tidak ditemukan") }	
		const { group_name } = await sqlUtil.lookupdb(db, 'core."group"', 'group_id', data.group_id)
		data.group_name = group_name


		// pasang extender untuk olah data

		return data
	} catch (err) {
		throw err
	}
}


async function headerCreate(self, body) {
	const { data } = body
	const tablename = 'core."user"'


	try {
		sqlUtil.connect(db)

		data._createby = 1
		data._createdate = (new Date()).toISOString()


		const cmd = sqlUtil.createInsertCommand(tablename, data, ['user_id'])
		const result = await cmd.execute(data)
		

		// pasang extender di sini
		
		return result
	} catch (err) {
		throw err
	}
}

async function headerUpdate(self, body) {
	const { data } = body
	const tablename = 'core."user"'

	try {
		sqlUtil.connect(db)

		data._modifyby = 1
		data._modifydate = (new Date()).toISOString()
		
		const cmd =  sqlUtil.createUpdateCommand(tablename, data, ['user_id'])
		const result = await cmd.execute(data)
		
		// pasang extender di sini

		return result
	} catch (err) {
		throw err
	}
}


async function headerDelete(self, body) {
	const tablename = 'core."user"'

	try {
		const { id } = body 
		const dataToRemove = {user_id: id}

		const cmd = sqlUtil.createDeleteCommand(tablename, ['user_id'])
		const result = await cmd.execute(dataToRemove)
	
		return result
	} catch (err) {
		throw err
	}
}