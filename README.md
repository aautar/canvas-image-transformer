# canvas-image-transformer

### Image to Canvas

    const canvas = CanvasImageTransformer.imageToCanvas(img, 100, 100, true);

The `imageToCanvas(...)` method takes a loaded `Image` object, an `int` for the new width, an `int` for the new height, and a `boolean` flag specifying whether to scale the image proportially (i.e. maintain aspect ratio), and return a `HTMLCanvasElement` with the image data drawn on it.

### Resize an image

    const canvas = CanvasImageTransformer.imageToCanvas(img, 32, 32, true);
    const imgDataUri = canvas.toDataURL("image/png");

This can be accomplished with the `imageToCanvas(...)` method. With the returned `HTMLCanvasElement` object, you can either put the element in the DOM or use `HTMLCanvasElement.toDataURL(...)` to get a string with a data URI representation of the image.

### Transform to grayscale

    const canvas = CanvasImageTransformer.toGrayscale(canvas);

The the `toGrayscale(...)` method will transform each pixel on the Canvas to grayscale. The method returns the `HTMLCanvasElement` object that is passed in.

### Apply a convolution kernel

    const kernelArr = [
        0.1, 0.1, 0.1,
        0.1, 0.1, 0.1,
        0.1, 0.1, 0.1
    ];
    
    const canvas = CanvasImageTransformer.applyKernel(canvas, CanvasImageTransformer.createKernel(kernelArr, 3));

The the `applyKernel(...)` method will [convolve](https://en.wikipedia.org/wiki/Kernel_(image_processing)) each pixel on the Canvas by the given convolution kernel. The method returns the `HTMLCanvasElement` object that is passed in.
