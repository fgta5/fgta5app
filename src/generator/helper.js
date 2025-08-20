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


function evaluateExpression(expr, context) {
  const match = expr.match(/^([\w.]+)\s*(==|!=)\s*['"](.+?)['"]$/);
  if (!match) {
    const value = resolvePath(context, expr.trim());
    return !!value;
  }

  const [_, leftPath, operator, rightValue] = match;
  const leftValue = resolvePath(context, leftPath);

  if (operator === '==') return leftValue === rightValue;
  if (operator === '!=') return leftValue !== rightValue;
  return false;
}

function interpolate(content, context) {
  return content.replace(/{{\s*([\w.]+)\s*}}/g, (_, path) => {
    const value = resolvePath(context, path);
    return value !== undefined ? value : '';
  });
}

export function renderTemplate(template, variables) {
  let content = template;

  // Handle {{#each array}}...{{/each}}
  content = content.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g,
    (_, arrayName, block) => {
      const items = resolvePath(variables, arrayName);
      if (!Array.isArray(items)) return '';
      return items.map(item => interpolate(block, item)).join('');
    }
  );

  // Handle {{#if}}...{{else if}}...{{else}}...{{/if}}
  content = content.replace(/{{#if (.+?)}}([\s\S]*?){{\/if}}/g, (_, fullExpr, fullBlock) => {
    // Split into blocks: if, else if, else
    const parts = [];
    const regex = /{{(else if|else)?\s*(.*?)?}}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(fullBlock)) !== null) {
      const [tag, type, condition] = match;
      const index = match.index;

      parts.push({
        type: parts.length === 0 ? 'if' : parts[parts.length - 1].nextType,
        condition: parts.length === 0 ? fullExpr : parts[parts.length - 1].nextCondition,
        content: fullBlock.slice(lastIndex, index)
      });

      parts[parts.length - 1].nextType = type || 'else';
      parts[parts.length - 1].nextCondition = condition;
      lastIndex = index + tag.length;
    }

    // Push final block
    parts.push({
      type: parts[parts.length - 1].nextType || 'else',
      condition: parts[parts.length - 1].nextCondition,
      content: fullBlock.slice(lastIndex)
    });

    // Evaluate in order
    for (const part of parts) {
      if (part.type === 'else') return interpolate(part.content, variables);
      if (evaluateExpression(part.condition, variables)) {
        return interpolate(part.content, variables);
      }
    }

    return '';
  });

  // Final interpolation
  content = interpolate(content, variables);

  return content;
}


/*
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





function evaluateExpression(expr, context) {
  const match = expr.match(/^([\w.]+)\s*(==|!=)\s*['"](.+?)['"]$/);
  if (!match) {
    // Fallback: treat as truthy check
    const value = resolvePath(context, expr.trim());
    return !!value;
  }

  const [_, leftPath, operator, rightValue] = match;
  const leftValue = resolvePath(context, leftPath);

  if (operator === '==') return leftValue === rightValue;
  if (operator === '!=') return leftValue !== rightValue;
  return false;
}

function processTemplate(template, variables) {
  let content = template;

  // Handle {{#if condition}}...{{else}}...{{/if}}
  content = content.replace(/{{#if (.+?)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g,
    (_, conditionExpr, ifBlock, elseBlock) => {
      const result = evaluateExpression(conditionExpr, variables);
      return result ? ifBlock : elseBlock;
    }
  );

  // Handle {{#if condition}}...{{/if}} (no else)
  content = content.replace(/{{#if (.+?)}}([\s\S]*?){{\/if}}/g,
    (_, conditionExpr, ifBlock) => {
      const result = evaluateExpression(conditionExpr, variables);
      return result ? ifBlock : '';
    }
  );

  // Handle {{variable}} interpolation
  content = content.replace(/{{\s*([\w.]+)\s*}}/g,
    (_, path) => {
      const value = resolvePath(variables, path);
      return value !== undefined ? value : '';
    }
  );

  return content;
}
*/

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