import pgp from 'pg-promise'
import db from '../../app-db.js'
import { workerData, parentPort } from 'worker_threads';
import { access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

const { generator_id } = workerData;


main(generator_id)


async function main(id) {
	try {
		const queryParams = {generator_id: id}
		const sql = 'select generator_data from core."generator" where generator_id = \${generator_id}'
		const data = await db.one(sql, queryParams);

		await generate(data.generator_data)

		
	} catch (err) {
		err.message = `Generator Worker: ${err.message}`
		throw err
	}
}

async function sleep(s) {
	return new Promise(lanjut=>{
		setTimeout(()=>{
			lanjut()
		}, s*1000)	
	})
}

async function generate(data) {
	const directory = data.directory
	const appname = data.appname
	const modulename = data.name

	try {
		await prepareDirectory(appname, modulename, directory)


	} catch (err) {
		throw err
	}
}

async function prepareDirectory(appname, modulename, directory) {
	try {

		parentPort.postMessage({message: `preparing directory`})
		await sleep(5)

		// cek jika directory project exists
		const projectDirExists = await directoryExists(directory)
		if (!projectDirExists) {
			throw new Error(`directory tujuan '${directory}' tidak ditemukan`)
		}

		const moduleDir = path.join(directory, 'public', 'modules', modulename)
		const apiDir = path.join(directory, 'src', 'apis')
		const apiExtenderDir = path.join(apiDir, 'extenders')

		const moduleDirExists =  await directoryExists(moduleDir)
		if (!moduleDirExists) {
			// direktori modul tidak ditemukan, buat dulu
			parentPort.postMessage({message: `creating new directory: '${moduleDir}`})
			await sleep(5)

		}

		const apiDirExists =  await directoryExists(apiDir)
		if (!apiDirExists) {
			throw new Error(`directory tujuan '${apiDir}' tidak ditemukan`)
		}

		const apiExtenderDirExists =  await directoryExists(apiExtenderDir)
		if (!apiExtenderDirExists) {
			throw new Error(`directory tujuan '${apiExtenderDir}' tidak ditemukan`)
		}

	} catch (err) {
		throw err
	}
}

async function directoryExists(path) {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

// async function main(generator_id) {
//   let t = 0;
 
//   let interval = setInterval(() => {
//     t++;
//     console.log(`progress of generate ${generator_id}: ${t}`)

// 	// if (t==5) {
// 	// 	throw new Error('ini error aja')
// 	// }


// 	if (t==20) {
// 		parentPort.postMessage({
// 			done: true,
// 			result: 'abc bac'
// 		})
// 		clearInterval(interval)
// 		interval = null
// 	} else {
// 		parentPort.postMessage({
// 			done: false,
// 			progress: t,
// 			message: `generate ${generator_id}: ${t}`
// 		})
// 	}

//   }, 1000);
// }