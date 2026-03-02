---
title: Test without caption settings
author: Test Author
---

<!--
Test focus:
- imgAltCaption/imgTitleCaption unset in frontmatter
- no automatic figure conversion from alt/title
-->

# Test Document Without Caption Settings

This document has no imgAltCaption or imgTitleCaption settings in frontmatter.
The figure-caption-processor.js should NOT process any images.

![Test Image with Alt](../docs/screenshot.jpg)

![Test Image with Title](../docs/codeblock-with-emphasis-lines.jpg "This title should not become caption")

![Another test image](../docs/codeblock-with-line-number.jpg "Another title that should not be processed")

Expected behavior: All images should remain as simple img tags, not converted to figure elements. (Renderer-image may still set width/height unless disabled.)

