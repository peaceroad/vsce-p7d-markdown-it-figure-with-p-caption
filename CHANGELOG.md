# Change Log

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
