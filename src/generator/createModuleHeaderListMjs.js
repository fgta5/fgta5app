import { renderTemplate, kebabToCamel, isFileExist, getSectionData } from './helper.js'
import { fileURLToPath } from 'url';
import path from 'path';
import { access, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleHeaderListMjs(context, sectionName='header', sectionPart='list', options) {
	const overwrite = options.overwrite===true
	const moduleName = context.moduleName
	const title = context.title
	const modulePart = kebabToCamel(`${moduleName}-${sectionName}-${sectionPart}`)
	const targetFile = path.join(context.moduleDir, `${modulePart}.mjs`)

	try {
		// cek dulu apakah file ada
		var fileExists = await isFileExist(targetFile)
		if (fileExists && !overwrite) {
			context.postMessage({message: `skip file: '${targetFile}`})
			return
		}

		const entityName = sectionName
		const entityData = context.entities[entityName]
		const sectionData = getSectionData(moduleName, entityName, entityData, 'list')

		const variables = {
			title: title,
			modulePart: modulePart,
			moduleName: moduleName,
		}

		
		const tplFilePath = path.join(__dirname, 'templates', 'moduleHeaderList.mjs.tpl')
		const content = await renderTemplate(tplFilePath, variables);
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}