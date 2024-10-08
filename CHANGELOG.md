# Change Log

## 0.5.1 2024/08/30

Minor bug fixes etc.

- Update @peaceroad/markdown-it-figure-with-p-caption@0.9.1 (@peaceroad/markdown-it-p-captions@0.14.0)
- Update @peaceroad/markdown-it-renderer-image@0.3.1
- Update markdown-it-attrs@4.2.0

Note. 152

## 0.5.0 2024/06/28

Major changes.

- writing extension.js by ESM style. Use esbuild for build
- Update @peaceroad/markdown-it-figure-with-p-caption@0.8.1 (@peaceroad/markdown-it-p-captions@0.13.0)
- Add import @peaceroad/markdown-it-renderer-fence@0.1.1
- Add import markdown-it-attrs (If it is not imported by another plugin.)
- Add `shell` and `console` to the language codes to be converted to samp block.
    - These two keywords set span tags for highlight.qq
- Support Code/samp block with line numbers.
- Fix Iframe type blockquote process.
- Add commands. But for now, it's a rough conversion.
    - "setFigureCaptionNumber": Set markdown figure caption number.
    - "setImgAltAttrToPCaption": Set markdown img alt attribute to caption's paragraph
    - "setImgTitleAttrToPCaption": Set markdown img title attribute to caption's paragraph.
        - If you run the same command continuously, things will go wrong.
        - By setting `lang="en"` in Yaml like frontmatter, when there is no caption label, "Figure" will be used instead of "図".
- Change `role="doc-example"` of figure:is(.f-pre-code, .f-pre-samp) is no longer granted by default.
    - If you want to grant the role as before, set the option setRoleDocExample to true.
- Fix CSS to draw a straight line at the top of a table when the table does not have a header at the top.
- Add experimental option: imgAltCaption, imgTitleCaption
    - The alt and title attributes of the img attribute are used as captions.

Notice. 141

## 0.4.1 - 2024/04/09

- Re-adjusted the entire CSS.
   - Add CSS: figure.f-img-horizontal, figure.f-img-vertical
       - With f-img-horizontal, the image width is determined by dividing the screen width by the image, regardless of the image width (although there is also a margin). Therefore, each image is displayed with the same width.

## 0.4.0 - 2024/04/09

- Update: p7d-markdown-it-p-captions@0.12.0.
    - Support multiple images only paragraph.
    - Add word: 'slide' for slide.
- Fixed the style not working when there is a style at the end of the image paragraph and a caption follows it. (using 'markdown-it-attrs')
- By default, video elements and iframe elements without captions are not wrapped in figure elements (opposite to previous versions).
- Support Option: See Readme for details.
   - Not Convert: Label joint Full-width Space is convert to half-width space (Previously Default setting). In addition, I had set a margin of 0.5em on the right side of the label, but decided not to do so.
- Adjusted CSS slightly.
- Add many examples to Readme.

Note: 128.

## 0.3.1 - 2023/04/09

- Update: p7d-markdown-it-p-captions@0.9.1.
    - Add word: 'source' for blockquote. As a word that specifies the caption (quotation source).
- Fix handling of wraps class in twitter embed element.
        Twitter embed element uses blockquote, but is actually converted to an iframe by the included script. Therefore, here, the class of the wrapped figure element is set to `f-iframe`.
- Fix. Use f-video for a figure element that wraps a Vimeo iframe element (same as YouTube). However, Vimeo's embed elements comes with the p element, but it is kept in mind to exclude it.

## 0.3.0 - 2023/02/23

Major changes.

- if caption label do not has label number, the label itself is deleted on output.
- If A paragraph has only one image, the image is wrapped in figure element.
- A iframe element (ex. YouTube) row with no caption is wrapped in figure element.
- Twitter blockquote element, Mastodon iframe element are wrapped in figure element.

Note. 57

## 0.2.3 - 2021/11/07

- Fixed an issue where it would not be active. (It was not resolved in 2.2.
There was extra code in @peaceroad/markdown-it-renderer-image@0.1.4. Update: 0.1.5.)
- Add option: resize.

## 0.2.2 - 2021/11/02

- Fix because the public package wasn't working. (Modify the configuration properties setting in package.json, and modify extensions.js about it ).

## 0.2.1 - 2021/11/02

- Delete inline image max-height set flag.

    Memo: In most cases, I noticed that it can be controlled only by CSS. (I forgot that the inline image is not inside the figure element.) It's a problem for paragraph images that aren't made into figure elements and are displayed large, but it will be identified with another class or alt or title attribute.

## 0.2.0 - 2021/11/02

- Add blockquote caption process.
- Adjust the CSS a little.
- Change inline image max-height set flag: `img:is([title^="文中画像"], [title^="インライン画像"], [title^="inline image" i])`

## 0.1.1 - 2021/08/05

- Change: convert only having a caption paragraph.

## 0.1.0 - 2021/08/04

- Initial release
