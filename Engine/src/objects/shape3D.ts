import { mat4 } from 'gl-matrix';

export const ColorMode = {
    VertexColor: 0,
    TextureOnly: 1,
    Blend: 2,
} as const;
export interface Shape3DOptions {
    drawMode?: number;
    textureUrl?: string;
    colorMode?: ColorMode;
}

export type ColorMode = typeof ColorMode[keyof typeof ColorMode];

export abstract class Shape3D {

    private vao: WebGLVertexArrayObject | null = null;
    private vertexCount: number = 0;

    private texture: WebGLTexture | null = null;
    private hasTexture: boolean = false;

    protected vertexData: number[];

    protected origin: [number, number, number] = [0, 0, 0];
    protected rotationVector: [number, number, number] = [0, 0, 0];
    protected rotationSpeed: [number, number, number] = [0, 0, 0];
    protected scale: [number, number, number] = [1, 1, 1];

    protected textureUrl: string | null;

    protected colorMode: ColorMode;
    protected drawMode: number;
    private static readonly STRIDE = 8 * Float32Array.BYTES_PER_ELEMENT;

    constructor(vertexData: number[], options: Shape3DOptions = {}) {

        this.vertexData = vertexData;
        this.drawMode = options.drawMode ?? WebGL2RenderingContext.TRIANGLES;
        this.textureUrl = options.textureUrl ?? null;
        this.colorMode = options.colorMode ?? (this.textureUrl ? ColorMode.TextureOnly : ColorMode.VertexColor);
    }

    public uploadToGPU(gl: WebGL2RenderingContext, program: WebGLProgram) {

        // The purpose of a Vertex Array Object (VAO) is to store vertex data (position & color of each vertex)
        // into a single structure that can be passed down towards the shader.

        const vertices = new Float32Array(this.vertexData);
        this.vertexCount = vertices.length / 8;
        const vao = gl.createVertexArray();

        if (!vao) throw new Error('Failed to create VAO');
        this.vao = vao;
        gl.bindVertexArray(vao);

        // After binding the VAO with our context, create a Vertex Buffer Object (VBO) that takes the data from our VAO
        // and determines how it gets interpreted by the vertex shader.

        // The engine can continue to work on the next buffer while the GPU handles the rendering of the current buffer,
        // this allows the CPU and GPU to work in parallel.

        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(program, 'vertexPosition');
        const colorLoc = gl.getAttribLocation(program, 'vertexColor');
        const uvLoc = gl.getAttribLocation(program, 'vertexUV');

        gl.enableVertexAttribArray(positionLoc);
        gl.enableVertexAttribArray(colorLoc);

        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, Shape3D.STRIDE, 0);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, Shape3D.STRIDE, 3 * Float32Array.BYTES_PER_ELEMENT);

        if (uvLoc !== -1) {

            gl.enableVertexAttribArray(uvLoc);
            gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, Shape3D.STRIDE, 6 * Float32Array.BYTES_PER_ELEMENT);
        }

        gl.bindVertexArray(null);

        if (this.textureUrl) { this.loadTexture(gl, this.textureUrl) }
    }

    private loadTexture(gl: WebGL2RenderingContext, url: string) {

        const texture = gl.createTexture();
        if (!texture) throw new Error('Failed to create texture');

        gl.bindTexture(gl.TEXTURE_2D, texture);

        // 1x1 magenta placeholder pixel while the real image loads, so nothing renders untextured/black

        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 255, 255])
        );

        const image = new Image();

        image.onload = () => {

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        };

        this.texture = texture;
        this.hasTexture = true;

        image.src = url;
    }

    public getModelMatrix() {

        let mMatrix = mat4.create();

        mat4.identity(mMatrix);

        mat4.translate(mMatrix, mMatrix, this.origin);

        mat4.rotateX(mMatrix, mMatrix, this.rotationVector[0]);
        mat4.rotateY(mMatrix, mMatrix, this.rotationVector[1]);
        mat4.rotateZ(mMatrix, mMatrix, this.rotationVector[2]);

        mat4.scale(mMatrix, mMatrix, this.scale);

        return mMatrix;
    }

    public updateRotation(dt: number) {

        this.rotationVector[0] += this.rotationSpeed[0] * dt;
        this.rotationVector[1] += this.rotationSpeed[1] * dt;
        this.rotationVector[2] += this.rotationSpeed[2] * dt;
    }

    public draw(gl: WebGL2RenderingContext, program: WebGLProgram) {

        const hasTextureLoc = gl.getUniformLocation(program, 'uHasTexture');
        const textureLoc = gl.getUniformLocation(program, 'uTexture');
        const colorModeLoc = gl.getUniformLocation(program, 'uColorMode');

        gl.uniform1i(hasTextureLoc, this.hasTexture ? 1 : 0);
        gl.uniform1i(colorModeLoc, this.colorMode);

        if (this.hasTexture && this.texture) {

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(textureLoc, 0);
        }

        gl.bindVertexArray(this.vao);
        gl.drawArrays(this.drawMode, 0, this.vertexCount);
    }

    public setOrigin(origin: [number, number, number]): this {
        this.origin = origin;
        return this;
    }

    public setRotationSpeed(rotationSpeed: [number, number, number]): this {
        this.rotationSpeed = rotationSpeed;
        return this;
    }

    public setScale(scale: [number, number, number]): this {
        this.scale = scale;
        return this;
    }

    public setColorMode(colorMode: ColorMode): this {
        this.colorMode = colorMode;
        return this;
    }

    public setRotation(rotationVector: [number, number, number]): this {
        this.rotationVector = rotationVector
        return this;
    }
}