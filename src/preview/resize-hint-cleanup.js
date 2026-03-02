export const DEFAULT_RESIZE_DATA_ATTR = 'data-img-resize';

export const resolveResizeDataAttr = (meta) => {
  if (!meta || typeof meta !== 'object') return DEFAULT_RESIZE_DATA_ATTR;
  const extensionSettings = meta._extensionSettings;
  if (!extensionSettings || typeof extensionSettings !== 'object') {
    return DEFAULT_RESIZE_DATA_ATTR;
  }
  const rendererImage = extensionSettings.rendererImage;
  if (!rendererImage || typeof rendererImage !== 'object') {
    return DEFAULT_RESIZE_DATA_ATTR;
  }
  if (typeof rendererImage.resizeDataAttr === 'string') {
    return rendererImage.resizeDataAttr.trim();
  }
  return DEFAULT_RESIZE_DATA_ATTR;
};

export const buildObserveAttributeFilter = (baseAttributes, resizeDataAttr) => {
  const normalized = [];
  const seen = new Set();

  const addAttr = (name) => {
    if (typeof name !== 'string') return;
    const trimmed = name.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    normalized.push(trimmed);
  };

  if (Array.isArray(baseAttributes)) {
    for (const attrName of baseAttributes) addAttr(attrName);
  }
  addAttr(resizeDataAttr);

  return normalized;
};

const isImgElement = (node) => Boolean(
  node &&
  node.nodeType === 1 &&
  node.tagName === 'IMG'
);

export const clearStaleResizeHints = (mutations, resizeDataAttr) => {
  if (!Array.isArray(mutations)) return false;
  if (typeof resizeDataAttr !== 'string' || !resizeDataAttr.trim()) return false;

  const tracked = new Map();

  for (const mutation of mutations) {
    if (!mutation || mutation.type !== 'attributes') continue;
    const target = mutation.target;
    if (!isImgElement(target)) continue;

    const attrName = typeof mutation.attributeName === 'string'
      ? mutation.attributeName
      : '';
    if (attrName !== 'title' && attrName !== resizeDataAttr) continue;

    let state = tracked.get(target);
    if (!state) {
      state = { titleChanged: false, resizeAttrChanged: false };
      tracked.set(target, state);
    }
    if (attrName === 'title') state.titleChanged = true;
    if (attrName === resizeDataAttr) state.resizeAttrChanged = true;
  }

  let cleaned = false;
  for (const [img, state] of tracked.entries()) {
    if (!state.titleChanged || state.resizeAttrChanged) continue;

    const titleValue = img.getAttribute('title') || '';
    if (titleValue.trim()) continue;

    if (img.hasAttribute(resizeDataAttr)) {
      img.removeAttribute(resizeDataAttr);
      cleaned = true;
    }
  }

  return cleaned;
};
