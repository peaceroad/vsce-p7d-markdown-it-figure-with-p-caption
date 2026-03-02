import assert from 'node:assert/strict';

import { createMockDocument } from './helpers/fake-dom.mjs';
import {
  DEFAULT_RESIZE_DATA_ATTR,
  resolveResizeDataAttr,
  buildObserveAttributeFilter,
  clearStaleResizeHints,
} from '../src/preview/resize-hint-cleanup.js';

const document = createMockDocument();

const image1 = document.createElement('img');
image1.setAttribute(DEFAULT_RESIZE_DATA_ATTR, '100px');
const cleaned1 = clearStaleResizeHints(
  [{ type: 'attributes', target: image1, attributeName: 'title' }],
  DEFAULT_RESIZE_DATA_ATTR
);
assert.equal(cleaned1, true);
assert.equal(image1.hasAttribute(DEFAULT_RESIZE_DATA_ATTR), false);

const image2 = document.createElement('img');
image2.setAttribute(DEFAULT_RESIZE_DATA_ATTR, '100px');
const cleaned2 = clearStaleResizeHints(
  [
    { type: 'attributes', target: image2, attributeName: 'title' },
    { type: 'attributes', target: image2, attributeName: DEFAULT_RESIZE_DATA_ATTR },
  ],
  DEFAULT_RESIZE_DATA_ATTR
);
assert.equal(cleaned2, false);
assert.equal(image2.getAttribute(DEFAULT_RESIZE_DATA_ATTR), '100px');

const image3 = document.createElement('img');
image3.setAttribute('title', 'resize: 100px');
image3.setAttribute(DEFAULT_RESIZE_DATA_ATTR, '100px');
const cleaned3 = clearStaleResizeHints(
  [{ type: 'attributes', target: image3, attributeName: 'title' }],
  DEFAULT_RESIZE_DATA_ATTR
);
assert.equal(cleaned3, false);
assert.equal(image3.getAttribute(DEFAULT_RESIZE_DATA_ATTR), '100px');

const image4 = document.createElement('img');
image4.setAttribute('data-custom-resize', '100px');
const cleaned4 = clearStaleResizeHints(
  [{ type: 'attributes', target: image4, attributeName: 'title' }],
  'data-custom-resize'
);
assert.equal(cleaned4, true);
assert.equal(image4.hasAttribute('data-custom-resize'), false);

assert.equal(resolveResizeDataAttr(null), DEFAULT_RESIZE_DATA_ATTR);
assert.equal(
  resolveResizeDataAttr({
    _extensionSettings: {
      rendererImage: {
        resizeDataAttr: 'data-custom-resize',
      },
    },
  }),
  'data-custom-resize'
);

assert.deepEqual(
  buildObserveAttributeFilter(['src', 'title'], DEFAULT_RESIZE_DATA_ATTR),
  ['src', 'title', DEFAULT_RESIZE_DATA_ATTR]
);
assert.deepEqual(
  buildObserveAttributeFilter(['title', DEFAULT_RESIZE_DATA_ATTR], 'data-custom-resize'),
  ['title', DEFAULT_RESIZE_DATA_ATTR, 'data-custom-resize']
);

console.log('smoke-preview-resize-hint-cleanup: ok');
