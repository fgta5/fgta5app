import { kebabToCamel, isFileExist, getSectionData } from './helper.js'
import { fileURLToPath } from 'url';
import path from 'path'
import fs from 'fs/promises'
import ejs from 'ejs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleHeaderEditMjs(context, sectionName='header', sectionPart='edit', options) {
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

		// 			section: getSectionData(moduleName, entityName, context.entities[entityName], 'edit')
		const fields = []
		for (var fieldName in entityData.Items) {
			const item = entityData.Items[fieldName]

			if (!item.showInForm) {
				continue
			}

			const fieldname = item.data_fieldname
			const inputname = item.input_name
			const elementId = `${modulePart}-${item.input_name}`

			fields.push({  
				fieldname,
				inputname,
				elementId
			})
		}


		
		const variables = {
			title: title,
			modulePart: modulePart,
			moduleName: moduleName,
			moduleSection:  kebabToCamel(`${moduleName}-${sectionName}`),
			fields: fields
		}

		
		
		const tplFilePath = path.join(__dirname, 'templates', 'moduleHeaderEdit.mjs.ejs')
		const template = await fs.readFile(tplFilePath, 'utf-8');
		const content = ejs.render(template, variables)
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await fs.writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}