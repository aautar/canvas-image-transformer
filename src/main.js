const CanvasImageTransformer =  (function () {

    var _colorToRGBA = function(color) {
        return [
            color >> 24 & 0xFF,
            color >> 16 & 0xFF,
            color >> 8 & 0xFF,
            color & 0xFF
        ];
    };

    var _rgbaToColor = function(r, g, b, a) {
        return (r << 24) + (g << 16) + (b << 8) + a;
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
         * @param {Array} kernel
         * @param {Canvas} 
         */
        applyKernel: function(canvas, _kernel) {
            var canvasCtx = canvas.getContext('2d');
            var pixels = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);

            /*for(var i=0; i<pixels.data.length; i+=4) {
                var grayPixel = parseInt(((0.2126*(pixels.data[i]/255.0)) + (0.7152*(pixels.data[i+1]/255.0)) + (0.0722*(pixels.data[i+2]/255.0))) * 255.0);

                pixels.data[i] = grayPixel;
                pixels.data[i + 1] = grayPixel;
                pixels.data[i + 2] = grayPixel;
            }*/

            canvasCtx.putImageData(pixels, 0, 0);
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
