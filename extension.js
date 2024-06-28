import fs from 'fs'
import mditFigureWithPCaption from '@peaceroad/markdown-it-figure-with-p-caption'
import mditRendererFence from '@peaceroad/markdown-it-renderer-fence'
import mditRendererImage from '@peaceroad/markdown-it-renderer-image'
import mditAttrs from 'markdown-it-attrs'

import  setFigureCaptionNumber from '@peaceroad/markown-figure-num-setting'
import  setImgAttrToPCaption from '@peaceroad/markdown-imgattr-to-pcaption'

import vscode, {workspace, commands, window} from 'vscode'
const config = workspace.getConfiguration('p7dMarkdownItFigureWithPCaption')

let disableStyle = false;

export function activate (context) {

  const cacheCssFile = (cssFilePath, cachedCssFilePath) => {
    if (!fs.existsSync(cachedCssFilePath)) {
      fs.writeFileSync(cachedCssFilePath, fs.readFileSync(cssFilePath));
    }
    return;
  }

  const cssFile = 'figure-with-p-caption.css';
  const cssFilePath = __dirname + '/style/' + cssFile;
  const cachedCssFilePath = __dirname + '/style/_' + cssFile;

  const marks = config.get('displayUnnumberedLabelMarks')
  let exOption = {
    removeUnnumberedLabelExceptMarks: marks.length > 0 ? marks : ["blockquote"],
    removeUnnumberedLabel: !config.get('displayUnnumberedLabel'),
    dquoteFilename: config.get('setDoubleQuoteFileName'),
    strongFilename: config.get('setDoubleAsteriskFileName'),
    jointSpaceUseHalfWidth: config.get('convertJointSpaceToHalfWidth'),
    setImageElementAttributes: !config.get('notSetImageElementAttributes'),
    iframeWithoutCaption: config.get('wrapIframeWithoutCaptionByFigure'),
    iframeTypeBlockquoteWithoutCaption: config.get('iframeTypeBlockquoteWithoutCaptionByeFigure'),
    videoWithoutCaption: config.get('wrapVideoWithoutCaptionByFigure'),
    imgAltCaption: config.get('useImgAltCaption'),
    imgTitleCaption: config.get('useImgTitleCaption'),
    labelLang: config.get('useImgAttrToPCaptionLabelLang') === 'en' ? 'en' : 'ja',
    figureClassThatWrapsIframeTypeBlockquote: config.get('setFigureClassThatWrapsIframeTypeBlockquote') === '' ? 'f-img' : config.get('setFigureClassThatWrapsIframeTypeBlockquote'),
    roleDocExample: config.get('setRoleDocExample'),
  }
  let fmYamlOption = {
    imgAltCaption: '',
    imgTitleCaption: '',
    lang: '',
  }
  let hasUpdate = false

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
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.wrapIframeTypeBlockquoteWithoutCaptionByFigure')) {
      exOption.iframeTypeBlockquoteWithoutCaption = config.get('wrapIframeTypeBlockquoteWithoutCaptionByFigure');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.wrapVideoWithoutCaptionByFigure')) {
      exOption.videoWithoutCaption = config.get('wrapVideoWithoutCaptionByFigure');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.useImgAltCaption')) {
      exOption.imgAltCaption = config.get('useImgAltCaption');
      commands.executeCommand('workbench.action.reloadWindow');
    }
    if (event.affectsConfiguration('p7dMarkdownItFigureWithPCaption.useImgTitleCaption')) {
      exOption.imgTitleCaption = config.get('useImgTitleCaption');
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
  })

  const getYaml = (cont) => {
    const lines = cont.split(/\r?\n/)
    const yaml = {}
    for (let line of lines) {
      const [key, value] = line.split(':').map(s => s.trim())
      if (value) yaml[key] = value.replace(/^['"]/, '').replace(/['"]$/, '')
    }
    return yaml
  }

  const setYamlOption = (editor) => {
    const cont = editor.document.getText()
    const match = cont.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
    const captionReg = /^(?:図|figure)$/i
    if (!match) return
    const fmYaml = getYaml(match[1])
    if (fmYaml.hasOwnProperty('imgAltCaption')) {
      if (captionReg.test(fmYaml.imgAltCaption)) {
        if (fmYamlOption.imgAltCaption !== fmYaml.imgAltCaption) {
          fmYamlOption.imgAltCaption = fmYaml.imgAltCaption
          hasUpdate = true
        }
        exOption.imgAltCaption = fmYaml.imgAltCaption
      }
    } else {
      if (fmYamlOption.imgAltCaption) {
        fmYamlOption.imgAltCaption = ''
        hasUpdate = true
      }
      exOption.imgAltCaption = ''
    }
    if (fmYaml.hasOwnProperty('imgTitleCaption')) {
      if (captionReg.test(fmYaml.imgTitleCaption)) {
        if (fmYamlOption.imgTitleCaption !== fmYaml.imgTitleCaption) {
          fmYamlOption.imgTitleCaption = fmYaml.imgTitleCaption
          hasUpdate = true
        }
        exOption.imgTitleCaption = fmYaml.imgTitleCaption
      }
      exOption.imgTitleCaption = fmYaml.imgTitleCaption
    } else {
      if (fmYamlOption.imgTitleCaption){
        fmYamlOption.imgTitleCaption = ''
        hasUpdate = true
      }
      exOption.imgTitleCaption = ''
    }
    if (fmYaml.hasOwnProperty('lang')) {
      if (fmYamlOption.lang !== fmYaml.lang) {
        fmYamlOption.lang = fmYaml.lang
        hasUpdate = true
      }
      if (fmYaml.lang === 'en') exOption.labelLang = 'en'
      if (fmYaml.lang === 'ja') exOption.labelLang = 'ja'
    } else {
      if (fmYamlOption.lang) {
        fmYamlOption.lang = 'ja'
        hasUpdate = true
      }
      exOption.labelLang = 'ja'
    }
    return
  }

  const isMditAttrsLoaded = (md) => {
    const index = md.core.ruler.__find__('curly_attributes')
    return index !== -1 && md.core.ruler.getRules('linkify').some(rule => rule.name === 'curly_attributes')
  }

  const updateExOption = (editor) => {
    hasUpdate = false
    if (!editor || editor.document.languageId !== 'markdown') return
    setYamlOption(editor)
  }

  const registeredCommands = {}
  const registerCommand = (commandName, transformFunction, options, context) => {
  if (registeredCommands[commandName]) {
    registeredCommands[commandName].dispose();
    delete registeredCommands[commandName]
  }
  let command = commands.registerCommand(commandName, () => {
    let editor = window.activeTextEditor;
    if (!editor) return;
    let document = editor.document;
    let content = document.getText();
    content = transformFunction.apply(null, [content, options]);
    editor.edit(editBuilder => {
      let fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(content.length)
      );
      editBuilder.replace(fullRange, content);
    });
  });
  context.subscriptions.push(command);
  registeredCommands[commandName] = command
}

  const setCommands = (exOption) => {
    registerCommand('p7dMarkdownItFigureWithPCaption.setImgAltAttrToPCaption', setImgAttrToPCaption, {labelLang: exOption.labelLang}, context)
    registerCommand('p7dMarkdownItFigureWithPCaption.setImgTitleAttrToPCaption', setImgAttrToPCaption, {imgTitleCaption: true, labelLang: exOption.labelLang}, context)
  }

  let pat = ''
  if (window.activeTextEditor && window.activeTextEditor.document.uri.scheme === 'file') {
    pat = window.activeTextEditor.document.uri.fsPath
  }
  registerCommand('p7dMarkdownItFigureWithPCaption.setFigureCaptionNumber', setFigureCaptionNumber, {noSetAlt: true}, context)
  updateExOption(window.activeTextEditor)
  setCommands(exOption)

  window.onDidChangeActiveTextEditor(editor => {
    if (editor && editor.document.uri.scheme === 'file') {
      pat = editor.document.uri.fsPath
    } else {
      pat = ''
    }
    updateExOption(window.activeTextEditor)
    setCommands(exOption)
  })

  //let disposable = 
  workspace.onDidChangeTextDocument(event => {
    if (pat !== '' && window.activeTextEditor && event.document.uri.toString() === window.activeTextEditor.document.uri.toString()) {
      updateExOption(window.activeTextEditor)
      console.log('hasUpdate: ' + hasUpdate)
      if (hasUpdate) {
        setCommands(exOption)
        hasUpdate = false
      }
      /*
      config.update('useImgAltCaption', {
        extendMarkdownIt(md) {
          expandMarkdownItSetting(md)
          return md
        }
      }, vscode.ConfigurationTarget.WorkspaceFolder)
      */
    }
  })
  //context.subscriptions.push(disposable)

  const expandMarkdownItSetting = (md) => {
    if (exOption.setImageElementAttributes) {
      md.use(mditRendererImage, {
        scaleSuffix: true,
        resize: true,
        lazyLoad: true,
        asyncDecode: false,
        mdPath: pat,
      })
    }
    md.use(mditFigureWithPCaption, {
      strongFilename: exOption.strongFilename,
      dquoteFilename: exOption.dquoteFilename,
      oneImageWithoutCaption: true,
      bLabel: false,
      strongLabel: false,
      jointSpaceUseHalfWidth: exOption.jointSpaceUseHalfWidth,
      hasNumClass: false,
      iframeWithoutCaption: exOption.iframeWithoutCaption,
      iframeTypeBlockquoteWithoutCaption: exOption.iframeTypeBlockquoteWithoutCaption,
      figureClassThatWrapsIframeTypeBlockquote: exOption.figureClassThatWrapsIframeTypeBlockquote,
      videoWithoutCaption: exOption.videoWithoutCaption,
      removeUnnumberedLabel: exOption.removeUnnumberedLabel,
      removeUnnumberedLabelExceptMarks: exOption.removeUnnumberedLabelExceptMarks,
      imgAltCaption: exOption.imgAltCaption,
      imgTitleCaption: exOption.imgTitleCaption,
      roleDocExample: exOption.roleDocExample,
    }).use(mditRendererFence)
    if (!isMditAttrsLoaded(md)) {
      md.use(mditAttrs)
    }
  }

  return {
    extendMarkdownIt(md) {
      expandMarkdownItSetting(md)
      return md
    }
  };
}

export function deactivate () {}
