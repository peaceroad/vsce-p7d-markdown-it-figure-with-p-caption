'use strict';

const mdFigureWithPCaption = require('@peaceroad/markdown-it-figure-with-p-caption');
const mdRendererImage = require('@peaceroad/markdown-it-renderer-image');

const workspace = require('vscode').workspace;
const window = require('vscode').window;
const fs = require('fs');

async function activate() {

  function cacheCssFile (cssFilePath, cachedCssFilePath) {
    if (!fs.existsSync(cachedCssFilePath)) {
      fs.writeFileSync(cachedCssFilePath, fs.readFileSync(cssFilePath));
    }
    return;
  }

  function updateCss (cssFilePath, cachedCssFilePath) {
    if (workspace.getConfiguration('p7dMarkdownItFigureWithCaption').get('disableStyle')) {
      cacheCssFile(cssFilePath, cachedCssFilePath);
      fs.writeFileSync(cssFilePath, '');
    } else {
      cacheCssFile(cssFilePath, cachedCssFilePath);
      fs.writeFileSync(cssFilePath, fs.readFileSync(cachedCssFilePath));
    }
    return;
  }

  const cssFile = 'figure-with-p-caption.css';
  const cssFilePath = __dirname + '/style/' + cssFile;
  const cachedCssFilePath = __dirname + '/style/_' + cssFile;

  workspace.onDidChangeConfiguration(event => {
    const cs = event.affectsConfiguration('p7dMarkdownItFigureWithPCaption');
    if (cs.get('disableStyle')) {
      updateCss(cssFilePath, cachedCssFilePath);
    }
  });


  let mdPath = window.activeTextEditor.document.uri.fsPath;

  return {
    extendMarkdownIt(md) {
      md.use(mdFigureWithPCaption).use(mdRendererImage, {
        'scaleSuffix': true,
        'mdPath': mdPath,
      });
      return md;
    }
  };
}

exports.activate = activate;
