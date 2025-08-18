import pgp from 'pg-promise';

import db from '../app-db.js'
import Api from '../api.js'
import sqlUtil from '@agung_dhewe/pgsqlc'

import { Worker } from 'worker_threads';
import jwt from 'jsonwebtoken';


// api: account
export default class extends Api {
	constructor(req, res, next) {
		super(req, res, next);
	}

	// dipanggil dengan model snake syntax
	// contoh: header-list
	//         header-open-data
	async init(body) { return await generator_init(this, body) }
	async list(body) { return await generator_list(this, body) }
	async open(body) { return await generator_open(this, body) }
	async save(body) { return await generator_save(this, body) }
	async generate(body) { return await generator_generate(this, body) }

}

async function generator_init(self, body) {
	console.log('init generator')
	self.req.session.sid = self.req.sessionID

	return {
		sid: self.req.sessionID,
		notifierHost: self.req.app.locals.appConfig.notifierHost
	}
}


async function generator_list(self, body) {
	const { criteria={}, limit=0, offset=0, columns=[], sort={} } = body
	const searchMap = {
		searchtext: `generator_modulename ILIKE '%' || \${searchtext} || '%' OR generator_id=try_cast_bigint(\${searchtext}, 0)`
	};

	try {
	
		// hilangkan criteria '' atau null
		for (var cname in criteria) {
			if (criteria[cname]==='' || criteria[cname]===null) {
				delete criteria[cname]
			}
		}


		var max_rows = limit==0 ? 10 : limit
		const tablename = 'core."generator"'
		const {whereClause, queryParams} = sqlUtil.createWhereClause(criteria, searchMap) 
		const sql = sqlUtil.createSqlSelect({tablename, columns, whereClause, sort, limit:max_rows+1, offset, queryParams})
		const rows = await db.any(sql, queryParams);

		
		var i = 0
		const data = []
		for (var row of rows) {
			i++
			if (i>max_rows) { break }
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

async function generator_open(self, body) {
	try {
		const { id } = body 
		const queryParams = {generator_id: id}
		const sql = 'select * from core."generator" where generator_id = \${generator_id}'
		const data = await db.one(sql, queryParams);

		if (data==null) { throw new Error("data tidak ditemukan") }	

		return data
	} catch (err) {
		throw err
	}
}

async function generator_save(self, body) {
	const { data } = body
	const tablename = 'core."generator"'

	try {
		sqlUtil.connect(db)



		const id = `${data.id}`

		delete data.id
		const obj = {
			generator_appname: data.appname,
			generator_modulename: data.name,
			generator_data: JSON.stringify(data),
		}

		let cmd
		if (id=='') {
			obj._createby = 1
			obj._createdate = (new Date()).toISOString()
			cmd = sqlUtil.createInsertCommand(tablename, obj, ['generator_id'])
		} else {
			obj.generator_id = id
			obj._modifyby = 1
			obj._modifydate = (new Date()).toISOString()
			cmd = sqlUtil.createUpdateCommand(tablename, obj, ['generator_id'])
		}
		const result = await cmd.execute(obj)

		return result
	} catch (err) {
		throw err
	}
}


async function generator_generate(self, body) {
	const { data } = body
	const id = `${data.id}`

	try {
		if (id=='') {
			throw new Error('save data dahulu sebelum generate')
		}

		// sebelumnya save dahulu
		const result = await generator_save(self, body)
		const jobId = '123456'

		result.jobId = jobId


		// generate di thread lain
		const params = {
			jobId: jobId,
			generator_id: result.generator_id,
			sid: self.req.sessionID
		};

		result.wsparam = params
		// const worker = new Worker('./src/apis/workers/generator-worker.js', {
		// 	workerData: params
		// });


		return result
	} catch (err) {
		throw err
	}
}