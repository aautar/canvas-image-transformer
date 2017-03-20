window.CanvasImageTransformer =  (function () {
    return {

        /**
        *
        * @param {Image} img
        * @param {int} maxExtent
        * @returns {undefined}
        */
        resize: function (img, maxExtent) {
            
            var newWidth = maxExtent;
            var newHeight = maxExtent;
            if(img.width > img.height) {
                newHeight = newHeight * (img.height / img.width);
            }
            else if(img.height > img.width) {
                newWidth = newWidth * (img.width / img.height);
            }
            else 
            {}

            var canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            var canvasCtx = canvas.getContext('2d');

            canvasCtx.drawImage(img, 0, 0, newWidth, newHeight);

            return canvas.toDataURL("image/png");
        }
    };
})();
