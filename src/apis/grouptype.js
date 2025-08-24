import pgp from 'pg-promise';

import db from '../app-db.js'
import Api from '../api.js'
import sqlUtil from '@agung_dhewe/pgsqlc'

import * as Extender from './extenders/grouptype-apiext.js'

const moduleName = 'grouptype'
const headerSectionName = 'header'
const headerTableName = 'core.grouptype'

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
	async init(body) { return await grouptype_init(this, body) }

	// header
	async headerList(body) { return await grouptype_headerList(this, body) }
	async headerOpen(body) { return await grouptype_headerOpen(this, body) }
	async headerUpdate(body) { return await grouptype_headerUpdate(this, body)}
	async headerCreate(body) { return await grouptype_headerCreate(this, body)}
	async headerDelete(body) { return await grouptype_headerDelete(this, body) }

}


async function grouptype_init(self, body) {
	console.log('init generator')
	self.req.session.sid = self.req.sessionID

	try {
		// ambil data app dari database
		const sql = 'select apps_id, apps_url from core."apps"'
		const result = await db.any(sql)

		const appsUrls = {}
		for (let row of result) {
			appsUrls[row.apps_id] = {
				url: row.apps_url
			}
		}

		return {
			userId: self.context.userId,
			userFullname: self.context.userFullname,
			sid: self.context.sid ,
			notifierId: self.context.notifierId,
			notifierSocket: self.context.notifierSocket,
			appsUrls: appsUrls
		}
	} catch (err) {
		throw err
	}
}


async function grouptype_headerList(self, body) {
	const { criteria={}, limit=0, offset=0, columns=[], sort={} } = body
	const searchMap = {
		searchtext: `grouptype_id=try_cast_int(\${searchtext}, 0) OR grouptype_name ILIKE '%' || \${searchtext} || '%' OR grouptype_descr ILIKE '%' || \${searchtext} || '%'`,
	};

	try {
	
		// jika tidak ada default searchtext
		if (searchMap.searchtext===undefined) {
			throw new Error(`'searchtext' belum didefinisikan di searchMap`)	
		}
		

		// hilangkan criteria '' atau null
		for (var cname in criteria) {
			if (criteria[cname]==='' || criteria[cname]===null) {
				delete criteria[cname]
			}
		}


		var max_rows = limit==0 ? 10 : limit
		const {whereClause, queryParams} = sqlUtil.createWhereClause(criteria, searchMap) 
		const sql = sqlUtil.createSqlSelect({tablename:headerTableName, columns, whereClause, sort, limit:max_rows+1, offset, queryParams})
		const rows = await db.any(sql, queryParams);

		
		var i = 0
		const data = []
		for (var row of rows) {
			i++
			if (i>max_rows) { break }

			// TODO: buat program untuk lookup data disini


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

async function grouptype_headerOpen(self, body) {
	try {
		const { id } = body 
		const criteria = { grouptype_id: id }
		const searchMap = { grouptype_id: `grouptype_id = \${grouptype_id}`}
		const {whereClause, queryParams} = sqlUtil.createWhereClause(criteria, searchMap) 
		const sql = sqlUtil.createSqlSelect({
			tablename: headerTableName, 
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


		// lookup data
		// TODO: buat program untuk lookup data disini


		// pasang extender untuk olah data
		if (typeof Extender.headerOpen === 'function') {
			await Extender.headerOpen(data)
		}

		return data
	} catch (err) {
		throw err
	}
}


async function grouptype_headerCreate(self, body) {
	const { source, data } = body

	try {
		sqlUtil.connect(db)

		data._createby = 1
		data._createdate = (new Date()).toISOString()


		const cmd = sqlUtil.createInsertCommand(headerTableName, data, ['grouptype_id'])
		const result = await cmd.execute(data)
		
		// record log
		let logdata = {moduleName, source, tablename:headerTableName, section:headerSectionName, action:'CREATE', id: result.grouptype_id}
		await self.log(logdata)
		
		return result
	} catch (err) {
		throw err
	}
}

async function grouptype_headerUpdate(self, body) {
	const { source, data } = body

	try {
		sqlUtil.connect(db)

		data._modifyby = 1
		data._modifydate = (new Date()).toISOString()
		
		const cmd =  sqlUtil.createUpdateCommand(headerTableName, data, ['grouptype_id'])
		const result = await cmd.execute(data)
		
		// record log
		let logdata = {moduleName, source, tablename:headerTableName, section:headerSectionName, action:'UPDATE', id: data.grouptype_id} 
		await self.log(logdata)

		return result
	} catch (err) {
		throw err
	}
}


async function grouptype_headerDelete(self, body) {

	try {
		const { source, id } = body 
		const dataToRemove = {grouptype_id: id}

		const cmd = sqlUtil.createDeleteCommand(headerTableName, ['grouptype_id'])
		const result = await cmd.execute(dataToRemove)
	
		// record log
		let logdata = {moduleName, source, tablename:headerTableName, section:headerSectionName, action:'DELETE', id}
		await self.log(logdata)

		return result
	} catch (err) {
		throw err
	}
}