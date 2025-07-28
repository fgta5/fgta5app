import pgp from 'pg-promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = process.argv;
const inputIndex = args.indexOf('-i');

const db = pgp()({
	port: process.env.DB_PORT,
	host:  process.env.DB_HOST,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
});



await main()

async function main() {
	try {

		let inputFile
		if (inputIndex !== -1 && args[inputIndex + 1]) {
			inputFile = args[inputIndex + 1];
		} else {
			throw new Error('input file not specified. use with -i <your file>')
		}


		const data = await readRequstedJson(`${inputFile}.json`)

		const [schema, tablename]  = data.tablename.split('.');
		const primarykey = data.primarykey

		let fileContent = `-- ${data.tablename}  --\n`
		fileContent += '-- DLL File ---'
		
		
		// buat tablenya jika belum ada
		const sqlCek = sqlCekTableExists()
		const res = await db.one(sqlCek, {schema:schema, tablename:tablename});
		const datatype = data.fields[data.primarykey].type
		const sql = sqlCreateTable(schema, tablename, primarykey, datatype, data.descr ?? '')
		fileContent += `\n\n-- Create table: ${schema}."${tablename}\n`
		fileContent += sql

		if (!res.exists) {
			await db.none(sql)
		}

		// tambahkan fieldnya
		fileContent += "\n\n-- =============================================\n"
		fileContent += "-- FIELDS \n"
		fileContent += "-- =============================================\n"

		for (var fieldname in data.fields) {
			if (fieldname==primarykey) {
				continue
			}

			fileContent += `\n\n\n\n-- **** ${fieldname} *******************************************\n`

			const field = data.fields[fieldname]
			const sqlCekField = sqlCekFieldExists()
			const res = await db.one(sqlCekField, {schema:schema, tablename:tablename, fieldname:fieldname});
			

			const sqlAdd = sqlAddField(schema, tablename, fieldname, field)
			fileContent += `\n-- ADD Column\n`
			fileContent += sqlAdd

			const sqlModify = sqlModifyField(schema, tablename, fieldname, field)
			fileContent += `\n-- MODIFY Column\n`
			fileContent += sqlModify


			if (!res.exists) {
				await db.none(sqlAdd) 
			} else {
				// ALTER MODIFY
				// cek dulu tipe data
				// const sqlCekColumn = sqlGetFieldInfo()
				// const fieldinfo = await db.one(sqlCekColumn, {schema:schema, tablename:tablename, fieldname:fieldname})
				await db.none(sqlModify) 
			}
			


			fileContent += `\n\n-- Foreign Key Constraint\n`
			// cek constraint
			const fk_name = fieldname
			const sqlCekFk = pgp.as.format(sqlCekFkExists())
			const resfk = await db.one(sqlCekFk, {schema:schema, tablename:tablename, fk_name:fk_name});

			const sqlDropFk = `ALTER TABLE ${schema}."${tablename}" DROP CONSTRAINT ${fk_name};`
			fileContent += `\n\n-- Remove Constraint if Available\n`
			fileContent += sqlDropFk
			if (resfk.exists) {
				// hapus dulu FK nya
				await db.none(sqlDropFk)
			}
			
			if (field.ref_table) {
				// kalau harus ada ref, buat refnya
				const [ref_schema, ref_tablename]  = field.ref_table.split('.');
				const sqlAddFk = `
					ALTER TABLE ${schema}."${tablename}"
						ADD CONSTRAINT ${fk_name}
						FOREIGN KEY (${fieldname})
						REFERENCES ${ref_schema}."${ref_tablename}"(${field.ref_id})
				`
				fileContent += `\n\n-- ADD Constraint\n`
				fileContent += sqlAddFk
				await db.none(sqlAddFk)
			}
			

			
		}
		

		
		// hapus semua UNIQUE constraint
		const sqlGetIniques = `
			SELECT constraint_name
			FROM information_schema.table_constraints
			WHERE constraint_type = 'UNIQUE'
				AND table_schema = \${schema}
				AND table_name = \${tablename};		
		`
		const resUniques = await db.any(sqlGetIniques, {schema:schema, tablename:tablename});

		fileContent += `\n\n-- Clear All Unique Constraint\n`
		for (var unique of resUniques) {
			const sqlDropUnique = `
				ALTER TABLE ${schema}."${tablename}"
					DROP CONSTRAINT ${unique.constraint_name};
			`
			fileContent += sqlDropUnique
			fileContent += "\n"
			await db.none(sqlDropUnique)
		}
		
	

		// buat kembali unique constratint
		fileContent += `\n\n-- Recreate Unique Constraint\n`
		for (var uniquename in data.uniques) {
			const arrUniqueFields = data.uniques[uniquename]
			const uniquefields = arrUniqueFields.join(', ')
			const sqlAddUnique = `
				ALTER TABLE  ${schema}."${tablename}"
					ADD CONSTRAINT ${uniquename} UNIQUE (${uniquefields});			
			`
			fileContent += sqlAddUnique
			fileContent += "\n"
			await db.none(sqlAddUnique)
		}

		
		// tambahkan postsql
		const sqlPost = await readRequstedPostSQL(`${inputFile}.sql`)
		if (sqlPost.trim()!='') {
			fileContent += "\n\n\n-- POST SQL ================================"
			fileContent += sqlPost
			await db.none(sqlPost)
		}
	
		
		const filetarget = path.join(__dirname, '..', 'sql', `${data.tablename}.sql`)
		await fs.writeFile(filetarget, fileContent);

	} catch (err) {
		console.error(err.message)
		process.exit(1);
	} finally {
		await db.$pool.end()
	}
}


function sqlCreateTable(schema, tablename, primarykey, type, descr="") {
	var datatype
	if (type=='auto' || type=='bigint auto always') {
		datatype = 'BIGINT GENERATED ALWAYS AS IDENTITY'
	} else if (type=='int auto always') {
		datatype = 'INT GENERATED ALWAYS AS IDENTITY'
	} else if (type=='bigint auto') {
		datatype = 'BIGINT GENERATED BY DEFAULT AS IDENTITY'
	} else if (type=='int auto') {
		datatype = 'INT GENERATED BY DEFAULT AS IDENTITY'
	} else {
		datatype = `${type} NOT NULL`
	}


	return `
		CREATE TABLE ${schema}."${tablename}" (
			${primarykey} ${datatype},
			CONSTRAINT ${tablename}_pk PRIMARY KEY (${primarykey})
		);
		COMMENT ON TABLE ${schema}."${tablename}" IS '${descr}';
	`
}

function getDefaultValueOf(datatype, defaultvalue) {
	var defaultvalue
	var type = getTypeOfSqlData(datatype)
	if (type=='string') {
		defaultvalue = `'${defaultvalue}'`
	} else if (type=='timestamp') {
 		defaultvalue = `(now())`
	} else if (type=='date') {
		defaultvalue = '(now())'
	} else {
		defaultvalue = defaultvalue
	}
	return defaultvalue;
}

function getTypeOfSqlData(sqlType) {
  const type = sqlType.toLowerCase();
  if (type.startsWith('varchar') || type.startsWith('text') || type.startsWith('char')) return 'string';
  if (type.startsWith('decimal') || type.startsWith('numeric')) return 'number'; 
  if (type === 'int' || type === 'integer' || type === 'smallint') return 'number';
  if (type === 'bigint') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type.includes('timestamp')) return 'timestamp';
  if (type.includes('date')) return 'date';
  return 'unknown';
}

function sqlAddField(schema, tablename, fieldname, data) {

	var allownull = data.allownull===false ? false : true 
	var setnull = allownull ? 'NULL' : 'NOT NULL'
	var defaultvalue = getDefaultValueOf(data.type, data.defaultvalue)
	var comment = data.description ?? '';
	var setdefault 
	if (allownull) {
		setdefault = ''
	} else {
		if (defaultvalue===undefined) {
			setdefault = ''
		} else {
			setdefault = `DEFAULT ${defaultvalue}`
		}
	}

	var datatype
	if (data.type=='timestamp') {
		datatype = `${data.type} WITH TIME ZONE`
	} else {
		datatype = data.type
	}
	
	return `
		ALTER TABLE ${schema}."${tablename}" ADD ${fieldname} ${datatype} ${setnull} ${setdefault};
		COMMENT ON COLUMN ${schema}."${tablename}".${fieldname} IS '${comment}';
	`
}

function sqlModifyField(schema, tablename, fieldname, data) {
	var alternull
	var setdefault
	var allownull = data.allownull===false ? false : true 
	if (allownull) {
		alternull = `ALTER COLUMN ${fieldname} DROP NOT NULL`
		setdefault = `ALTER COLUMN ${fieldname} DROP DEFAULT`
	} else {
		var defaultvalue = getDefaultValueOf(data.type, data.defaultvalue)
		alternull = `ALTER COLUMN ${fieldname} SET NOT NULL`
		if (defaultvalue===undefined) {
			setdefault = `ALTER COLUMN ${fieldname} DROP DEFAULT`
		} else {
			setdefault = `ALTER COLUMN ${fieldname} SET DEFAULT ${defaultvalue}`
		}
	}
	var comment = data.description ?? '';
	
	var datatype
	if (data.type=='timestamp') {
		datatype = `${data.type} WITH TIME ZONE`
	} else {
		datatype = data.type
	}


	return `
		ALTER TABLE ${schema}."${tablename}" 
			ALTER COLUMN ${fieldname} TYPE ${datatype},
			${setdefault},
			${alternull};
		COMMENT ON COLUMN ${schema}."${tablename}".${fieldname} IS '${comment}';
	`
}

function sqlCekTableExists() {
	return `
		SELECT EXISTS (
			SELECT 1 
			FROM information_schema.tables 
			WHERE table_schema = \${schema}
			AND table_name = \${tablename}
		) AS "exists"	
	`
}


function sqlCekFieldExists() {
	return  `
		SELECT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = \${schema}
		AND table_name = \${tablename}
		AND column_name = \${fieldname}
	) AS "exists"`
}

function sqlGetFieldInfo() {
	return `
		SELECT 
			column_name,
			data_type,
			character_maximum_length,
			numeric_precision,
			numeric_scale,
			column_name,
			is_nullable,
			column_default
		FROM information_schema.columns
		WHERE table_schema = \${schema}
			AND table_name = \${tablename}
			AND column_name = \${fieldname};
	`
}

function sqlCekFkExists() {
	return `
		SELECT EXISTS (
		SELECT 1
		FROM information_schema.table_constraints
		WHERE constraint_type = 'FOREIGN KEY'
			AND table_schema = \${schema}
			AND table_name = \${tablename}
			AND constraint_name = \${fk_name}
		) AS "exists";	
	`
}

async function readRequstedJson(inputFile) {
	try {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.join(path.dirname(__filename), '..', 'dbbuilder');
		const filePath = path.resolve(__dirname, inputFile);

		const content = await fs.readFile(filePath, 'utf8');
    	const jsonData = JSON.parse(content);

		return jsonData
	} catch (err) {
		throw err
	}
	
}

async function readRequstedPostSQL(inputFile) {
	try {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.join(path.dirname(__filename), '..', 'dbbuilder');
		const filePath = path.resolve(__dirname, inputFile);
		if (await exists(filePath)) {
			const sql = await fs.readFile(filePath, 'utf8');
			return sql
		} else {
			return ""
		}
	} catch (err) {
		throw err
	}
	
}

async function exists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

