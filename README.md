# canvas-image-transformer

### Image to Canvas

    var canvas = window.CanvasImageTransformer.imageToCanvas(img, 100, 100, true);

The `imageToCanvas(...)` method takes a loaded `Image` object, an `int` for the new width, an `int` for the new height, and a `boolean` flag specifying whether to scale the image proportially (i.e. maintain aspect ratio), and return a `HTMLCanvasElement` with the image data drawn on it.

### Resize an image

    var canvas = window.CanvasImageTransformer.imageToCanvas(img, 32, 32, true);
    var imgDataUri = canvas.toDataURL("image/png");

This can be accomplished with the `imageToCanvas(...)` method. With the returned `HTMLCanvasElement` object, you can either put the element in the DOM or use `HTMLCanvasElement.toDataURL(...)` to get a string with a data URI representation of the image.
