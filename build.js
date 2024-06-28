const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const workerPath = path.join(__dirname, 'node_modules', 'sync-fetch', 'worker.js');

esbuild.build({
  entryPoints: ['./extension.js'],
  bundle: true,
  platform: 'node',
  target: "ES2020",
  outfile: 'dist/extension.js',
  external: ['vscode'],
  plugins: [
    {
      name: 'rewrite-worker-path',
      setup(build) {
        build.onEnd(() => {
          let code = fs.readFileSync('dist/extension.js', 'utf-8');
          code = code.replace(/path2\.join\(__dirname, "worker.js"\)/g, JSON.stringify(workerPath));
          fs.writeFileSync('dist/extension.js', code);
        });
      },
    },
  ],
}).catch(() => process.exit(1));