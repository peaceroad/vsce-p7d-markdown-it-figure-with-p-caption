import assert from 'node:assert/strict';

import { createMockDocument } from './helpers/fake-dom.mjs';

const escapeHtmlAttribute = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const document = createMockDocument();

const meta = document.createElement('meta');
meta.setAttribute('name', 'markdown-frontmatter');
meta.setAttribute(
  'content',
  escapeHtmlAttribute(JSON.stringify({
    imgAltCaption: false,
    _extensionSettings: {
      imgAltCaption: 'Figure',
    },
  }))
);

const paragraph = document.createElement('p');
const image = document.createElement('img');
image.setAttribute('src', './docs/screenshot.jpg');
image.setAttribute('alt', 'A cat');
paragraph.appendChild(image);

document.body.appendChild(meta);
document.body.appendChild(paragraph);

globalThis.document = document;

await import('../src/preview/set-img-figure-caption.js');
await new Promise((resolve) => setTimeout(resolve, 0));

const figure = document.querySelector('figure');
assert.equal(figure, null);
assert.equal(image.getAttribute('alt'), 'A cat');

console.log('smoke-preview-frontmatter-priority: ok');
