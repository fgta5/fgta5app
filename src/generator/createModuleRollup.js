import { renderTemplate } from './templateProcessor.js'
import { fileURLToPath } from 'url';
import path from 'path';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createModuleRollup(context) {
	const moduleName = context.moduleName
	const rollupFile = path.join(context.moduleDir, `__rollup.${moduleName}.js`)
	
	const variables = {
		moduleName: moduleName
	}

	try {
		const tplFilePath = path.join(__dirname, 'templates', '__rollup-module.tpl')
		const content = await renderTemplate(tplFilePath, variables);
		
		context.postMessage({message: `writing file: '${rollupFile}`})
		await writeFile(rollupFile, content, 'utf8');
	} catch (err) {
		throw err
	}
}