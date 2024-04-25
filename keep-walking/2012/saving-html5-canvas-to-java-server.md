---
title: Saving HTML5 canvas to Java server
date: 12 Jul 2012
tags: 
- coding-techniques
- java
alias:
- /tech/saving-html5-canvas-to-java-server.html
- /2012/07/saving-html5-canvas-to-java-server.html
---

If you are working with HTML5 Canvas element and are looking to save the generated PNG file 
back on to the server via Java - it is not as easy as saving the byte array. The reason that 
the generated PNG data is URL encoded and is prefixed with the dataURI format headers.

<!-- break here -->

```javascript
var canvas = document.getElementById('#myCanvas');
var pngData = canvas.toDataURL('image/png');
```

The following code will convert the raw bytes by stripping off the headers, and coverting the Base64 encoded data to the raw PNG bytes.

```java
private void saveImage(byte[] pngData) {
    String png = new String(pngData);
    String find = "base64%2C";
    String tokens = png.substring(png.indexOf(find) + find.length());
    String decoded = StringUtils.replace(tokens, "%2F", "/");
    byte[] bytes = new Base64Encoder().decode(decoded);
 
    // save the generated bytes
    // which can then be read in a BufferedImage
    BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
  
  // mroe code
}
```

Hope this helps.