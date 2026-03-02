import { normalizeResizeValue } from '@peaceroad/markdown-it-renderer-image/script/img-util.js';

const pendingResizeTitleReg = /(?:resize|resized|リサイズ|サイズ|大きさ|[%％]|px)/i;
const partialResizePrefixReg = /^\s*r(?:e(?:s(?:i(?:z(?:e)?)?)?)?)?\s*:?\s*$/i;
const stableDimensionsByImage = new WeakMap();
const stableDimensionsBySource = new Map();
const maxStableSourceEntries = 256;
const resizeStateHoldMs = 600;
const holdAfterResizeClearMs = resizeStateHoldMs;
const invalidResizeFallbackDelayMs = resizeStateHoldMs;
const nowMs = () => (typeof Date.now === 'function' ? Date.now() : 0);

const isResizeTypingCandidate = (titleValue, titleResizeValue) => Boolean(
  titleValue &&
  !titleResizeValue &&
  (pendingResizeTitleReg.test(titleValue) || partialResizePrefixReg.test(titleValue))
);

const parsePositiveIntAttr = (imageElement, name) => {
  if (!imageElement || typeof imageElement.getAttribute !== 'function') return 0;
  const raw = imageElement.getAttribute(name);
  if (raw == null) return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value);
};

const readRenderedSize = (imageElement) => {
  if (!imageElement || typeof imageElement !== 'object') return { width: 0, height: 0 };
  if (typeof imageElement.getBoundingClientRect === 'function') {
    const rect = imageElement.getBoundingClientRect();
    const width = Number(rect?.width) || 0;
    const height = Number(rect?.height) || 0;
    if (width > 0 && height > 0) {
      return { width: Math.round(width), height: Math.round(height) };
    }
  }
  const width = Number(imageElement.clientWidth) || 0;
  const height = Number(imageElement.clientHeight) || 0;
  if (width > 0 && height > 0) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  return { width: 0, height: 0 };
};

const resolveImageState = (imageElement) => {
  let state = stableDimensionsByImage.get(imageElement);
  if (!state) {
    state = { width: 0, height: 0, holdUntil: 0, fallbackTimerId: null, sourceKey: '' };
    stableDimensionsByImage.set(imageElement, state);
  }
  return state;
};

const resolveImageSourceKey = (imageElement) => {
  if (!imageElement || typeof imageElement.getAttribute !== 'function') return '';
  const srcRaw = imageElement.getAttribute('data-img-src-raw');
  if (typeof srcRaw === 'string' && srcRaw.trim()) return srcRaw.trim();
  const src = imageElement.getAttribute('src');
  if (typeof src === 'string' && src.trim()) return src.trim();
  return '';
};

const setStableDimensionsBySource = (sourceKey, width, height) => {
  if (!sourceKey) return;
  stableDimensionsBySource.delete(sourceKey);
  stableDimensionsBySource.set(sourceKey, { width, height });
  while (stableDimensionsBySource.size > maxStableSourceEntries) {
    const oldestKey = stableDimensionsBySource.keys().next().value;
    if (!oldestKey) break;
    stableDimensionsBySource.delete(oldestKey);
  }
};

const clearInvalidFallbackTimer = (state) => {
  if (!state || !state.fallbackTimerId) return;
  clearTimeout(state.fallbackTimerId);
  state.fallbackTimerId = null;
};

const scheduleInvalidFallbackTimer = (imageElement, state) => {
  if (!state || typeof setTimeout !== 'function') return;
  clearInvalidFallbackTimer(state);
  state.fallbackTimerId = setTimeout(() => {
    state.fallbackTimerId = null;
    if (!imageElement || typeof imageElement.getAttribute !== 'function') return;
    if (typeof imageElement.setAttribute !== 'function') return;

    const liveTitle = imageElement.getAttribute('title') || '';
    const liveTitleResizeValue = normalizeResizeValue(liveTitle);
    if (!isResizeTypingCandidate(liveTitle, liveTitleResizeValue)) return;

    const naturalWidth = Number(imageElement.naturalWidth) || 0;
    const naturalHeight = Number(imageElement.naturalHeight) || 0;
    if (naturalWidth > 0 && naturalHeight > 0) {
      imageElement.setAttribute('width', String(Math.round(naturalWidth)));
      imageElement.setAttribute('height', String(Math.round(naturalHeight)));
      state.width = Math.round(naturalWidth);
      state.height = Math.round(naturalHeight);
      const sourceKey = resolveImageSourceKey(imageElement);
      setStableDimensionsBySource(sourceKey, state.width, state.height);
    }
    state.holdUntil = 0;
  }, invalidResizeFallbackDelayMs);
};

export const stabilizeResizeDimensionsDuringTitleEdit = (imageElement) => {
  if (!imageElement || typeof imageElement.getAttribute !== 'function') return false;
  if (typeof imageElement.setAttribute !== 'function') return false;

  const state = resolveImageState(imageElement);
  const sourceKey = resolveImageSourceKey(imageElement);
  const sourceChanged = Boolean(
    state.sourceKey &&
    sourceKey &&
    state.sourceKey !== sourceKey
  );
  if (sourceKey) state.sourceKey = sourceKey;
  if ((state.width <= 0 || state.height <= 0) && sourceKey) {
    const saved = stableDimensionsBySource.get(sourceKey);
    if (saved && saved.width > 0 && saved.height > 0) {
      state.width = saved.width;
      state.height = saved.height;
    }
  }
  if (state.width <= 0 || state.height <= 0) {
    const rendered = readRenderedSize(imageElement);
    if (rendered.width > 0 && rendered.height > 0) {
      state.width = rendered.width;
      state.height = rendered.height;
    }
  }
  if (state.width <= 0 || state.height <= 0) {
    const naturalWidth = Number(imageElement.naturalWidth) || 0;
    const naturalHeight = Number(imageElement.naturalHeight) || 0;
    if (naturalWidth > 0 && naturalHeight > 0) {
      state.width = Math.round(naturalWidth);
      state.height = Math.round(naturalHeight);
    }
  }
  const titleValue = imageElement.getAttribute('title') || '';
  const titleResizeValue = normalizeResizeValue(titleValue);
  const resizeTypingCandidate = isResizeTypingCandidate(titleValue, titleResizeValue);

  const currentWidth = parsePositiveIntAttr(imageElement, 'width');
  const currentHeight = parsePositiveIntAttr(imageElement, 'height');
  const isResizeActive = Boolean(titleResizeValue);
  const now = nowMs();
  if ((isResizeActive || resizeTypingCandidate || sourceChanged) && now > 0) {
    state.holdUntil = now + holdAfterResizeClearMs;
  }
  if (resizeTypingCandidate) {
    scheduleInvalidFallbackTimer(imageElement, state);
  } else {
    clearInvalidFallbackTimer(state);
  }
  const isWithinHoldWindow = Boolean(now > 0 && state.holdUntil > now);
  const isPendingResizeEdit = Boolean(
    titleValue &&
    !titleResizeValue &&
    (resizeTypingCandidate || isWithinHoldWindow)
  );
  const isHoldAfterClear = Boolean(
    !titleValue &&
    isWithinHoldWindow
  );

  // Keep the latest non-pending dimensions as the stable baseline.
  // This also covers the first-time resize typing flow (no prior valid resize state).
  if (!isPendingResizeEdit && !isHoldAfterClear && currentWidth > 0 && currentHeight > 0) {
    state.width = currentWidth;
    state.height = currentHeight;
    setStableDimensionsBySource(sourceKey, currentWidth, currentHeight);
  }

  if (!isPendingResizeEdit && !isHoldAfterClear) {
    return false;
  }
  if (state.width <= 0 || state.height <= 0) {
    return false;
  }

  let changed = false;
  if (currentWidth !== state.width) {
    imageElement.setAttribute('width', String(state.width));
    changed = true;
  }
  if (currentHeight !== state.height) {
    imageElement.setAttribute('height', String(state.height));
    changed = true;
  }
  return changed;
};
