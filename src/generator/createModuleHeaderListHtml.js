import { renderTemplate } from './templateProcessor.js'
import { kebabToCamel, isFileExist, getSectionData } from './helper.js'
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';

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

			if (!item.showInGrid) {
				continue
			}

			let component = item.component
			let dataName = item.name
			let binding = item.data_fieldname
			let label = item.input_label
			let formatter = null

			if (component==='Checkbox') {
				formatter = 'formatter="checkmark(value)"'
			} 
		
			// columnDefinition = `<th data-name="${dataName}" binding="${binding}" ${formatter} text-align="center">${label}</th>`
			// columnDefinition = `<th data-name="${dataName}" binding="${binding}">${label}</th>`


			fields.push({  
				component: component,
				dataName: dataName,
				binding: binding,
				label: label,
				formatter:formatter
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
		const template = await fs.readFile(tplFilePath, 'utf-8');
		const content = ejs.render(template, variables)
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await fs.writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}