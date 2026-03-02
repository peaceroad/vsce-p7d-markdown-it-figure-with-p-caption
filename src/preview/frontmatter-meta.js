const META_SELECTOR = 'meta[name="markdown-frontmatter"]';
const HTML_ENTITY_MAP = {
  amp: '&',
  quot: '"',
  lt: '<',
  gt: '>',
};

const parseJsonObject = (value) => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const decodeHtmlEntitiesOnce = (value) => {
  if (typeof value !== 'string' || !value.includes('&')) return value;
  return value.replace(/&(amp|quot|lt|gt);/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(HTML_ENTITY_MAP, key)
      ? HTML_ENTITY_MAP[key]
      : match
  ));
};

let lastMetaTag = null;
let lastContent = null;
let lastParsed = null;

export const readFrontmatterMeta = () => {
  const metaTag = document.querySelector(META_SELECTOR);
  if (!metaTag) {
    lastMetaTag = null;
    lastContent = null;
    lastParsed = null;
    return null;
  }

  const content = metaTag.getAttribute('content');
  if (!content) return null;
  if (metaTag === lastMetaTag && content === lastContent) {
    return lastParsed;
  }

  let parsed = parseJsonObject(content);
  if (!parsed && content.includes('&')) {
    parsed = parseJsonObject(decodeHtmlEntitiesOnce(content));
  }

  lastMetaTag = metaTag;
  lastContent = content;
  lastParsed = parsed;
  return parsed;
};
