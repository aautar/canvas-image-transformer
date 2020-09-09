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

### Apply a GLSL Fragment Shader

    const fragmentShaderSrc = `
        precision mediump float;

        uniform sampler2D uSampler;
        varying vec2 vTextureCoord;

        void main(void) {                
            gl_FragColor = texture2D(uSampler, (vTextureCoord));
        }
    `;

    const canvas2dResult = CanvasImageTransformer.applyGLSLFragmentShader(
        imgOnCanvas,
        fragmentShaderSrc,
        [
            {
                name: "uSomeVector",
                type: "2f",
                x: 2.0,
                y: 4.0
            },
        ]
    );

The `applyGLSLFragmentShader(...)` method will take a 2D canvas and apply a GLSL fragment shader to it (by rendering it as a textured quad on a WebGL canvas).

The following variables are pre-defined and can be used in the shader:
- `uSampler`: texture sampler bound to texture unit 0  
- `vTextureCoord`: the texture coordinate from the vertex shader

Additional variables can be passed via the `additionalShaderVars` argument, which is an array of objects, with each object containing the definition of a uniform. 

    [
        {
            name: <uniform-name>,
            type: <1f, 1i, 2f, 2i, 3f, 3i, 4f, 4i>,
            x: <1st value>
            y: <2nd value for 2f, 2i, 3f, ... types>
            z: <3rd value for 3f, 3i, 4f, ... types>
            w: <4th value for 4f and 4i types>
        }
    ]

The canvas passed in will be overwritten with the output on the WebGL canvas. The method will also return this canvas.
