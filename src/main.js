window.CanvasImageTransformer =  (function () {
    return {

        /**
        *
        * @param {Image} img
        * @param {int} newWidth
        * @param {int} newHeight
        * @param {bool} proportionalScale
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
                pixels.data[i + 3] = 255;
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
        }        
    };
})();
