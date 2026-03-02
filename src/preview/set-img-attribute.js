import { runInPreview } from '@peaceroad/markdown-it-renderer-image/script/set-img-attributes.js';
import { readFrontmatterMeta } from './frontmatter-meta.js';
import {
  DEFAULT_RESIZE_DATA_ATTR,
  resolveResizeDataAttr,
  buildObserveAttributeFilter,
  clearStaleResizeHints,
} from './resize-hint-cleanup.js';
import { stabilizeResizeDimensionsDuringTitleEdit } from './resize-dimension-stability.js';

const noop = () => {};
const STYLE_FILE_NAME = 'figure-with-p-caption.css';
const STYLE_MARK_ATTR = 'data-p7d-style-disabled';
const PREVIEW_OBSERVE_ATTRIBUTE_FILTER_BASE = ['src', 'title'];
const RESIZE_HINT_CLEANUP_OBSERVE_ATTRIBUTE_FILTER_BASE = ['title', 'width', 'height', 'src', DEFAULT_RESIZE_DATA_ATTR];
const PREVIEW_OBSERVE_DEBOUNCE_MS = 250;

const resolveDisableStyle = (meta) => {
  if (!meta || typeof meta !== 'object') return false;
  const extensionSettings = meta._extensionSettings;
  return Boolean(
    extensionSettings &&
    typeof extensionSettings === 'object' &&
    extensionSettings.disableStyle === true
  );
};

const isTargetStyleLink = (node) => {
  if (!node || node.nodeType !== 1 || node.tagName !== 'LINK') return false;
  const href = node.getAttribute('href') || '';
  if (!href.includes(STYLE_FILE_NAME)) return false;
  const rel = (node.getAttribute('rel') || '').toLowerCase();
  return rel === '' || rel === 'stylesheet';
};

const applyDisableStyle = (disabled) => {
  if (typeof document.querySelector === 'function' && !document.querySelector('link')) return;
  const links = document.querySelectorAll('link');
  for (const link of links) {
    if (!isTargetStyleLink(link)) continue;
    if (disabled) {
      link.disabled = true;
      link.setAttribute(STYLE_MARK_ATTR, '1');
      continue;
    }
    if (link.getAttribute(STYLE_MARK_ATTR) === '1') {
      link.disabled = false;
      link.removeAttribute(STYLE_MARK_ATTR);
    }
  }
};

let lastDisableStyle = null;
const syncDisableStyle = (meta = readFrontmatterMeta()) => {
  const disabled = resolveDisableStyle(meta);
  if (disabled === false && lastDisableStyle === false) return;
  applyDisableStyle(disabled);
  lastDisableStyle = disabled;
};

const hasRelevantNode = (node) => {
  if (!node || node.nodeType !== 1) return false;
  if (isTargetStyleLink(node)) return true;
  if (node.tagName === 'META' && node.getAttribute('name') === 'markdown-frontmatter') {
    return true;
  }
  if (typeof node.querySelector !== 'function') return false;
  if (node.querySelector('meta[name="markdown-frontmatter"]')) return true;
  const firstLink = node.querySelector('link');
  if (!firstLink) return false;
  if (isTargetStyleLink(firstLink)) return true;
  if (typeof node.querySelectorAll === 'function') {
    const links = node.querySelectorAll('link');
    for (const link of links) {
      if (isTargetStyleLink(link)) return true;
    }
  }
  return false;
};

let observerStarted = false;
let syncScheduled = false;
let resizeHintCleanupObserverStarted = false;
const scheduleSyncDisableStyle = () => {
  if (syncScheduled) return;
  syncScheduled = true;
  const flush = () => {
    syncScheduled = false;
    syncDisableStyle();
  };
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(flush);
    return;
  }
  setTimeout(flush, 0);
};

const ensureResizeHintCleanupObserver = (meta = readFrontmatterMeta()) => {
  if (resizeHintCleanupObserverStarted || typeof MutationObserver !== 'function') return;
  resizeHintCleanupObserverStarted = true;
  const resizeDataAttr = resolveResizeDataAttr(meta);
  const resizeHintCleanupObserveAttributeFilter = buildObserveAttributeFilter(
    RESIZE_HINT_CLEANUP_OBSERVE_ATTRIBUTE_FILTER_BASE,
    resizeDataAttr
  );

  const stabilizeImageNode = (node) => {
    if (!node || node.nodeType !== 1) return;
    if (node.tagName === 'IMG') {
      stabilizeResizeDimensionsDuringTitleEdit(node);
      enforceResponsiveImageHeight(node);
      return;
    }
    if (typeof node.querySelectorAll !== 'function') return;
    const images = node.querySelectorAll('img');
    for (const imageElement of images) {
      stabilizeResizeDimensionsDuringTitleEdit(imageElement);
      enforceResponsiveImageHeight(imageElement);
    }
  };

  const observer = new MutationObserver((mutations) => {
    clearStaleResizeHints(mutations, resizeDataAttr);
    for (const mutation of mutations) {
      if (!mutation) continue;
      if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (!target || target.nodeType !== 1 || target.tagName !== 'IMG') continue;
        stabilizeResizeDimensionsDuringTitleEdit(target);
        continue;
      }
      if (mutation.type !== 'childList' || !mutation.addedNodes) continue;
      for (const node of mutation.addedNodes) {
        stabilizeImageNode(node);
      }
    }
  });

  const observeOption = {
    attributes: true,
    childList: true,
    subtree: true,
  };
  if (resizeHintCleanupObserveAttributeFilter.length > 0) {
    observeOption.attributeFilter = resizeHintCleanupObserveAttributeFilter;
  }
  observer.observe(document.documentElement || document, observeOption);
};

const enforceResponsiveImageHeight = (imageElement) => {
  if (!imageElement || typeof imageElement !== 'object') return;
  if (typeof imageElement.closest !== 'function' || !imageElement.closest('figure')) return;
  const style = imageElement.style;
  if (!style || typeof style !== 'object') return;

  if (!style.height) {
    style.height = 'auto';
  }
  if (!style.maxWidth) {
    style.maxWidth = '100%';
  }
};

const primeResponsiveImageStyles = (root = document) => {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  const images = root.querySelectorAll('figure img');
  for (const imageElement of images) {
    enforceResponsiveImageHeight(imageElement);
  }
};

const ensureObserver = () => {
  if (observerStarted || typeof MutationObserver !== 'function') return;
  observerStarted = true;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (!mutation) continue;
      if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (
          target &&
          target.nodeType === 1 &&
          target.tagName === 'META' &&
          target.getAttribute('name') === 'markdown-frontmatter' &&
          mutation.attributeName === 'content'
        ) {
          scheduleSyncDisableStyle();
          return;
        }
        if (mutation.attributeName === 'href' && isTargetStyleLink(target)) {
          scheduleSyncDisableStyle();
          return;
        }
        continue;
      }
      if (mutation.type !== 'childList') continue;
      for (const node of mutation.addedNodes) {
        if (!hasRelevantNode(node)) continue;
        scheduleSyncDisableStyle();
        return;
      }
    }
  });

  observer.observe(document.documentElement || document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['content', 'href'],
  });
};

const run = () => {
  const meta = readFrontmatterMeta();
  const resizeDataAttr = resolveResizeDataAttr(meta);
  const observeAttributeFilter = buildObserveAttributeFilter(
    PREVIEW_OBSERVE_ATTRIBUTE_FILTER_BASE,
    resizeDataAttr
  );

  syncDisableStyle(meta);
  primeResponsiveImageStyles(document);
  ensureObserver();
  ensureResizeHintCleanupObserver(meta);
  runInPreview({
    root: document,
    readMeta: true,
    observe: true,
    observeAttributeFilter,
    observeDebounceMs: PREVIEW_OBSERVE_DEBOUNCE_MS,
    enableSizeProbe: true,
    keepPreviousDimensionsDuringResizeEdit: true,
    onResizeHintEditingStateChange: (imageElement) => {
      stabilizeResizeDimensionsDuringTitleEdit(imageElement);
    },
    onImageProcessed: (imageElement) => {
      stabilizeResizeDimensionsDuringTitleEdit(imageElement);
      enforceResponsiveImageHeight(imageElement);
    },
  }).catch(noop);
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(syncDisableStyle);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run, { once: true });
} else {
  run();
}
