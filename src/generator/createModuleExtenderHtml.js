import { renderTemplate } from './templateProcessor.js'
import { kebabToCamel, isFileExist } from './helper.js'
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleExtenderHtml(context, options) {
	const overwrite = options.overwrite===true
	const moduleName = context.moduleName
	const targetFile = path.join(context.moduleDir, `${moduleName}-ext.html`)

	try {
		// cek dulu apakah file ada
		var fileExists = await isFileExist(targetFile)
		if (fileExists && !overwrite) {
			context.postMessage({message: `skip file: '${targetFile}`})
			return
		}

		const variables = {
			moduleName: moduleName,
		}

		const tplFilePath = path.join(__dirname, 'templates', 'module-ext.html.tpl')
		const template = await fs.readFile(tplFilePath, 'utf-8');
		const content = renderTemplate(template, variables);
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await fs.writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}