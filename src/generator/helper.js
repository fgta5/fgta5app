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

  // console.log(data)

  return {
    sectionName: sectionName,
    sectionElementId: `${sectionName}-section`,
    sectionTitle: sectionTitle,
    primaryKey: data.pk,
    table: data.table
  }
}

/**
 * Mengubah setiap kata dalam string menjadi kapitalisasi huruf pertama
 * Contoh: 'list user' → 'List User'
 * @param {string} input
 * @returns {string}
 */
function capitalizeWords(input) {
  if (typeof input !== 'string') return '';

  return input
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}