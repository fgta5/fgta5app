import { renderTemplate, kebabToCamel, isFileExist } from './helper.js'
import { fileURLToPath } from 'url';
import path from 'path';
import { access, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleExtenderMjs(context, options) {
	const overwrite = options.overwrite===true
	const moduleName = context.moduleName
	const targetFile = path.join(context.moduleDir, `${moduleName}-ext.mjs`)

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

		const tplFilePath = path.join(__dirname, 'templates', 'module-ext.mjs.tpl')
		const content = await renderTemplate(tplFilePath, variables);
				
		context.postMessage({message: `writing file: '${targetFile}`})
		await writeFile(targetFile, content, 'utf8');
	} catch (err) {
		throw err
	}

}