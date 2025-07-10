import pgp from 'pg-promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = pgp()({
	port: process.env.DB_PORT,
	host:  process.env.DB_HOST,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
});


const pad = (str, length) => {
  return str.toString().padEnd(length, ' ');
}

const body = {
	criteria: {
		searchtext: 'na',
		// user_isdisabled: true
	},
	limit: 0, 
	offset: 0, 
	columns:['user_id', 'user_fullname', 'user_isdisabled'],
	sort:{
		user_fullname: 'asc',
		user_isdisabled: 'desc'
	}
}


const searchMap = {
	searchtext: `user_fullname ILIKE '%' || \${searchtext} || '%' OR user_id=try_cast_bigint(\${searchtext}::text, 0)`,
	user_isdisabled: `user_isdisabled = \${user_isdisabled}`
};



main(body)

async function main(body) {
	const { criteria={}, limit=0, offset=0, columns=[], sort={} } = body

	try {

		const table = 'core."user"'

		const queryParams = {}
		const whereClause = []
		for (var searchkey in criteria) {
			if (searchMap[searchkey]==null) {
				throw new Error(`${searchkey} belum didefinisikan pada search pattern`)
			}

			var searchvalue = criteria[searchkey]
			if (Array.isArray(searchvalue)) {
				const values = {};
				const parts = searchvalue.map((val, idx) => {
					const paramName = `${searchkey}_${idx}`;
					values[paramName] = val;
					// return pgp.as.format(searchMap.searchtext, { searchtext: `\${${paramName}}` });
					return pgp.as.format(searchMap.searchtext, { searchtext: val });
				});
				
				Object.assign(queryParams, values)
				whereClause.push('(' + parts.join(') OR (') + ')')
			} else if (typeof searchvalue === "string") {
				queryParams[searchkey] = searchvalue
				whereClause.push(searchMap[searchkey])
			} else if (typeof searchvalue==='number' || typeof searchvalue==='boolean') {
				queryParams[searchkey] = String(searchvalue)
				whereClause.push(searchMap[searchkey])
			} else {
				throw new Error(`terdapat kesalahan pada criteria, '${searchkey}' harus berupa string, number atau array`)
			}
		}		

		// batasi column
		let coldef = '*'
		if (columns.length>0) {
			coldef = columns.join(', ')
		}
		
		let sql = `select ${coldef} from ${table}`
		if (whereClause.length>0) {
			sql += ' where (' + whereClause.join(') AND (') + ')'
		}
		
		// sort column
		if (Object.keys(sort).length > 0) {
			const sortClause = []
			for (var sortkey in sort) {
				sortClause.push(`${sortkey} ${sort[sortkey]}`)
			}
			sql += ' order by ' + sortClause.join(', ')
		}

		// limit rows to retrieve
		if (limit>0) {
			queryParams.limit = limit
			sql += ' limit ${limit} '
		}

		// starting row to retrieve
		if (offset>0) {
			queryParams.offset = offset
			sql += ' offset ${offset} '
		}


		// tampilkan hasilnya
		const rows = await db.any(sql, queryParams);
		console.log('----------------------------------------------------------')
		rows.forEach(row => {
			console.log(row)
			// console.log(pad(row.user_fullname, 30) + pad(row.user_isdisabled, 5))	
		});
		console.log('----------------------------------------------------------')

	} catch (err) {
		console.log(err)
	} finally {
		await db.$pool.end()
	}
}
