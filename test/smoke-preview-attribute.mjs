import assert from 'node:assert/strict';

import { createMockDocument } from './helpers/fake-dom.mjs';

const document = createMockDocument();
const meta = document.createElement('meta');
const paragraph = document.createElement('p');
const image = document.createElement('img');

meta.setAttribute('name', 'markdown-frontmatter');
meta.setAttribute(
  'content',
  JSON.stringify({
    _extensionSettings: {
      rendererImage: {
        lazyLoad: true,
      },
    },
  }).replace(/"/g, '&quot;')
);
image.setAttribute('src', './docs/screenshot.jpg');
image.setAttribute('alt', 'A cat');
paragraph.appendChild(image);
document.body.appendChild(meta);
document.body.appendChild(paragraph);

globalThis.document = document;
globalThis.location = { protocol: 'file:' };

await import('../src/preview/set-img-attribute.js');
await new Promise((resolve) => setTimeout(resolve, 0));

assert.equal(image.getAttribute('loading'), 'lazy');
assert.equal(image.getAttribute('alt'), 'A cat');

console.log('smoke-preview-attribute: ok');
