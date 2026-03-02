---
title: Figure Labels Test
imgAltCaption: true
imgTitleCaption: true
---

<!--
Test focus:
- imgAltCaption/imgTitleCaption enabled
- label parsing for img/table style prefixes (en/ja)
-->

# Figure Labels Test

This document tests the figure label processing functionality.

## English Figure Labels

![Figure1: This is a test image with Figure label](../docs/codeblock-with-emphasis-lines.jpg)

![Figure1.1: This is a test image with Figure label using dot separator](../docs/codeblock-with-line-number.jpg)

![Figure2-A: This is a test image with Figure label using hyphen separator](../docs/codeblock-with-emphasis-lines.jpg)

![FigureA1.B2-C3: Complex Figure label](../docs/codeblock-with-line-number.jpg)

## Japanese Figure Labels

![図1　これは日本語の図ラベルです](../docs/codeblock-with-emphasis-lines.jpg)

![図1.2．これは点区切りの図ラベルです](../docs/codeblock-with-line-number.jpg)

![図A-1：これはコロン区切りの図ラベルです](../docs/codeblock-with-emphasis-lines.jpg)

![図B2。これは句点区切りの図ラベルです](../docs/codeblock-with-line-number.jpg)

## Regular Images (should not be processed)

![This is a regular image without figure labels](../docs/codeblock-with-emphasis-lines.jpg)

![Regular image with some text](../docs/codeblock-with-line-number.jpg)

