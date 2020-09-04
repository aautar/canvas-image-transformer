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

            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const canvasCtx = canvas.getContext('2d');

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

            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const canvasCtx = canvas.getContext('2d');

            canvasCtx.drawImage(video, 0, 0, newWidth, newHeight);
            return canvas;
        },

        toWebGLCanvas: function(srcCanvas) {
            const glCanvas = document.createElement('canvas');
            glCanvas.width = srcCanvas.width;
            glCanvas.height = srcCanvas.height;
            const gl = glCanvas.getContext('webgl');

            gl.viewport(0, 0, srcCanvas.width, srcCanvas.height);
            gl.clearColor(1.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            const mdl = {};
            mdl.verts = [ 
                -1.0,  1.0,  0.0,
                -1.0, -1.0,  0.0,
                 1.0, -1.0,  0.0,
                 1.0,  1.0,  0.0
            ];
            mdl.normals = [];
            mdl.indices = [0, 1, 3, 2];            
            mdl.texcoords = [
                 0.0, 0.0,
                 0.0, 1.0,
                 1.0, 1.0,
                 1.0, 0.0
            ];

            mdl.vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, mdl.vertexBuffer);                        
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mdl.verts), gl.STATIC_DRAW);
            mdl.vertexBuffer.itemSize = 3;
            mdl.vertexBuffer.numItems = mdl.verts.length / 3;
        
            mdl.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mdl.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mdl.indices), gl.STATIC_DRAW);
            mdl.indexBuffer.itemSize = 1;
            mdl.indexBuffer.numItems = mdl.indices.length;		
        
            mdl.texcoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, mdl.texcoordBuffer);                        
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mdl.texcoords), gl.STATIC_DRAW);
            mdl.texcoordBuffer.itemSize = 2;
            mdl.texcoordBuffer.numItems = mdl.texcoords.length / 2;			           
            
            // mat4.ortho(pMatrix, -1, 1, -1, 1, 0.1, -100);
            const pMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.019980020821094513, 0, -0, -0, -0.9980019927024841, 1]);

            // mat4.lookAt(mvMatrix, vec3.clone([0, 0, 0]), vec3.clone([0, 0, -1]), vec3.clone([0, 1, 0]));
            const mvMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0, -0, -0, 1]);
            
            const shprog = gl.createProgram();

            const vertexShaderSrc = `
                attribute vec3 aVertexPosition;
                attribute vec2 aTextureCoord;
                
                uniform mat4 uMVMatrix;
                uniform mat4 uPMatrix;
                
                varying vec2 vTextureCoord;
                
                void main(void) {
                    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
                    vTextureCoord = aTextureCoord;
                }            
            `;
            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexShaderSrc);
            gl.compileShader(vertexShader);

            const fragmentShaderSrc = `
                precision mediump float;

                uniform float uPeriod;
                uniform float uSceneWidth;
                uniform float uSceneHeight;
                uniform sampler2D uSampler;		  
                varying vec2 vTextureCoord;
                
                void main(void) {               
                    vec4 shiftedSampleLeft = vec4( 0. );
                    vec4 shiftedSampleRight = vec4( 0. );
                
                    float blurSampleOffsetScale = 2.1;
                    float px = (1.0 / uSceneWidth) * blurSampleOffsetScale;
                    float py = (1.0 / uSceneHeight) * blurSampleOffsetScale;
                    // need depth info
                
                    vec4 src = texture2D( uSampler, ( vTextureCoord ) );
                
                    shiftedSampleLeft = texture2D( uSampler, ( vTextureCoord + vec2(-0.01525, 0) ) );
                    shiftedSampleRight = texture2D( uSampler, ( vTextureCoord + vec2(0.01525, 0) ) );
                
                    gl_FragColor = src * vec4(1, shiftedSampleLeft.g, 1, 1) * vec4(shiftedSampleRight.r, 1, 1, 1);
                }
            `;
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentShaderSrc);
            gl.compileShader(fragmentShader);            

            gl.attachShader(shprog, vertexShader);
            gl.attachShader(shprog, fragmentShader);
            gl.linkProgram(shprog);

            shprog.vertexPositionAttribute = gl.getAttribLocation(shprog, "aVertexPosition");
            shprog.pMatrixUniform = gl.getUniformLocation(shprog, "uPMatrix");
            shprog.mvMatrixUniform = gl.getUniformLocation(shprog, "uMVMatrix");
            shprog.textureCoordAttribute = gl.getAttribLocation(shprog, "aTextureCoord");
            shprog.uPeriod = gl.getUniformLocation(shprog, "uPeriod");
            shprog.uSceneWidth = gl.getUniformLocation(shprog, "uSceneWidth");
            shprog.uSceneHeight = gl.getUniformLocation(shprog, "uSceneHeight");            
            gl.enableVertexAttribArray(shprog.vertexPositionAttribute);
            gl.enableVertexAttribArray(shprog.textureCoordAttribute);

            const tex = gl.createTexture();
            gl.useProgram(shprog);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            
            gl.uniform1i(shprog.samplerUniform, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, mdl.vertexBuffer);
            gl.vertexAttribPointer(shprog.vertexPositionAttribute, mdl.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, mdl.texcoordBuffer);
            gl.vertexAttribPointer(shprog.textureCoordAttribute, mdl.texcoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.uniformMatrix4fv(shprog.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shprog.mvMatrixUniform, false, mvMatrix);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mdl.indexBuffer);

            var period = Math.cos(0.2);
            gl.uniform1f(shprog.uPeriod, period + 1.0);
            gl.uniform1f(shprog.uSceneWidth, gl.viewportWidth);
            gl.uniform1f(shprog.uSceneHeight, gl.viewportHeight);

            gl.drawElements(gl.TRIANGLE_STRIP, mdl.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);            

            return glCanvas;
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
