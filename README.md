# canvas-image-transformer

### Resize an image

    var imgDataUri = window.CanvasImageTransformer.resize(img, 32);

The resize(...) method take a loaded `Image` object and an `int` specifying the maximum width or height of the generated image (the aspect ratio of the image is maintained).
