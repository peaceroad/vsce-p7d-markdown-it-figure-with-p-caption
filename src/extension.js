import mditFigureWithPCaption from '@peaceroad/markdown-it-figure-with-p-caption'
import mditRendererFence from '@peaceroad/markdown-it-renderer-fence/markup-highlight'
import mditRendererImage from '@peaceroad/markdown-it-renderer-image'
import setFigureCaptionNumber from '@peaceroad/markown-figure-num-setting'
import setImgAttrToPCaption from '@peaceroad/markdown-imgattr-to-pcaption'
import {
  escapeHtmlAttribute,
  parseFrontmatter,
  createMdPathResolver,
} from './core/extension-host-utils.js'

import { workspace, commands, window, Uri, Range } from 'vscode'

export function activate(context) {
  const configSection = 'p7dMarkdownItFigureWithPCaption'
  const configPath = (key) => `${configSection}.${key}`
  const hasResolvedMdPath = (env) => (
    !!env
    && typeof env.mdPath === 'string'
    && env.mdPath.trim().length > 0
  )
  const frontmatterKeys = [
    'imgAltCaption',
    'imgTitleCaption',
    'notSetImageElementAttributes',
    'lid',
    'url',
    'urlimage',
    'urlImage',
    'urlimagebase',
    'urlImageBase',
    'imagescale',
    'imageScale',
    'lmd',
  ]
  const defaultImgExtensions = 'png,jpg,jpeg,gif,webp'
  const defaultClassPrefix = 'f'
  const defaultOutputUrlMode = 'absolute'
  const defaultUrlImageBase = ''
  const defaultRemoteTimeoutMs = 5000
  const defaultRemoteMaxBytes = 16777216
  const defaultCacheMax = 64
  const defaultSuppressErrors = 'none'
  const defaultSampLangList = ['shell', 'console']
  const autoLabelNumberAllowed = new Set(['img', 'table'])
  const reloadRequiredConfigKeys = [
    'label.unnumbered.displayMarks',
    'label.unnumbered.displayAll',
    'label.filename.doubleQuote',
    'label.filename.doubleAsterisk',
    'label.jointSpace.halfWidth',
    'figure.wrapWithoutCaption.iframe.disabled',
    'figure.wrapWithoutCaption.iframeBlockquote.disabled',
    'figure.class.iframeBlockquote',
    'figure.class.slide',
    'figure.wrapWithoutCaption.video.disabled',
    'figure.wrapWithoutCaption.audio.disabled',
    'caption.autoDetection.disabled',
    'caption.fromImgAlt',
    'caption.fromImgTitle',
    'figure.roleDocExample',
    'figure.autoLabelNumber',
    'figure.autoLabelNumberSets',
    'image.disabled',
    'figure.styleProcess.disabled',
    'label.numberClass',
    'label.useB',
    'label.useStrong',
    'label.prefixMarker',
    'label.allowPrefixMarkerWithoutLabel',
    'figure.oneImageWithoutCaption.disabled',
    'caption.class.removeMarkName',
    'caption.body.wrap',
    'figure.multipleImages.disabled',
    'figure.class.iframe',
    'image.scaleSuffix.disabled',
    'image.lazyLoad.disabled',
    'image.resize.disabled',
    'image.asyncDecode',
    'image.resolveSrc',
    'image.resizeHint.keepInTitle',
    'image.resizeHint.dataAttribute',
    'image.remoteSize.disabled',
    'fence.highlight.disabled',
    'fence.lineNumber.disabled',
    'fence.emphasizeLines.disabled',
    'fence.sampLang.unset',
  ]
  const reloadRequiredConfigPaths = reloadRequiredConfigKeys.map(configPath)

  const parseCommaList = (value) => {
    if (typeof value !== 'string') return []
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  const normalizeAutoCaptionOption = (value) => {
    if (value === true) return true
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed ? trimmed : false
    }
    return false
  }

  const parseLabelPrefixMarker = (value) => {
    const items = parseCommaList(value)
    if (items.length === 0) return null
    if (items.length === 1) return items[0]
    return items.slice(0, 2)
  }

  const parseAutoLabelNumberSets = (value) => {
    const items = parseCommaList(value)
    return items
      .map((item) => item.toLowerCase())
      .filter((item) => autoLabelNumberAllowed.has(item))
  }

  const parseDisplayUnnumberedLabelMarks = (value) => {
    const items = parseCommaList(value)
    const marks = []
    const seen = new Set()
    let removeBlockquote = false
    let hasBlockquote = false
    for (const item of items) {
      const lower = item.toLowerCase()
      if (lower === 'no-blockquote' || lower === 'unblockquote') {
        removeBlockquote = true
        continue
      }
      if (!lower || seen.has(lower)) continue
      seen.add(lower)
      if (lower === 'blockquote') hasBlockquote = true
      marks.push(lower)
    }
    if (!removeBlockquote && !hasBlockquote) {
      marks.push('blockquote')
    }
    return marks
  }

  const buildSettings = () => {
    const config = workspace.getConfiguration(configSection)
    const marks = config.get('label.unnumbered.displayMarks')
    const removeUnnumberedLabelExceptMarks = parseDisplayUnnumberedLabelMarks(marks)
    const figureClassOption = config.get('figure.class.iframeBlockquote')
    const figureClassSlidesOption = config.get('figure.class.slide')
    const classPrefix = defaultClassPrefix
    const figureClassThatWrapsIframeTypeBlockquote = typeof figureClassOption === 'string' && figureClassOption.trim()
      ? figureClassOption
      : `${classPrefix}-img`
    const figureClassThatWrapsSlides = typeof figureClassSlidesOption === 'string' && figureClassSlidesOption.trim()
      ? figureClassSlidesOption
      : `${classPrefix}-slide`
    const iframeFigureClassOption = config.get('figure.class.iframe')
    const iframeFigureClass = typeof iframeFigureClassOption === 'string' && iframeFigureClassOption.trim()
      ? iframeFigureClassOption
      : 'f-embed'
    const imgAltCaptionSetting = config.get('caption.fromImgAlt')
    const imgTitleCaptionSetting = config.get('caption.fromImgTitle')
    const autoAltCaption = normalizeAutoCaptionOption(imgAltCaptionSetting)
    const autoTitleCaption = normalizeAutoCaptionOption(imgTitleCaptionSetting)
    const labelPrefixMarker = parseLabelPrefixMarker(config.get('label.prefixMarker'))
    const autoLabelNumber = config.get('figure.autoLabelNumber')
    const autoLabelNumberSets = parseAutoLabelNumberSets(config.get('figure.autoLabelNumberSets'))

    const figureOptions = {
      classPrefix,
      figureClassThatWrapsIframeTypeBlockquote,
      figureClassThatWrapsSlides,
      styleProcess: !config.get('figure.styleProcess.disabled'),
      hasNumClass: config.get('label.numberClass'),
      dquoteFilename: config.get('label.filename.doubleQuote'),
      strongFilename: config.get('label.filename.doubleAsterisk'),
      bLabel: config.get('label.useB'),
      strongLabel: config.get('label.useStrong'),
      jointSpaceUseHalfWidth: config.get('label.jointSpace.halfWidth'),
      oneImageWithoutCaption: !config.get('figure.oneImageWithoutCaption.disabled'),
      iframeWithoutCaption: !config.get('figure.wrapWithoutCaption.iframe.disabled'),
      iframeTypeBlockquoteWithoutCaption: !config.get('figure.wrapWithoutCaption.iframeBlockquote.disabled'),
      videoWithoutCaption: !config.get('figure.wrapWithoutCaption.video.disabled'),
      audioWithoutCaption: !config.get('figure.wrapWithoutCaption.audio.disabled'),
      removeUnnumberedLabel: !config.get('label.unnumbered.displayAll'),
      removeUnnumberedLabelExceptMarks,
      removeMarkNameInCaptionClass: config.get('caption.class.removeMarkName'),
      multipleImages: !config.get('figure.multipleImages.disabled'),
      autoCaptionDetection: !config.get('caption.autoDetection.disabled'),
      autoAltCaption,
      autoTitleCaption,
      autoLabelNumber,
      allowLabelPrefixMarkerWithoutLabel: config.get('label.allowPrefixMarkerWithoutLabel'),
      wrapCaptionBody: config.get('caption.body.wrap'),
      roleDocExample: config.get('figure.roleDocExample'),
      allIframeTypeFigureClassName: iframeFigureClass,
    }
    if (labelPrefixMarker) {
      figureOptions.labelPrefixMarker = labelPrefixMarker
    }
    if (autoLabelNumberSets.length > 0) {
      figureOptions.autoLabelNumberSets = autoLabelNumberSets
    }

    const checkImgExtensions = defaultImgExtensions
    const disableRendererImage = config.get('image.disabled')
    const notSetImageElementAttributes = disableRendererImage
    const keepResizeHintInTitle = Boolean(config.get('image.resizeHint.keepInTitle'))
    const autoHideResizeTitle = !keepResizeHintInTitle
    const resizeEnabled = !config.get('image.resize.disabled')
    const resizeDataAttrOption = config.get('image.resizeHint.dataAttribute')
    const resizeDataAttr = typeof resizeDataAttrOption === 'string' && resizeDataAttrOption.trim()
      ? resizeDataAttrOption.trim()
      : (autoHideResizeTitle && resizeEnabled && !notSetImageElementAttributes ? 'data-img-resize' : '')
    const urlImageBase = defaultUrlImageBase
    const outputUrlMode = defaultOutputUrlMode
    const resolveSrc = config.get('image.resolveSrc') === true

    const rendererImageOptions = {
      scaleSuffix: !config.get('image.scaleSuffix.disabled'),
      lazyLoad: !config.get('image.lazyLoad.disabled'),
      resize: resizeEnabled,
      asyncDecode: config.get('image.asyncDecode'),
      checkImgExtensions,
      resolveSrc,
      urlImageBase,
      outputUrlMode,
      autoHideResizeTitle,
      resizeDataAttr,
      remoteTimeout: defaultRemoteTimeoutMs,
      disableRemoteSize: config.get('image.remoteSize.disabled'),
      cacheMax: defaultCacheMax,
      suppressErrors: defaultSuppressErrors,
      remoteMaxBytes: defaultRemoteMaxBytes,
    }
    const unsetSampLangList = parseCommaList(config.get('fence.sampLang.unset'))
    const unsetSampLangSet = new Set(unsetSampLangList.map((lang) => lang.toLowerCase()))
    const sampLangList = defaultSampLangList.filter((lang) => !unsetSampLangSet.has(lang.toLowerCase()))
    const sampLang = sampLangList.length > 0 ? sampLangList.join(',') : '__none__'

    const rendererFenceOptions = {
      setHighlight: !config.get('fence.highlight.disabled'),
      setLineNumber: !config.get('fence.lineNumber.disabled'),
      setEmphasizeLines: !config.get('fence.emphasizeLines.disabled'),
      setLineEndSpan: 0,
      sampLang,
    }

    const figureNumberOptions = {
      img: !config.get('command.figureNumber.img.disabled'),
      table: config.get('command.figureNumber.table'),
      setNumberAlt: config.get('command.figureNumber.setNumberAlt'),
    }

    const labelLang = config.get('command.caption.labelLang') === 'en' ? 'en' : 'ja'
    const disableStyle = config.get('disableStyle')
    const extensionSettingsMeta = {
      notSetImageElementAttributes,
      disableRendererImage,
      disableStyle,
      imgAltCaption: imgAltCaptionSetting,
      imgTitleCaption: imgTitleCaptionSetting,
      rendererImage: {
        scaleSuffix: rendererImageOptions.scaleSuffix,
        lazyLoad: rendererImageOptions.lazyLoad,
        resize: rendererImageOptions.resize,
        asyncDecode: rendererImageOptions.asyncDecode,
        resolveSrc: rendererImageOptions.resolveSrc,
        urlImageBase: rendererImageOptions.urlImageBase,
        outputUrlMode: rendererImageOptions.outputUrlMode,
        checkImgExtensions: rendererImageOptions.checkImgExtensions,
        suppressErrors: rendererImageOptions.suppressErrors,
        autoHideResizeTitle: rendererImageOptions.autoHideResizeTitle,
        resizeDataAttr: rendererImageOptions.resizeDataAttr,
      },
    }
    const frontmatterBaseMeta = { _extensionSettings: extensionSettingsMeta }
    const frontmatterBaseMetaContent = escapeHtmlAttribute(JSON.stringify(frontmatterBaseMeta))

    return {
      figureOptions,
      rendererImageOptions,
      rendererFenceOptions,
      figureNumberOptions,
      labelLang,
      notSetImageElementAttributes,
      disableRendererImage,
      frontmatterBaseMeta,
      frontmatterBaseMetaContent,
    }
  }

  let currentSettings = buildSettings()
  const mdPathResolver = createMdPathResolver({
    parseUri: (value) => Uri.parse(value),
    getActiveMarkdownPath: () => {
      const activeDoc = window.activeTextEditor?.document
      if (activeDoc && activeDoc.languageId === 'markdown' && activeDoc.uri?.fsPath) {
        return activeDoc.uri.fsPath
      }
      return ''
    },
  })

  const registerTransformCommand = (commandName, transformFunction, getOptions) => {
    const command = commands.registerCommand(commandName, () => {
      const editor = window.activeTextEditor
      if (!editor) return
      const document = editor.document
      if (document.languageId !== 'markdown') return
      const original = document.getText()
      const transformed = transformFunction(original, getOptions())
      if (transformed === original) return
      editor.edit((editBuilder) => {
        const fullRange = new Range(
          document.positionAt(0),
          document.positionAt(original.length)
        )
        editBuilder.replace(fullRange, transformed)
      })
    })
    context.subscriptions.push(command)
  }

  registerTransformCommand(
    'p7dMarkdownItFigureWithPCaption.setFigureCaptionNumber',
    setFigureCaptionNumber,
    () => currentSettings.figureNumberOptions
  )
  registerTransformCommand(
    'p7dMarkdownItFigureWithPCaption.setImgAltAttrToPCaption',
    setImgAttrToPCaption,
    () => ({
      labelLang: currentSettings.labelLang,
      autoLangDetection: false,
    })
  )
  registerTransformCommand(
    'p7dMarkdownItFigureWithPCaption.setImgTitleAttrToPCaption',
    setImgAttrToPCaption,
    () => ({
      imgTitleCaption: true,
      labelLang: currentSettings.labelLang,
      autoLangDetection: false,
    })
  )

  const configChangeDisposable = workspace.onDidChangeConfiguration(event => {
    if (!event.affectsConfiguration(configSection)) return

    const requiresReloadWindow = reloadRequiredConfigPaths.some((path) => (
      event.affectsConfiguration(path)
    ))
    if (requiresReloadWindow) {
      commands.executeCommand('workbench.action.reloadWindow')
      return
    }

    currentSettings = buildSettings()
    lastFrontmatterSrc = null
    lastFrontmatter = null
    lastMetaContent = null

    if (event.affectsConfiguration(configPath('disableStyle'))) {
      commands.executeCommand('markdown.preview.refresh')
      return
    }
  })
  context.subscriptions.push(configChangeDisposable)

  const expandMarkdownItSetting = (md) => {
    if (md.__p7dPluginsApplied) return
    if (!currentSettings.disableRendererImage) {
      md.use(mditRendererImage, currentSettings.rendererImageOptions)
    }
    md.use(mditFigureWithPCaption, currentSettings.figureOptions)
      .use(mditRendererFence, currentSettings.rendererFenceOptions)
    md.__p7dPluginsApplied = true
  }

  let lastFrontmatterSrc = null
  let lastFrontmatter = null
  let lastMetaContent = null

  const buildFrontmatterMetaContent = (frontmatter) => {
    let meta = null
    for (const key of frontmatterKeys) {
      if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
        if (!meta) {
          meta = {
            _extensionSettings: currentSettings.frontmatterBaseMeta._extensionSettings,
          }
        }
        meta[key] = frontmatter[key]
      }
    }
    if (!meta) {
      return currentSettings.frontmatterBaseMetaContent
    }
    return escapeHtmlAttribute(JSON.stringify(meta))
  }

  return {
    extendMarkdownIt(md) {
      expandMarkdownItSetting(md);

      if (!md.__p7dRenderWrapped) {
        const originalRender = md.render.bind(md)
        md.render = (src, env) => {
          const safeEnv = env || {}
          if (!hasResolvedMdPath(safeEnv)) {
            mdPathResolver.resolve(safeEnv)
          }
          return originalRender(src, safeEnv)
        }
        md.__p7dRenderWrapped = true
      }
      if (!md.__p7dRendererWrapped) {
        const originalRendererRender = md.renderer.render.bind(md.renderer)
        md.renderer.render = (tokens, options, env) => {
          const safeEnv = env || {}
          if (!hasResolvedMdPath(safeEnv)) {
            mdPathResolver.resolve(safeEnv)
          }
          return originalRendererRender(tokens, options, safeEnv)
        }
        md.__p7dRendererWrapped = true
      }
      if (!md.__p7dImageRuleWrapped) {
        const originalImageRule = md.renderer.rules.image
        if (originalImageRule) {
          md.renderer.rules.image = (tokens, idx, options, env, slf) => {
            const safeEnv = env || {}
            if (!hasResolvedMdPath(safeEnv)) {
              mdPathResolver.resolve(safeEnv)
            }
            return originalImageRule(tokens, idx, options, safeEnv, slf)
          }
        }
        md.__p7dImageRuleWrapped = true
      }
      
      if (!md.__p7dFrontmatterRuleAdded) {
        md.core.ruler.before('replacements', 'p7d_mdpath_resolver', function(state) {
          const env = state.env || (state.env = {})
          if (!hasResolvedMdPath(env)) {
            mdPathResolver.resolve(env)
          }
        })

        md.core.ruler.push('frontmatter_injector', function(state) {
          const src = state.src
          let frontmatter = null
          if (src === lastFrontmatterSrc) {
            frontmatter = lastFrontmatter
          } else {
            frontmatter = parseFrontmatter(src)
            lastFrontmatterSrc = src
            lastFrontmatter = frontmatter
            lastMetaContent = null
          }

          const env = state.env || (state.env = {})
          env.frontmatter = frontmatter
          if (!hasResolvedMdPath(env)) {
            mdPathResolver.resolve(env)
          }

          const token = new state.Token('html_block', '', 0)
          let metaContent = lastMetaContent
          if (!metaContent) {
            metaContent = buildFrontmatterMetaContent(frontmatter)
            lastMetaContent = metaContent
          }
          token.content = `<meta name="markdown-frontmatter" content="${metaContent}">`
          token.map = [0, 0]
          state.tokens.unshift(token)
        })
        md.__p7dFrontmatterRuleAdded = true
      }
      
      return md;
    }
  };
}

export function deactivate() {}


