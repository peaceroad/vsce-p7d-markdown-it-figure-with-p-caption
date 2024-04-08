# Change Log

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
