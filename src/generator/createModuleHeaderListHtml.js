import { renderTemplate, kebabToCamel, isFileExist, getSectionData } from './helper.js'
import { fileURLToPath } from 'url';
import path from 'path';
import { access, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleHeaderListHtml(context, sectionName='header', sectionPart='list', options) {
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
		const sectionData = getSectionData(moduleName, entityName, entityData, 'list')
		
		const fields = []
		for (var fieldName in entityData.Items) {
			const item = entityData.Items[fieldName]
			var dataName = item.name
			var binding = item.data_fieldname
			var label = item.input_label

			let columnDefinition = ''
			if (item.component==='Checkbox') {
				var formatter = `formatter="checkmark(value)"`
				columnDefinition = `<th data-name="${dataName}" binding="${binding}" ${formatter} text-align="center">${label}</th>`
			} else {
				columnDefinition = `<th data-name="${dataName}" binding="${binding}">${label}</th>`
			}
			fields.push({ columnDefinition 

				
			})
		}

		const variables = {
			title: title,
			moduleName: moduleName,
			modulePart: modulePart,
			moduleSection:  kebabToCamel(`${moduleName}-${sectionName}`),
			section: sectionData,
			fields: fields
		}
		
		
		const tplFilePath = path.join(__dirname, 'templates', 'moduleHeaderList.html.tpl')
		const content = await renderTemplate(tplFilePath, variables);
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}