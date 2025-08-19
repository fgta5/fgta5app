// file: templateProcessor.js
import fs from 'fs/promises';
import { constants } from 'fs';

/**
 * Resolve nested property path like "info.nama" from an object
 * @param {Object} obj - source object
 * @param {string} path - dot-separated path
 * @returns {*} resolved value or empty string
 */
function resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
}


/**
 * Render template content with variables
 * Supports:
 * - {{key}} for simple replacement
 * - {{info.nama}} for nested access
 * - {{#each items}}...{{/each}} for array looping
 * - {{#if key}}...{{/if}} for conditional rendering
 * @param {string} filePath - path to template file
 * @param {Object} variables - data to inject
 * @returns {Promise<string>} rendered content
 */
export async function renderTemplate(filePath, variables) {
  let content = await fs.readFile(filePath, 'utf-8');

  // 🔁 Handle looping blocks: {{#each key}}...{{/each}}
  content = content.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (_, key, block) => {
    const items = variables[key];
    if (!Array.isArray(items)) return '';

    return items.map(item => {
      let rendered = block;

      // Replace all {{...}} inside loop block
      const matches = [...block.matchAll(/{{\s*([\w.]+)\s*}}/g)];
      for (const match of matches) {
        const fullKey = match[1];
        const value = resolvePath(item, fullKey);
        const regex = new RegExp(`{{\\s*${fullKey}\\s*}}`, 'g');
        rendered = rendered.replace(regex, value);
      }

      // Handle {{#if key}} inside loop block
      rendered = rendered.replace(/{{#if ([\w.]+)}}([\s\S]*?){{\/if}}/g, (_, condKey, ifBlock) => {
        const condition = resolvePath(item, condKey);
        return condition ? ifBlock : '';
      });

      return rendered;
    }).join('');
  });

  // 🔘 Handle {{#if key}} outside loop
  content = content.replace(/{{#if ([\w.]+)}}([\s\S]*?){{\/if}}/g, (_, condKey, ifBlock) => {
    const condition = resolvePath(variables, condKey);
    return condition ? ifBlock : '';
  });

  // 🔧 Replace simple variables outside loop
  const matches = [...content.matchAll(/{{\s*([\w.]+)\s*}}/g)];
  for (const match of matches) {
    const fullKey = match[1];
    const value = resolvePath(variables, fullKey);
    const regex = new RegExp(`{{\\s*${fullKey}\\s*}}`, 'g');
    content = content.replace(regex, value);
  }

  return content;
}


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
    await fs.access(filepath, constants.F_OK);
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