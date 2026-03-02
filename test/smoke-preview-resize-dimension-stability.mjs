import assert from 'node:assert/strict';

import { stabilizeResizeDimensionsDuringTitleEdit } from '../src/preview/resize-dimension-stability.js';

const createImageMock = () => {
  const attrs = new Map();
  return {
    getAttribute(name) {
      return attrs.has(name) ? attrs.get(name) : null;
    },
    setAttribute(name, value) {
      attrs.set(name, String(value));
    },
    hasAttribute(name) {
      return attrs.has(name);
    },
    removeAttribute(name) {
      attrs.delete(name);
    },
  };
};

{
  const image = createImageMock();
  image.setAttribute('src', './docs/screenshot.jpg');
  image.setAttribute('width', '200');
  image.setAttribute('height', '150');
  image.setAttribute('data-img-resize', '50%');

  // Seed stable resized dimensions from a valid resize state.
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), false);

  // Simulate transient edit: invalid resize title causes natural size in the same cycle.
  image.removeAttribute('data-img-resize');
  image.setAttribute('title', 'resize:');
  image.setAttribute('width', '400');
  image.setAttribute('height', '300');

  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), true);
  assert.equal(image.getAttribute('width'), '200');
  assert.equal(image.getAttribute('height'), '150');
}

{
  const image = createImageMock();
  image.setAttribute('src', './docs/first-input.jpg');
  image.setAttribute('width', '320');
  image.setAttribute('height', '240');

  // Seed baseline from non-resize state.
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), false);

  // First-time resize typing should keep the previous dimensions.
  image.setAttribute('title', 'res');
  image.setAttribute('width', '640');
  image.setAttribute('height', '480');
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), true);
  assert.equal(image.getAttribute('width'), '320');
  assert.equal(image.getAttribute('height'), '240');
}

{
  const image = createImageMock();
  image.setAttribute('src', './docs/remove-resize.jpg');
  image.setAttribute('width', '300');
  image.setAttribute('height', '225');
  image.setAttribute('title', 'resize:300px');

  // Active resize state seeds the hold window.
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), false);

  // When user clears resize text to empty, keep previous dimensions for a short period.
  image.setAttribute('title', '');
  image.setAttribute('width', '640');
  image.setAttribute('height', '480');
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), true);
  assert.equal(image.getAttribute('width'), '300');
  assert.equal(image.getAttribute('height'), '225');
}

{
  const image = createImageMock();
  image.setAttribute('src', './docs/invalid-after-resize.jpg');
  image.setAttribute('width', '300');
  image.setAttribute('height', '225');
  image.setAttribute('title', 'resize:300px');
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), false);

  // Even invalid one-letter states should keep size while hold window is active.
  image.setAttribute('title', 'x');
  image.setAttribute('width', '640');
  image.setAttribute('height', '480');
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), true);
  assert.equal(image.getAttribute('width'), '300');
  assert.equal(image.getAttribute('height'), '225');
}

{
  const image = createImageMock();
  image.setAttribute('src', './docs/invalid-stuck.jpg');
  image.setAttribute('width', '300');
  image.setAttribute('height', '225');
  image.setAttribute('title', 'resize:300px');
  image.naturalWidth = 640;
  image.naturalHeight = 480;
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), false);

  // If an invalid resize text remains for a while, fallback to natural dimensions.
  image.setAttribute('title', 'resize');
  image.setAttribute('width', '999');
  image.setAttribute('height', '777');
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), true);
  assert.equal(image.getAttribute('width'), '300');
  assert.equal(image.getAttribute('height'), '225');

  await new Promise((resolve) => setTimeout(resolve, 700));
  assert.equal(image.getAttribute('width'), '640');
  assert.equal(image.getAttribute('height'), '480');
}

{
  const image = createImageMock();
  image.setAttribute('width', '200');
  image.setAttribute('height', '150');
  image.setAttribute('data-img-resize', '50%');
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), false);

  // Plain title edits (not resize) should not lock previous dimensions.
  image.removeAttribute('data-img-resize');
  image.setAttribute('title', 'A normal caption');
  image.setAttribute('width', '400');
  image.setAttribute('height', '300');

  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(image), false);
  assert.equal(image.getAttribute('width'), '400');
  assert.equal(image.getAttribute('height'), '300');
}

{
  const beforeReplace = createImageMock();
  beforeReplace.setAttribute('src', './docs/replace-target.jpg');
  beforeReplace.setAttribute('width', '220');
  beforeReplace.setAttribute('height', '160');
  beforeReplace.setAttribute('data-img-resize', '55%');
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(beforeReplace), false);

  const afterReplace = createImageMock();
  afterReplace.setAttribute('src', './docs/replace-target.jpg');
  afterReplace.setAttribute('title', 'resize:');
  afterReplace.setAttribute('width', '400');
  afterReplace.setAttribute('height', '300');

  // Even when the image element is replaced, keep the last stable resized dimensions by src.
  assert.equal(stabilizeResizeDimensionsDuringTitleEdit(afterReplace), true);
  assert.equal(afterReplace.getAttribute('width'), '220');
  assert.equal(afterReplace.getAttribute('height'), '160');
}

console.log('smoke-preview-resize-dimension-stability: ok');

