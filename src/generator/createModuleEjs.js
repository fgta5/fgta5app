import { renderTemplate, kebabToCamel, isFileExist, getSectionData } from './helper.js'
import { fileURLToPath } from 'url';
import path from 'path';
import { access, writeFile } from 'fs/promises';

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
		const content = await renderTemplate(tplFilePath, variables);
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}