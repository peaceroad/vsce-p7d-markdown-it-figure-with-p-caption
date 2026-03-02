---
title: Setting Verification Test
imgAltCaption: false
imgTitleCaption: true
notSetImageElementAttributes: false
---

<!--
Test focus:
- frontmatter overrides extension settings
- imgTitleCaption true / imgAltCaption false
-->

# Extension Settings Verification

This test verifies that frontmatter settings override extension settings correctly.

## Expected Behavior:
- imgTitleCaption: true (from frontmatter, should override extension setting)
- imgAltCaption: false (from frontmatter, should override extension setting)
- Images should only use title for captions, not alt text

## Test Images:

### 1. Image with both title and alt (should use title only)
![Alt text should be ignored](../docs/screenshot.jpg "Title caption from frontmatter setting")

### 2. Image with only alt text (should NOT create figure since imgAltCaption is false)
![This alt text should not become caption](../docs/codeblock-with-emphasis-lines.jpg)

### 3. Image with title containing attributes
![Alt backup text](../docs/codeblock-with-line-number.jpg "Caption text resize: 80% width: 250px")

### 4. Disabled setting test
This should show that frontmatter correctly overrides extension settings.

