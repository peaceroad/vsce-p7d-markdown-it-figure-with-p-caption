import assert from 'node:assert/strict';

import { createMockDocument } from './helpers/fake-dom.mjs';

const document = createMockDocument();

const meta = document.createElement('meta');
meta.setAttribute('name', 'markdown-frontmatter');
meta.setAttribute(
  'content',
  JSON.stringify({
    _extensionSettings: {
      disableStyle: true,
    },
  }).replace(/"/g, '&quot;')
);

const styleLink = document.createElement('link');
styleLink.setAttribute('rel', 'stylesheet');
styleLink.setAttribute('href', 'vscode-resource:/style/figure-with-p-caption.css');

document.body.appendChild(meta);
document.body.appendChild(styleLink);

globalThis.document = document;

await import('../src/preview/set-img-attribute.js');
await new Promise((resolve) => setTimeout(resolve, 0));

assert.equal(styleLink.disabled, true);
assert.equal(styleLink.getAttribute('data-p7d-style-disabled'), '1');

console.log('smoke-disable-style: ok');
