import pgp from 'pg-promise';

import db from '../app-db.js'
import Api from '../api.js'
import sqlUtil from '@agung_dhewe/pgsqlc'

import * as Extender from './extenders/user-apiext.js'

const moduleName = 'user'
const headerSectionName = 'header'
const tablename = 'core.user'

// api: account
export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
		this.cekLogin(req)

		// set context dengan data session saat ini
		this.context = {
			userId: req.session.user.userId,
			userName: req.session.user.userName,
			userFullname: req.session.userFullname,
			sid: req.sessionID,
			notifierId: Api.generateNotifierId(moduleName, req.sessionID),
			notifierSocket: req.app.locals.appConfig.notifierSocket,
			notifierServer: req.app.locals.appConfig.notifierServer,
		}
	}


	// dipanggil dengan model snake syntax
	// contoh: header-list
	//         header-open-data
	async init(body) { return await module_init(this, body) }
	async headerList(body) { return await headerList(this, body) }
	async headerOpen(body) { return await headerOpen(this, body) }
	async headerUpdate(body) { return await headerUpdate(this, body)}
	async headerCreate(body) { return await headerCreate(this, body)}
	async headerDelete(body) { return await headerDelete(this, body) }

}


async function module_init(self, body) {
	console.log('init generator')
	self.req.session.sid = self.req.sessionID

	return {
		userId: self.context.userId,
		userFullname: self.context.userFullname,
		sid: self.context.sid ,
		notifierId: self.context.notifierId,
		notifierSocket: self.context.notifierSocket
	}
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
		const {whereClause, queryParams} = sqlUtil.createWhereClause(criteria, searchMap) 
		const sql = sqlUtil.createSqlSelect({tablename, columns, whereClause, sort, limit:max_rows+1, offset, queryParams})
		const rows = await db.any(sql, queryParams);

		
		var i = 0
		const data = []
		for (var row of rows) {
			i++
			if (i>max_rows) { break }

			
			// pasang extender di sini
			if (typeof Extender.headerListRow === 'function') {
				await Extender.headerListRow(row)
			}

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
		const criteria = { user_id: id }
		const searchMap = { user_id: `user_id = \${user_id}`}
		const {whereClause, queryParams} = sqlUtil.createWhereClause(criteria, searchMap) 
		const sql = sqlUtil.createSqlSelect({
			tablename, 
			columns:[], 
			whereClause, 
			sort:{}, 
			limit:0, 
			offset:0, 
			queryParams
		})
		const data = await db.one(sql, queryParams);
		if (data==null) { 
			throw new Error("data tidak ditemukan") 
		}	

		// lokkup group_name
		{
			const { group_name } = await sqlUtil.lookupdb(db, 'core."group"', 'group_id', data.group_id)
			data.group_name = group_name
		}

		// lokkup group_name
		{
			const { group_name } = await sqlUtil.lookupdb(db, 'core."group"', 'group_id', data.group_id)
			data.group_name = group_name
		}	

		// pasang extender untuk olah data
		if (typeof Extender.headerOpen === 'function') {
			await Extender.headerOpen(data)
		}

		return data
	} catch (err) {
		throw err
	}
}


async function headerCreate(self, body) {
	const { source, data } = body

	try {
		sqlUtil.connect(db)

		data._createby = 1
		data._createdate = (new Date()).toISOString()


		const cmd = sqlUtil.createInsertCommand(tablename, data, ['user_id'])
		const result = await cmd.execute(data)
		
		// record log
		await self.log({source, tablename, section:headerSectionName, action:'CREATE', id: result.user_id})
		
		return result
	} catch (err) {
		throw err
	}
}

async function headerUpdate(self, body) {
	const { source, data } = body

	try {
		sqlUtil.connect(db)

		data._modifyby = 1
		data._modifydate = (new Date()).toISOString()
		
		const cmd =  sqlUtil.createUpdateCommand(tablename, data, ['user_id'])
		const result = await cmd.execute(data)
		
		// record log
		let logdata = {source, tablename, section:headerSectionName, action:'UPDATE', id: data.user_id} 
		if (typeof Extender.logHeaderUpdate === 'function') {
			await Extender.logHeaderUpdate(logdata, data, result)
		}
		await self.log(logdata)

		return result
	} catch (err) {
		throw err
	}
}


async function headerDelete(self, body) {

	try {
		const { source, id } = body 
		const dataToRemove = {user_id: id}

		const cmd = sqlUtil.createDeleteCommand(tablename, ['user_id'])
		const result = await cmd.execute(dataToRemove)
	
		// record log
		await self.log({source, tablename, section:headerSectionName, action:'DELETE', id})

		return result
	} catch (err) {
		throw err
	}
}