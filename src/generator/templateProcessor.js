// file: templateProcessor.js
import fs from 'fs/promises';

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

      // Temukan semua {{...}} dalam block
      const matches = [...block.matchAll(/{{\s*([\w.]+)\s*}}/g)];

      for (const match of matches) {
        const fullKey = match[1];
        const value = resolvePath(item, fullKey);
        const regex = new RegExp(`{{\\s*${fullKey}\\s*}}`, 'g');
        rendered = rendered.replace(regex, value);
      }

      return rendered;
    }).join('');
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