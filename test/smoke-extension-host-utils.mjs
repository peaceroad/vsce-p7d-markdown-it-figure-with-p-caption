import assert from 'node:assert/strict';

import {
  escapeHtmlAttribute,
  parseFrontmatter,
  resolveEnvPath,
  createMdPathResolver,
} from '../src/core/extension-host-utils.js';

assert.equal(
  escapeHtmlAttribute('A&B"<>'),
  'A&amp;B&quot;&lt;&gt;'
);

assert.deepEqual(
  parseFrontmatter('\uFEFF---\nimgAltCaption: true\nurlImageBase: "https://example.com/a&b"\nflag: false\n# comment\n---\nbody'),
  {
    imgAltCaption: true,
    urlImageBase: 'https://example.com/a&b',
    flag: false,
  }
);

assert.equal(resolveEnvPath({ fsPath: 'C:\\docs\\x.md' }), 'C:\\docs\\x.md');
assert.equal(
  resolveEnvPath('vscode-resource://x', {
    parseUri: () => ({
      scheme: 'vscode-resource',
      fsPath: 'C:\\docs\\from-uri.md',
      path: '/docs/from-uri.md',
    }),
  }),
  'C:\\docs\\from-uri.md'
);

let activePath = '';
const resolver = createMdPathResolver({
  parseUri: (value) => {
    if (value === 'vscode-resource://one') {
      return {
        scheme: 'vscode-resource',
        fsPath: 'C:\\docs\\one.md',
        path: '/docs/one.md',
      };
    }
    throw new Error('Unexpected test URI');
  },
  getActiveMarkdownPath: () => activePath,
});

const envFromUri = { path: 'vscode-resource://one' };
assert.equal(resolver.resolve(envFromUri), 'C:\\docs\\one.md');
assert.equal(envFromUri.mdPath, 'C:\\docs\\one.md');

const envFromCache = {};
assert.equal(resolver.resolve(envFromCache), '');

activePath = 'C:\\docs\\active.md';
const envFromActive = {};
assert.equal(resolver.resolve(envFromActive), 'C:\\docs\\active.md');

activePath = '';
const envFromLast = {};
assert.equal(resolver.resolve(envFromLast), '');

console.log('smoke-extension-host-utils: ok');
