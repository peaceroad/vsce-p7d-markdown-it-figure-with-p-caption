import assert from 'node:assert/strict';

import mditRendererFence from '@peaceroad/markdown-it-renderer-fence/markup-highlight';

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const createFenceToken = () => ({
  info: 'js {em-lines="2"}',
  content: 'line1\nline2\nline3\n',
  attrs: null,
  attrGet(name) {
    if (!this.attrs) return null;
    const pair = this.attrs.find((item) => item[0] === name);
    return pair ? pair[1] : null;
  },
  attrSet(name, value) {
    if (!this.attrs) this.attrs = [];
    const index = this.attrs.findIndex((item) => item[0] === name);
    if (index === -1) {
      this.attrs.push([name, value]);
    } else {
      this.attrs[index][1] = value;
    }
  },
  attrJoin(name, value) {
    if (!this.attrs) this.attrs = [];
    const index = this.attrs.findIndex((item) => item[0] === name);
    if (index === -1) {
      this.attrs.push([name, value]);
      return;
    }
    const current = this.attrs[index][1];
    this.attrs[index][1] = current ? `${current} ${value}` : value;
  },
});

const renderAttrs = (token) => {
  if (!token.attrs || token.attrs.length === 0) return '';
  return token.attrs
    .map(([name, value]) => ` ${name}="${String(value).replace(/"/g, '&quot;')}"`)
    .join('');
};

const md = {
  options: { langPrefix: 'language-' },
  utils: { escapeHtml },
  renderer: { rules: {} },
};

mditRendererFence(md, {
  setHighlight: false,
  setLineNumber: false,
  setEmphasizeLines: true,
});

const token = createFenceToken();
const html = md.renderer.rules.fence([token], 0, {}, {}, { renderAttrs });

assert.ok(html.includes('class="pre-lines-emphasis"'));
assert.ok(html.includes('data-pre-emphasis="2"'));

console.log('smoke-renderer-fence-em-lines: ok');
