// file: templateProcessor.js

/**
 * Resolve nested property path like "user.alamat.kota"
 * @param {Object} obj - source object
 * @param {string} path - dot-separated path
 * @returns {*} resolved value or undefined
 */
function resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * Evaluate simple expressions like "user.nama == 'Agung'"
 * Supports: == and !=
 * @param {string} expr - expression string
 * @param {Object} context - data context
 * @returns {boolean}
 */
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

/**
 * Replace all {{key}} or {{nested.key}} in content
 * @param {string} content - template block
 * @param {Object} context - data context
 * @returns {string}
 */
function interpolate(content, context) {
  return content.replace(/{{\s*([\w.]+)\s*}}/g, (_, path) => {
    const value = resolvePath(context, path);
    return value !== undefined ? value : '';
  });
}

/**
 * Main template rendering function
 * Supports:
 * - {{variable}}
 * - {{#if expr}}...{{else if expr}}...{{else}}...{{/if}}
 * - {{#each array}}...{{/each}}
 * @param {string} template - raw template string
 * @param {Object} variables - data context
 * @returns {string} rendered output
 */
export function renderTemplate(template, variables) {
  let content = template;

  // 🔁 Handle {{#each array}}...{{/each}}
  content = content.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g,
    (_, arrayName, block) => {
      const items = resolvePath(variables, arrayName);
      if (!Array.isArray(items)) return '';
      return items.map(item => renderTemplate(block, item)).join('');
    }
  );

  // 🔘 Handle {{#if}}...{{else if}}...{{else}}...{{/if}}
  content = content.replace(/{{#if (.+?)}}([\s\S]*?){{\/if}}/g,
    (_, firstCondition, fullBlock) => {
      const segments = [];
      const regex = /{{(else if|else)?\s*(.*?)?}}/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(fullBlock)) !== null) {
        const [tag, type, condition] = match;
        const index = match.index;

        segments.push({
          type: segments.length === 0 ? 'if' : segments[segments.length - 1].nextType,
          condition: segments.length === 0 ? firstCondition : segments[segments.length - 1].nextCondition,
          content: fullBlock.slice(lastIndex, index)
        });

        segments[segments.length - 1].nextType = type || 'else';
        segments[segments.length - 1].nextCondition = condition;
        lastIndex = index + tag.length;
      }

      segments.push({
        type: segments[segments.length - 1].nextType || 'else',
        condition: segments[segments.length - 1].nextCondition,
        content: fullBlock.slice(lastIndex)
      });

      for (const segment of segments) {
        if (segment.type === 'else') return interpolate(segment.content, variables);
        if (evaluateExpression(segment.condition, variables)) {
          return interpolate(segment.content, variables);
        }
      }

      return '';
    }
  );

  // 🔧 Final interpolation
  content = interpolate(content, variables);

  return content;
}
