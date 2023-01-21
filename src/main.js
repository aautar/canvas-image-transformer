const CanvasImageTransformer =  (function () {
    /**
     * 
     * @param {Number} color 
     * @returns {Number[]}
     */
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
     * @returns {Number[]}
     */
    const _lookupPixelf = function(_pixelArr, _width, _x, _y) {
        const idx = (_x + _y * _width) * 4;
        return [_pixelArr[idx] / 255.0, _pixelArr[idx+1] / 255.0, _pixelArr[idx+2] / 255.0, _pixelArr[idx+3] / 255.0];
    };

    /**
     * 
     * @param {Number[]} _matrixArray 
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
         * @returns {Number[]}
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
        * @returns {HTMLCanvasElement}
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
        * @returns {HTMLCanvasElement}
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

        /**
         * 
         * @param {WebGL2RenderingContext} _gl 
         * @param {WebGLProgram} _shprog 
         * @param {Object[]} _additionalShaderVars 
         */
        _setAdditionalShaderVars: function(_gl, _shprog, _additionalShaderVars) {
            for(let i=0; i<_additionalShaderVars.length; i++) {
                const shVar = _additionalShaderVars[i];
                if(shVar.type === '1f') {
                    _gl.uniform1f(_gl.getUniformLocation(_shprog, shVar.name), shVar.x);
                } else if(shVar.type === '1i') {
                    _gl.uniform1i(_gl.getUniformLocation(_shprog, shVar.name), shVar.x);
                } else if(shVar.type === '2f') {
                    _gl.uniform2f(_gl.getUniformLocation(_shprog, shVar.name), shVar.x, shVar.y);
                } else if(shVar.type === '2i') {
                    _gl.uniform2i(_gl.getUniformLocation(_shprog, shVar.name), shVar.x, shVar.y);
                } else if(shVar.type === '3f') {
                    _gl.uniform3f(_gl.getUniformLocation(_shprog, shVar.name), shVar.x, shVar.y, shVar.z);
                } else if(shVar.type === '3i') {
                    _gl.uniform3i(_gl.getUniformLocation(_shprog, shVar.name), shVar.x, shVar.y, shVar.z);
                } else if(shVar.type === '4f') {
                    _gl.uniform4f(_gl.getUniformLocation(_shprog, shVar.name), shVar.x, shVar.y, shVar.z, shVar.w);
                } else if(shVar.type === '4i') {
                    _gl.uniform4i(_gl.getUniformLocation(_shprog, shVar.name), shVar.x, shVar.y, shVar.z, shVar.w);
                } else {
                    throw "Invalid shader var specified";
                }
            }
        },

        /**
         * 
         * @param {WebGL2RenderingContext} _gl 
         * @param {String} _fragmentShaderSrc 
         * @returns {WebGLProgram}
         */
        _createShaderProgram: function(_gl, _fragmentShaderSrc) {
            const shprog = _gl.createProgram();

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

            const vertexShader = _gl.createShader(_gl.VERTEX_SHADER);
            _gl.shaderSource(vertexShader, vertexShaderSrc);
            _gl.compileShader(vertexShader);

            const fragmentShader = _gl.createShader(_gl.FRAGMENT_SHADER);
            _gl.shaderSource(fragmentShader, _fragmentShaderSrc);
            _gl.compileShader(fragmentShader);

            _gl.attachShader(shprog, vertexShader);
            _gl.attachShader(shprog, fragmentShader);
            _gl.linkProgram(shprog);

            shprog.vertexPositionAttribute = _gl.getAttribLocation(shprog, "aVertexPosition");
            shprog.pMatrixUniform = _gl.getUniformLocation(shprog, "uPMatrix");
            shprog.mvMatrixUniform = _gl.getUniformLocation(shprog, "uMVMatrix");
            shprog.textureCoordAttribute = _gl.getAttribLocation(shprog, "aTextureCoord");

            return shprog;
        },

        /**
         * 
         * @param {WebGL2RenderingContext} _gl 
         * @returns {Object}
         */
        _createRectangleGLModel: function(_gl) {
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

            mdl.vertexBuffer = _gl.createBuffer();
            _gl.bindBuffer(_gl.ARRAY_BUFFER, mdl.vertexBuffer);                        
            _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(mdl.verts), _gl.STATIC_DRAW);
            mdl.vertexBuffer.itemSize = 3;
            mdl.vertexBuffer.numItems = mdl.verts.length / 3;
        
            mdl.indexBuffer = _gl.createBuffer();
            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, mdl.indexBuffer);
            _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mdl.indices), _gl.STATIC_DRAW);
            mdl.indexBuffer.itemSize = 1;
            mdl.indexBuffer.numItems = mdl.indices.length;		
        
            mdl.texcoordBuffer = _gl.createBuffer();
            _gl.bindBuffer(_gl.ARRAY_BUFFER, mdl.texcoordBuffer);                        
            _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(mdl.texcoords), _gl.STATIC_DRAW);
            mdl.texcoordBuffer.itemSize = 2;
            mdl.texcoordBuffer.numItems = mdl.texcoords.length / 2;

            return mdl;
        },

        /**
         * 
         * @param {HTMLCanvasElement} srcCanvas 
         * @param {String} fragmentShaderSrc 
         * @param {Object[]} additionalShaderVars 
         * @param {Map} metricsMap
         * @returns {HTMLCanvasElement}
         */
        applyGLSLFragmentShader: function(srcCanvas, fragmentShaderSrc, additionalShaderVars, metricsMap) {
            const glCanvas = document.createElement('canvas');
           
            glCanvas.width = srcCanvas.width;
            glCanvas.height = srcCanvas.height;


            let gl = glCanvas.getContext('webgl2');
 

            if(!gl) { // fallback to WebGL 1
                gl = glCanvas.getContext('webgl');
            }
           
            if(!gl) { // no WebGL support
                throw "Browser does not support WebGL"
            }

            gl.viewport(0, 0, srcCanvas.width, srcCanvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);


            const createRectangleGLModelT1 = performance.now();
            const mdl = this._createRectangleGLModel(gl);		           
            (metricsMap.get("createRectangleGLModel")).push(performance.now() - createRectangleGLModelT1);
            
            // mat4.ortho(pMatrix, -1, 1, -1, 1, 0.1, -100);
            const pMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.019980020821094513, 0, -0, -0, -0.9980019927024841, 1]);

            // mat4.lookAt(mvMatrix, vec3.clone([0, 0, 0]), vec3.clone([0, 0, -1]), vec3.clone([0, 1, 0]));
            const mvMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0, -0, -0, 1]);

            const createShaderProgramT1 = performance.now();
            const shprog = this._createShaderProgram(gl, fragmentShaderSrc);
            (metricsMap.get("createShaderProgram")).push(performance.now() - createShaderProgramT1);

            gl.enableVertexAttribArray(shprog.vertexPositionAttribute);
            gl.enableVertexAttribArray(shprog.textureCoordAttribute);

            const tex = gl.createTexture();

            gl.useProgram(shprog);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex);


            const texImage2DT1 = performance.now();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas); // costly for large images
            (metricsMap.get("texImage2D")).push(performance.now() - texImage2DT1);

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

            gl.uniform1f(gl.getUniformLocation(shprog, "uSceneWidth"), gl.viewportWidth);
            gl.uniform1f(gl.getUniformLocation(shprog, "uSceneHeight"), gl.viewportHeight);
            gl.uniform1i(gl.getUniformLocation(shprog, "uSampler"), 0);

            this._setAdditionalShaderVars(gl, shprog, additionalShaderVars);

            const drawElementsT1 = performance.now();
            gl.drawElements(gl.TRIANGLE_STRIP, mdl.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
            (metricsMap.get("drawElements")).push(performance.now() - drawElementsT1);

            // for consistency with other apply* methods, we mutate srcCanvas with the output and return it
            const drawImageT1 = performance.now();
            const srcCtx = srcCanvas.getContext('2d');
            srcCtx.drawImage(glCanvas, 0, 0, srcCanvas.width, srcCanvas.height);
            (metricsMap.get("drawImage")).push(performance.now() - drawImageT1);

            return srcCanvas;
        },

        /**
         * 
         * @param {HTMLCanvasElement} srcCanvas 
         * @param {String} fragmentShaderSrc 
         * @param {Function} additionalShaderVars 
         * @returns {HTMLCanvasElement}
         */
        genGLSLFragmentShaderAnimation: function(srcCanvas, fragmentShaderSrc, additionalShaderVars) {
            const glCanvas = document.createElement('canvas');

            glCanvas.width = srcCanvas.width;
            glCanvas.height = srcCanvas.height;
            let gl = glCanvas.getContext('webgl2');

            if(!gl) { // fallback to WebGL 1
                gl = glCanvas.getContext('webgl');
            }

            if(!gl) { // no WebGL support
                throw "Browser does not support WebGL"
            }

            gl.viewport(0, 0, srcCanvas.width, srcCanvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            const mdl = this._createRectangleGLModel(gl);		           
            
            // mat4.ortho(pMatrix, -1, 1, -1, 1, 0.1, -100);
            const pMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.019980020821094513, 0, -0, -0, -0.9980019927024841, 1]);

            // mat4.lookAt(mvMatrix, vec3.clone([0, 0, 0]), vec3.clone([0, 0, -1]), vec3.clone([0, 1, 0]));
            const mvMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0, -0, -0, 1]);
            
            const shprog = this._createShaderProgram(gl, fragmentShaderSrc);

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

            gl.uniform1f(gl.getUniformLocation(shprog, "uSceneWidth"), gl.viewportWidth);
            gl.uniform1f(gl.getUniformLocation(shprog, "uSceneHeight"), gl.viewportHeight);
            gl.uniform1i(gl.getUniformLocation(shprog, "uSampler"), 0);
            
            const animate = function(_timestamp) {
                CanvasImageTransformer._setAdditionalShaderVars(gl, shprog, additionalShaderVars(_timestamp));
                gl.drawElements(gl.TRIANGLE_STRIP, mdl.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);

            return glCanvas;
        },


        /**
         * @param {HTMLCanvasElement} canvas
         * @param {Kernel} kernel
         * @returns {HTMLCanvasElement}
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
         * @param {HTMLCanvasElement} canvas
         * @param {HTMLCanvasElement} 
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
         * @param {HTMLCanvasElement} canvas
         * @param {HTMLCanvasElement} 
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
         * @param {HTMLCanvasElement} canvas
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
