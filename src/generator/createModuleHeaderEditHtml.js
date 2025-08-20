import { renderTemplate, kebabToCamel, isFileExist, getSectionData } from './helper.js'
import { fileURLToPath } from 'url';
import path from 'path';
import { access, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleHeaderEditHtml(context, sectionName='header', sectionPart='edit', options) {
	const overwrite = options.overwrite===true
	const moduleName = context.moduleName
	const title = context.title
	const modulePart = kebabToCamel(`${moduleName}-${sectionName}-${sectionPart}`)
	const targetFile = path.join(context.moduleDir, `${modulePart}.html`)

	try {
		// cek dulu apakah file ada
		var fileExists = await isFileExist(targetFile)
		if (fileExists && !overwrite) {
			context.postMessage({message: `skip file: '${targetFile}`})
			return
		}

		const entityName = sectionName
		const entityData = context.entities[entityName]
		const sectionData = getSectionData(moduleName, entityName, entityData, 'edit')

		const primaryKeyFieldData = entityData.Items[sectionData.primaryKey] 
		const primaryKeyElementId = primaryKeyFieldData.input_name

		const fields = []
		for (var fieldName in entityData.Items) {
			var item = entityData.Items[fieldName]
			var dataName = item.name
			var binding = item.data_fieldname
			var label = item.input_label

		}

		const variables = {
			title: title,
			moduleName: moduleName,
			modulePart: modulePart,
			moduleSection:  kebabToCamel(`${moduleName}-${sectionName}`),
			section: sectionData,
			primaryKeyElementId: primaryKeyElementId,
			fields: fields
		}
		
		
		const tplFilePath = path.join(__dirname, 'templates', 'moduleHeaderEdit.html.tpl')
		const content = await renderTemplate(tplFilePath, variables);
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}