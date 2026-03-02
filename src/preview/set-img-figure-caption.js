import setImgFigureCaption from '@peaceroad/markdown-imgattr-to-pcaption/script/set-img-figure-caption.js';
import { readFrontmatterMeta } from './frontmatter-meta.js';

const noop = () => {};
const CAPTION_OBSERVE_ATTRIBUTES = ['alt', 'title'];
const CAPTION_OBSERVE_DEBOUNCE_MS = 250;

const toStringCaptionOption = (value, mode) => {
  if (typeof value !== 'string') return null;
  const label = value.trim();
  if (!label) return null;
  return { mode, label };
};

const pickStringCaptionOption = (target) => {
  if (!target || typeof target !== 'object') return null;
  return (
    toStringCaptionOption(target.imgTitleCaption, 'title') ||
    toStringCaptionOption(target.imgAltCaption, 'alt')
  );
};

const resolveStringCaptionOption = (meta) => {
  if (!meta || typeof meta !== 'object') return null;
  const hasFrontmatterCaptionKeys = (
    Object.prototype.hasOwnProperty.call(meta, 'imgAltCaption') ||
    Object.prototype.hasOwnProperty.call(meta, 'imgTitleCaption')
  );
  if (hasFrontmatterCaptionKeys) {
    // When frontmatter declares either key, ignore extension-level string fallbacks.
    return pickStringCaptionOption(meta);
  }
  return pickStringCaptionOption(meta) || pickStringCaptionOption(meta._extensionSettings);
};

const buildFigureCaptionOptions = () => {
  const meta = readFrontmatterMeta();
  const option = {
    readMeta: true,
    observe: true,
    scope: 'standalone',
    observeAttributes: CAPTION_OBSERVE_ATTRIBUTES,
    observeMetaContent: true,
    observeChildList: true,
    observeDebounceMs: CAPTION_OBSERVE_DEBOUNCE_MS,
  };
  const stringCaption = resolveStringCaptionOption(meta);
  if (!stringCaption) return option;

  option.labelSet = { label: stringCaption.label };
  if (stringCaption.mode === 'title') {
    option.imgTitleCaption = true;
    option.imgAltCaption = false;
    option.autoLangDetection = false;
    option.observeAttributes = ['title'];
  } else {
    option.imgAltCaption = true;
    option.imgTitleCaption = false;
    option.autoLangDetection = false;
    option.observeAttributes = ['alt'];
  }
  return option;
};

const run = () => {
  setImgFigureCaption(buildFigureCaptionOptions()).catch(noop);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run, { once: true });
} else {
  run();
}
