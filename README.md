# vsce-p7d-markdown-it-figure-with-p-caption README

For a paragraph with one only image, a table or a code block　or a blockquote, and by writing a caption paragraph immediately before or after, they are converted into the figure element with the figcaption element.

1. Add width and height attributes in img elements.
2. Check that the element: one image only paragraph, table, code block, samp block ,and video.
3. Check if this element has a caption paragraph immediately before or after it.
4. If It has the caption paragraph, convert them to figure and figcaption element.
5. If It is samp block, convert `<code>` to `<samp>`.

Code. Input Markdown

```md
A paragraph.

![Cat](cat.jpg)

A paragraph.

Figure 1. VSCode with this plugin

![Figure](docs/screenshot.jpg)
```

Code: Output HTML

```html
<p>A paragraph.</p>
<p><img src="cat.jpg" alt="Cat" with="400" height="300"></p>
<p>A paragraph.</p>
<figure class="f-img">
<figcaption><span class="f-img-label">Figure<span class="f-img-label-joint">.</span></span> VSCode with this plugin</figcaption>
<img src="docs/screenshot.jpg" alt="Figure" width="1407" height="906">
</figure>
```

![Figure](docs/screenshot.jpg)

Figure. VSCode with this plugin

## Caption Paragraph's rule

It determines if it is a caption from the string at the beginning of the paragraph ([more info](https://github.com/peaceroad/p7d-markdown-it-p-captions)).

Table. The beginning string identified as a caption.

| Caption type | String at the beginning of a paragraph (uppercase or lowercase) |
| ---- | ---- |
| `img` | fig, figure, illust, photo, 図, イラスト, 写真 |
| `table` | table, 表 |
| `pre-code` | code, codeblock, program, algorithm, コード, ソースコード, 命令, プログラム, 算譜, アルゴリズム, 算法 |
| `pre-samp` | console, terminal, prompt, command, 端末, ターミナル, コマンド, コマンドプロンプト, プロンプト |

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

## Adjust image size by filename suffix

Based on the string at the end of the image file name, adjust the width and height as follows.

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

---

Notice. This extension has [default CSS](https://github.com/peaceroad/vsce-p7d-markdown-it-figure-with-p-caption/blob/main/style/figure-with-p-caption.css). This CSS can be disabled with a user option.

---
