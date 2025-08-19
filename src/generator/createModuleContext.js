import { renderTemplate, kebabToCamel } from './templateProcessor.js'
import { fileURLToPath } from 'url';
import path from 'path';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleContext(context) {
	const moduleName = context.moduleName
	const targetFile = path.join(context.moduleDir, `${moduleName}-context.js`)
	
	try {

		let sections = []
		for (var entityName in context.entities) {
			var sectionNameList = kebabToCamel(`${moduleName}-${entityName}-list`)
			sections.push({
				sectionName: sectionNameList,
				sectionData: `${sectionNameList}-section`
			})

			var sectionNameEdit = kebabToCamel(`${moduleName}-${entityName}-edit`)
			sections.push({
				sectionName: sectionNameEdit,
				sectionData: `${sectionNameEdit}-section`
			})
		}

		const variables = {
			moduleName: moduleName,
			sections: sections
		}

		const tplFilePath = path.join(__dirname, 'templates', 'module-context.tpl')
		const content = await renderTemplate(tplFilePath, variables);
		
		context.postMessage({message: `writing file: '${targetFile}`})
		await writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}
}