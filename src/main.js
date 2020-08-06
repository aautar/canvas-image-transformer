const CanvasImageTransformer =  (function () {
    const _colorToRGBA = function(color) {
        return [
            color >> 24 & 0xFF,
            color >> 16 & 0xFF,
            color >> 8 & 0xFF,
            color & 0xFF
        ];
    };

    /**
     * 
     * @param {Number} r 
     * @param {Number} g 
     * @param {Number} b 
     * @param {Number} a 
     * 
     * @returns {Number}
     */
    const _rgbaToColor = function(r, g, b, a) {
        return (r << 24) + (g << 16) + (b << 8) + a;
    };

    /**
     * 
     * @param {Uint8ClampedArray} _pixelArr 
     * @param {Number} _width 
     * @param {Number} _x 
     * @param {Number} _y 
     * 
     * @returns {Array}
     */
    const _lookupPixelf = function(_pixelArr, _width, _x, _y) {
        const idx = (_x + _y * _width) * 4;
        return [_pixelArr[idx] / 255.0, _pixelArr[idx+1] / 255.0, _pixelArr[idx+2] / 255.0, _pixelArr[idx+3] / 255.0];
    };

    /**
     * 
     * @param {Array} _matrixArray 
     * @param {Number} _width
     * @returns {Kernel}
     */    
    const Kernel = function(_matrixArray, _width) {
        this.getMatrixArray = function() {
            return _matrixArray;
        };

        this.getWidth = function() {
            return _width;
        };
    };

    return {
        /**
         * @param {Number} color
         * @returns {Array}
         */
        colorToRGBA: _colorToRGBA,

        /**
         * @param {Number} r
         * @param {Number} g
         * @param {Number} b
         * @param {Number} a
         * @returns {Number}
         */
        rgbaToColor: _rgbaToColor,

        /**
         * 
         * @param {Array} matrixArray 
         * @param {Number} width
         * @returns {Kernel}
         */
        createKernel: function(matrixArray, width) {
            return new Kernel(matrixArray, width);
        },

        /**
        *
        * @param {HTMLImageElement} img
        * @param {Number} newWidth
        * @param {Number} newHeight
        * @param {Boolean} proportionalScale
        * @returns {Canvas}
        */
        imageToCanvas: function(img, newWidth, newHeight, proportionalScale) {
            if(proportionalScale) {
                if(img.width > img.height) {
                    newHeight = newHeight * (img.height / img.width);
                }
                else if(img.height > img.width) {
                    newWidth = newWidth * (img.width / img.height);
                }
                else 
                {}
            }

            var canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            var canvasCtx = canvas.getContext('2d');

            canvasCtx.drawImage(img, 0, 0, newWidth, newHeight);
            return canvas;
        },

        /**
        *
        * @param {HTMLVideoElement} video
        * @param {Number} newWidth
        * @param {Number} newHeight
        * @param {Boolean} proportionalScale
        * @returns {Canvas}
        */
        videoFrameToCanvas: function(video, newWidth, newHeight, proportionalScale) {
            if(proportionalScale) {
                if(video.videoWidth > video.videoHeight) {
                    newHeight = newHeight * (video.videoHeight / video.videoWidth);
                }
                else if(video.height > video.videoWidth) {
                    newWidth = newWidth * (video.videoWidth / video.videoHeight);
                }
                else 
                {}
            }

            var canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            var canvasCtx = canvas.getContext('2d');

            canvasCtx.drawImage(video, 0, 0, newWidth, newHeight);
            return canvas;
        },

        /**
         * @param {Canvas} canvas
         * @param {Kernel} kernel
         * @returns {Canvas}
         */
        applyKernel: function(canvas, kernel) {
            const canvasCtx = canvas.getContext('2d');
            const srcPixels = (canvasCtx.getImageData(0, 0, canvas.width, canvas.height)).data;
            const destPixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);
            const kernelWidth = kernel.getWidth();
            const kernelMatrixArr = kernel.getMatrixArray();

            for(let y=0; y<canvas.height; y++) {
                for(let x=0; x<canvas.width; x++) {
                    let acc = [0,0,0,0];

                    for(let ky=0; ky<kernelWidth; ky++) {
                        for(let kx = 0; kx<kernelWidth; kx++) {
                            const kidx = kx + ky*kernelWidth;
                            const kxRelative = kx - ((kernelWidth-1)/2);
                            const kyRelative = ky - ((kernelWidth-1)/2);

                            let kPixelX = x + kxRelative;
                            let kPixelY = y + kyRelative;

                            if(kPixelX < 0 || kPixelY < 0 || kPixelX >= canvas.width || kPixelY >= canvas.height) {
                                continue;
                            }

                            const kPixel = _lookupPixelf(srcPixels, canvas.width, kPixelX, kPixelY);
                            acc[0] += kernelMatrixArr[kidx] * kPixel[0];
                            acc[1] += kernelMatrixArr[kidx] * kPixel[1];
                            acc[2] += kernelMatrixArr[kidx] * kPixel[2];

                            if(kxRelative === 0 && kyRelative === 0) {
                                acc[3] = kPixel[3]; // preserve alpha, i.e. use alpha of center pixel
                            }
                        }
                    }

                    // write pixel
                    const pidx = (x + y * canvas.width) * 4;
                    destPixels[pidx + 0] = parseInt(acc[0] * 255.0);
                    destPixels[pidx + 1] = parseInt(acc[1] * 255.0);
                    destPixels[pidx + 2] = parseInt(acc[2] * 255.0);
                    destPixels[pidx + 3] = parseInt(acc[3] * 255.0);
                }
            }

            canvasCtx.putImageData(new ImageData(destPixels, canvas.width, canvas.height), 0, 0);
            return canvas;
        },        

        /**
         * @param {Canvas} canvas
         * @param {Canvas} 
         */
        toGrayscale: function(canvas) {
            var canvasCtx = canvas.getContext('2d');
            var pixels = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);

            for(var i=0; i<pixels.data.length; i+=4) {
                var grayPixel = parseInt(((0.2126*(pixels.data[i]/255.0)) + (0.7152*(pixels.data[i+1]/255.0)) + (0.0722*(pixels.data[i+2]/255.0))) * 255.0);

                pixels.data[i] = grayPixel;
                pixels.data[i + 1] = grayPixel;
                pixels.data[i + 2] = grayPixel;
            }

            canvasCtx.putImageData(pixels, 0, 0);
            return canvas;
        },

        /**
         * @param {Canvas} canvas
         * @param {Canvas} 
         */
        toBlackAndWhite: function(canvas) {
            var canvasCtx = canvas.getContext('2d');
            var pixels = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);

            for(var i=0; i<pixels.data.length; i+=4) {
                var p = (0.2126*(pixels.data[i]/255.0)) + (0.7152*(pixels.data[i+1]/255.0)) + (0.0722*(pixels.data[i+2]/255.0));

                if(p < 0.5) {
                    pixels.data[i] = 0;
                    pixels.data[i + 1] = 0;
                    pixels.data[i + 2] = 0;
                    pixels.data[i + 3] = 255;
                } else {
                    pixels.data[i] = 255;
                    pixels.data[i + 1] = 255;
                    pixels.data[i + 2] = 255;
                    pixels.data[i + 3] = 255;                    
                }
            }

            canvasCtx.putImageData(pixels, 0, 0);
            return canvas;
        },

        /**
         * @param {Canvas} canvas
         * @param {Map} 
         */
        computeColorFrequencyMap: function(canvas) {
            var colorFrequencyMap = new Map();

            var canvasCtx = canvas.getContext('2d');
            var pixels = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);

            for(var i=0; i<pixels.data.length; i+=4) {
                
                var rgba = _rgbaToColor(
                    pixels.data[i],
                    pixels.data[i+1],
                    pixels.data[i+2],
                    pixels.data[i+3]
                );

                if(!colorFrequencyMap.has(rgba)) {
                    colorFrequencyMap.set(rgba, 1);
                } else {
                    colorFrequencyMap.set(rgba, colorFrequencyMap.get(rgba) + 1);
                }
            }

            return colorFrequencyMap;
        },

    };
})();

if(typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasImageTransformer;
}
