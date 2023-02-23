'use strict';

const mdFigureWithPCaption = require('@peaceroad/markdown-it-figure-with-p-caption');
const mdRendererImage = require('@peaceroad/markdown-it-renderer-image');

const workspace = require('vscode').workspace;
const commands = require('vscode').commands;
const window = require('vscode').window;
const fs = require('fs');
let disableStyle = false;

async function activate() {

  function cacheCssFile (cssFilePath, cachedCssFilePath) {
    if (!fs.existsSync(cachedCssFilePath)) {
      fs.writeFileSync(cachedCssFilePath, fs.readFileSync(cssFilePath));
    }
    return;
  }

  const cssFile = 'figure-with-p-caption.css';
  const cssFilePath = __dirname + '/style/' + cssFile;
  const cachedCssFilePath = __dirname + '/style/_' + cssFile;

  workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.disableStyle')) {
      disableStyle = workspace.getConfiguration('p7dMarkdownItFigureWithPCaption').get('disableStyle');
      if (disableStyle) {
        cacheCssFile(cssFilePath, cachedCssFilePath);
        fs.writeFileSync(cssFilePath, '');
      } else {
        cacheCssFile(cssFilePath, cachedCssFilePath);
        fs.writeFileSync(cssFilePath, fs.readFileSync(cachedCssFilePath));
      }
      commands.executeCommand('workbench.action.reloadWindow')
    }
  });

  return {
    extendMarkdownIt(md) {
      md.use(mdRendererImage, {
        scaleSuffix: true,
        resize: true,
        lazyLoad: false,
        asyncDecode: false,
        mdPath: window.activeTextEditor.document.uri.fsPath,
      }).use(mdFigureWithPCaption, {
        strongFilename: true,
        dquoteFilename: true,
        oneImageWithoutCaption: true,
        bLabel: false,
        strongLabel: false,
        jointSpaceUseHalfWidth: true,
        hasNumClass: false,
        iframeWithoutCaption: true,
        removeUnnumberedLabel: true,
      });
      return md;
    }
  };
}

exports.activate = activate;
