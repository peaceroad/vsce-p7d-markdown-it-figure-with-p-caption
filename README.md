# vsce-p7d-markdown-it-figure-with-p-caption README

For a paragraph with one only image, a table or a code block　or a blockquote, and by writing a caption paragraph immediately before or after, they are converted into the figure element with the figcaption element.

1. Add width and height attributes in img elements.
2. Check that the element: one image only paragraph, table, code block, samp block ,and video.
3. Check if this element has a caption paragraph immediately before or after it.
4. If It has the caption paragraph, convert them to figure and figcaption element.
   - At this time, if caption label do not has label number, the label itself is deleted. (in the settings of this extension)
5. If It is samp block, convert `<code>` to `<samp>`.

Exceptional handling.

- If there is only one image per paragraph, treat it as a figure and enclose it in the figure element. (in the settings of this extension)
- A iframe element (ex. YouTube) row with no caption is wrapped in figure element.
- Twitter blockquote element, Mastodon iframe element are wrapped in figure element.
- 

For example, the following code is Markdown for input and HTML for output (vscode markdown viewer).

Code. Input Markdown

```md
A paragraph.

![Figure](docs/screenshot.jpg)

A paragraph.

Figure 1. VSCode with this plugin

![Figure](docs/screenshot.jpg)
```

Code: Output HTML

```html
<p>A paragraph.</p>
<figure class="f-img">
<img src="docs/screenshot.jpg" alt="Figure" width="1407" height="906">
</figure>
<p>A paragraph.</p>
<figure class="f-img">
<figcaption><span class="f-img-label">Figure<span class="f-img-label-joint">.</span></span> VSCode with this plugin</figcaption>
<img src="docs/screenshot.jpg" alt="Figure" width="1407" height="906">
</figure>
```

![Figure](docs/screenshot.jpg)

Figure 1. VSCode with this plugin

The following markdown is converted to the following HTML (in the settings of this extension):

```md
Figure. A caption.

![](fig1.jpg)
```

```html
<figure class="f-img">
<figcaption>VSCode with this plugin</figcaption>
<img src="docs/screenshot.jpg" alt="Figure" width="1407" height="906">
</figure>
```

Also, full-width spaces used as label joints are converted to half-width spaces on output. Therefore, even on the preview, it can be seen as a half-width space. (in the settings of this extension)

## Use

To use this extension, reload VSCode once after installing this extension.

## Caption Paragraph's rule

It determines if it is a caption from the string at the beginning of the paragraph ([more info](https://github.com/peaceroad/p7d-markdown-it-p-captions)).

Table. The beginning string identified as a caption.

| Caption type | String at the beginning of a paragraph (uppercase or lowercase) |
| ---- | ---- |
| `img` | fig, figure, illust, photo, 図, イラスト, 写真 |
| `table` | table, 表 |
| `pre-code` | code, codeblock, program, algorithm, コード, ソースコード, リスト, 命令, プログラム, 算譜, アルゴリズム, 算法 |
| `pre-samp` | console, terminal, prompt, command, 端末, ターミナル, コマンド, コマンドプロンプト, プロンプト |
| `blockquote` | source, quote, blockquote, 引用, 引用元, 出典 |

In addition, a delimiter is required after these strings, and then one space is needed. If the character string is Japanese, half-width spaces only are allowed. 

```md
Fig. A caption

Fig: A caption

図．キャプション

図。キャプション

図：キャプション

図　キャプション

図 キャプション
```

You can also put a serial number, such as 0-9A-Z.-, between the first term and the separator.

```md
Fig 1. A caption

Fig 1.1. A caption

Fig A: A caption

図1.1：キャプション
```

Only when it has this serial number, it can be identified by omitting the separator and adding only a space. In English, the caption written after a space must begin with an uppercase letter.

```md
Fig 1 A caption.

Fig 1.1 A caption.

Figure A A caption
```

Also, It identifies the `Figure.1` type. This format has a dot immediately after the first term, a serial number and a space after it. In this case, too, the caption written after a space must begin with an uppercase letter.

```md
Figure.1 A caption.
```
## Adjusting image size by filename suffix

Based on the string at the end of the image file name, the image adjust the width and height as follows.

```plain
![A cat.](cat@2x.jpg) //400x300.
↓
<p><img src="cat@2x.jpg" alt="A cat." width="200" height="150"></p>

![A cat.](cat_300dpi.jpg) //400x300
↓
<p><img src="cat_300dpi.jpg" alt="A cat." width="128" height="96"></p>

![A cat.](cat_300ppi.jpg) //400x300
↓
<p><img src="cat_300ppi.jpg" alt="A cat." width="128" height="96"></p>
```

This is identified by `/[@._-]([0-9]+)(x|dpi|ppi)$/`.


### Resizing layout image by title attribute

A image can resize based on the value of the title attribute.

```js
![A cat.](cat.jpg "Resize:50%")
↓
<p><img src="cat.jpg" alt="A cat." width="200" height="150"></p>

![A cat.](cat.jpg "リサイズ：50%")
↓
<p><img src="cat.jpg" alt="A cat." width="200" height="150"></p>

![A cat.](cat.jpg "サイズ変更：50%")
↓
<p><img src="cat.jpg" alt="A cat." width="200" height="150"></p>

![A cat.](cat.jpg "The shown photo have been resized to 50%.")
↓
<p><img src="cat.jpg" alt="A cat." title="The shown photo have been resized to 50%." width="200" height="150"></p>

![Figure](cat.jpg "resize:320px")
↓
<p><img src="cat.jpg" alt="Figure" title="resize:320px" width="320" height="240"></p>

![Figure](cat@2x.jpg "resize:320px")
↓
<p><img src="cat@2x.jpg" alt="Figure" title="resize:320px" width="320" height="240"></p>
```

This is identified by `imageTitleAttribute.match(/(?:(?:(?:大きさ|サイズ)の?変更|リサイズ|resize(?:d to)?)? *[:：]? *([0-9]+)([%％]|px)|([0-9]+)([%％]|px)に(?:(?:大きさ|サイズ)を?変更|リサイズ))/i)`

If `px` is specified, the numerical value is treated as the width after resizing.

Notice: Other Markdown extended notations may specify a caption in the title attribute. Therefore, think carefully about whether to enable this option.

---

Notice. This extension has [default CSS](https://github.com/peaceroad/vsce-p7d-markdown-it-figure-with-p-caption/blob/main/style/figure-with-p-caption.css). This CSS can be disabled with a user option.

---
