'use strict';

const mdFigureWithPCaption = require('@peaceroad/markdown-it-figure-with-p-caption');
const mdRendererImage = require('@peaceroad/markdown-it-renderer-image');

const workspace = require('vscode').workspace;
const config = workspace.getConfiguration('p7dMarkdownItFigureWithPCaption');
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

  let exOption = {
    removeUnnumberedLabelExceptMarks: config.get('displayUnnumberedLabelMarks'),
    removeUnnumberedLabel: !config.get('displayUnnumberedLabel'),
    dquoteFilename: config.get('setDoubleQuoteFileName'),
    strongFilename: config.get('setDoubleAsteriskFileName'),
    jointSpaceUseHalfWidth: config.get('convertJointSpaceToHalfWidth'),
    setImageElementAttributes: !config.get('notSetImageElementAttributes'),
    iframeWithoutCaption: config.get('wrapIframeWithoutCaptionByFigure'),
    videoWithoutCaption: config.get('wrapVideoWithoutCaptionByFigure'),
    };


  workspace.onDidChangeConfiguration(event => {

    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.displayUnnumberedLabelMarks')) {
      exOption.removeUnnumberedLabelExceptMarks = !config.get('displayUnnumberedLabelMarks');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.displayUnnumberedLabel')) {
      exOption.removeUnnumberedLabel = !config.get('displayUnnumberedLabel');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.setDoubleQuoteFileName')) {
      exOption.dquoteFileName = config.get('setDoubleQuoteFileName');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.setDoubleAsteriskFileName')) {
      exOption.strongFileName = config.get('setDoubleAsteriskFileName');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.convertJointSpaceToHalfWidth')) {
      exOption.jointSpaceUseHalfWidth = config.get('convertJointSpaceToHalfWidth');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.notSetImageElementAttributes')) {
      exOption.setImageElementAttributes = !config.get('notSetImageElementAttributes');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.wrapIframeWithoutCaptionByFigure')) {
      exOption.iframeWithoutCaption = config.get('wrapIframeWithoutCaptionByFigure');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.wrapVideoWithoutCaptionByFigure')) {
      exOption.videoWithoutCaption = config.get('wrapVideoWithoutCaptionByFigure');
      commands.executeCommand('workbench.action.reloadWindow');
    }

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
      if (exOption.setImageElementAttributes) {
        md.use(mdRendererImage, {
          scaleSuffix: true,
          resize: true,
          lazyLoad: true,
          asyncDecode: false,
          mdPath: window.activeTextEditor.document.uri.fsPath,
        })
      }
      md.use(mdFigureWithPCaption, {
        strongFilename: exOption.strongFilename,
        dquoteFilename: exOption.dquoteFilename,
        oneImageWithoutCaption: true,
        bLabel: false,
        strongLabel: false,
        jointSpaceUseHalfWidth: exOption.jointSpaceUseHalfWidth,
        hasNumClass: false,
        iframeWithoutCaption: exOption.iframeWithoutCaption,
        videoWithoutCaption: exOption.videoWithoutCaption,
        removeUnnumberedLabel: exOption.removeUnnumberedLabel,
        removeUnnumberedLabelExceptMarks: exOption.removeUnnumberedLabelExceptMarks,
      });
      return md;
    }
  };
}

exports.activate = activate;
