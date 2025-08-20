// file: templateProcessor.js
import fs from 'fs/promises';


export function kebabToCamel(str) {
	return str
		.split('-')
		.map((part, index) =>
		index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
		)
		.join('');
}

export async function isFileExist(filepath) {
	try {
		await fs.access(filepath, fs.constants.F_OK);
		return true;
	} catch {
		return false;
	}
}


export function getSectionData(moduleName, entityName, data, sectionPart) {
	const sectionName = kebabToCamel(`${moduleName}-${entityName}-${sectionPart}`)
	const sectionTitle = capitalizeWords(`${sectionPart} ${data.title}`)

	return {
		sectionName: sectionName,
		sectionElementId: `${sectionName}-section`,
		sectionTitle: sectionTitle,
		primaryKey: data.pk,
		table: data.table
	}
}

export function capitalizeWords(input) {
	if (typeof input !== 'string') return '';

	return input
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function createAdditionalFieldConfiguration(item) {
	const cfg = []
	
	if (item.data_defaultvalue!='') {
		cfg.push(`value="${item.data_defaultvalue}"`)
	}

	if (item.input_charcase != 'normal') {
		cfg.push(`character-case="${item.input_charcase}"`)
	}
	
	if (item.Validation.isRequired) {
		cfg.push('required')
	}

	if (item.input_information!=null) {
		cfg.push(`description="${item.input_information}"`)
	}


	// data length in character
	if (item.component=='Textbox') {
		
		if (item.Validation.isMaximum) {
			cfg.push(`maxlength="${item.Validation.Maximum}"`)
		}

		if (item.Validation.isMinimum) {
			cfg.push(`minlength="${item.Validation.Minimum}"`)
		}

	} else if (item.component=='Numberbox') {

	}

	

	


	return cfg      
}
