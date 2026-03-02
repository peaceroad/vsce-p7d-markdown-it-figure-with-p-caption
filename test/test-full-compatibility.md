---
title: Complete Compatibility Test
imgAltCaption: true
imgTitleCaption: true
---

<!--
Test focus:
- imgAltCaption/imgTitleCaption enabled
- caption parsing edge cases (titles, attributes, blockquote, existing figure)
- rendererImage.resize default behavior
- displayUnnumberedLabelMarks default keeps blockquote labels
- table/code caption handling
-->

# Complete mditFigureWithPCaption Compatibility Test

## Test Case 1: Title has priority over alt

![Alt text will be ignored](../docs/screenshot.jpg "Title caption text resize: 20% width: 200px")

## Test Case 2: Alt text when no title

![Alt text should be caption](../docs/codeblock-with-emphasis-lines.jpg)

## Test Case 3: Title with multiple attribute specifications

![Alt fallback](../docs/codeblock-with-line-number.jpg "Caption with spaces resize: 75% height: 150px class: custom-class")

## Test Case 4: Empty title should fall back to alt

![Fallback alt text](../docs/screenshot.jpg "")

## Test Case 5: Title with only attributes (no caption text)

![Should use alt instead](../docs/codeblock-with-emphasis-lines.jpg "resize: 100%")

## Test Case 6: Multiple images in sequence

![First image alt](../docs/screenshot.jpg "First image title")
![Second image alt](../docs/codeblock-with-emphasis-lines.jpg "Second image title")

## Test Case 7: Image in blockquote (should NOT be processed)

> ![Blockquote image](../docs/codeblock-with-line-number.jpg "Should not become figure")

## Test Case 8: Image already in figure (should NOT be processed)

<figure>
<img src="../docs/screenshot.jpg" alt="Already in figure" title="Should not be re-processed">
<figcaption>Existing caption</figcaption>
</figure>

## Test Case 9: No caption available (neither title nor alt)

<img src="../docs/codeblock-with-emphasis-lines.jpg">

## Test Case 10: Complex title parsing

![Alt backup](../docs/screenshot.jpg "Multi word caption text resize: 80% width: 300px height: 200px class: img-responsive")

## Test Case 11: Table caption handling

Table 1. Simple table caption.

| A | B |
| - | - |
| 1 | 2 |

## Test Case 12: Code block caption handling

Code 1. Example code block.

```js
console.log('hello')
```

## Test Case 13: Resize hints + blockquote label defaults

![図 Aaaaa](../docs/codeblock-with-emphasis-lines.jpg "resize: 10%")

図1 ああ

> ああ

引用元 あああ

![図 Aaaaa](../docs/codeblock-with-emphasis-lines.jpg "resize: 100%")

図1 ああ

