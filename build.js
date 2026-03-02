import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const srcDir = path.join(__dirname, 'src');
const srcPreviewDir = path.join(srcDir, 'preview');
const distDir = path.join(__dirname, 'dist');
const distJsDir = path.join(distDir, 'js');

const resolveSyncFetchWorkerPath = () => {
  try {
    return require.resolve('sync-fetch/worker.js');
  } catch {
    return path.join(__dirname, 'node_modules', 'sync-fetch', 'worker.js');
  }
};

const workerSourcePath = resolveSyncFetchWorkerPath();
const workerDestPath = path.join(distDir, 'worker.js');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const copyRequiredFile = (source, dest) => {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing required build asset: ${source}. Run npm install and retry.`);
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(source, dest);
};

const nodeBanner = `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`.trim();

const buildExtension = () => esbuild.build({
  entryPoints: [path.join(srcDir, 'extension.js')],
  bundle: true,
  minify: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: path.join(distDir, 'extension.js'),
  banner: {
    js: nodeBanner,
  },
  external: ['vscode'],
});

const buildPreviewScript = ({ entryFile, outputFile, target }) => {
  return esbuild.build({
    entryPoints: [path.join(srcPreviewDir, entryFile)],
    bundle: true,
    minify: true,
    platform: 'browser',
    format: 'iife',
    target,
    outfile: path.join(distJsDir, outputFile),
  });
};

const build = async () => {
  ensureDir(distDir);
  ensureDir(distJsDir);
  copyRequiredFile(workerSourcePath, workerDestPath);

  await Promise.all([
    buildExtension(),
    buildPreviewScript({
      entryFile: 'set-img-attribute.js',
      outputFile: 'set-img-attribute.js',
      target: 'es2020',
    }),
    buildPreviewScript({
      entryFile: 'set-img-figure-caption.js',
      outputFile: 'set-img-figure-caption.js',
      target: 'es2017',
    }),
  ]);
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
