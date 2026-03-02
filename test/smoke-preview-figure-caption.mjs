import assert from 'node:assert/strict';

import { createMockDocument } from './helpers/fake-dom.mjs';

const document = createMockDocument();

const meta = document.createElement('meta');
meta.setAttribute('name', 'markdown-frontmatter');
meta.setAttribute(
  'content',
  JSON.stringify({
    _extensionSettings: {
      imgAltCaption: 'Figure & Co',
    },
  })
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
assert.ok(figure);
assert.equal(figure.getAttribute('class'), 'f-img');

const figcaption = figure.querySelector('figcaption');
assert.ok(figcaption);
assert.equal(figcaption.textContent, 'Figure & Co. A cat');
assert.equal(image.getAttribute('alt'), '');

console.log('smoke-preview-figure-caption: ok');
