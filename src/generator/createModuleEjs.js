import { kebabToCamel, isFileExist, getSectionData } from './helper.js'
import { fileURLToPath } from 'url';
import path from 'path'
import fs from 'fs/promises'
import ejs from 'ejs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleEjs(context, options) {
	const overwrite = options.overwrite===true
	const moduleName = context.moduleName
	const targetFile = path.join(context.moduleDir, `${moduleName}.ejs`)

	try {
		// cek dulu apakah file ada
		var fileExists = await isFileExist(targetFile)
		if (fileExists && !overwrite) {
			context.postMessage({message: `skip file: '${targetFile}`})
			return
		}

		let sections = []
		for (var entityName in context.entities) {
			// console.log(context.entities[entityName])
			sections.push(getSectionData(moduleName, entityName, context.entities[entityName], 'list'))
			sections.push(getSectionData(moduleName, entityName, context.entities[entityName], 'edit'))
		}

		const variables = {
			moduleName: moduleName,
			sections: sections
		}

		const tplFilePath = path.join(__dirname, 'templates', 'module.ejs.tpl')
		const template = await fs.readFile(tplFilePath, 'utf-8');
		const content = renderTemplate(template, variables);
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await fs.writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}