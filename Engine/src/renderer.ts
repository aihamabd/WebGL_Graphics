import { Camera } from './objects/camera';

import vertexShaderSource from './shaders/vertexShader.vert.glsl?raw'
import fragmentShaderSource from './shaders/fragmentShader.frag.glsl?raw'

import { glMatrix, mat4 } from 'gl-matrix';
import type { Shape3D } from './objects/shape3D';
import { Scene } from './scene';
export class Renderer {

    public gl;

    private canvas;

    private program;
    private scene: Scene | null;
    private projectionMatrix;
    private viewMatrix;
    private worldMatrix;

    private mProjectionUniformLoc;
    private mViewUniformLoc;
    private mWorldUniformLoc;

    public camera;
    constructor(canvas: HTMLCanvasElement) {

        this.scene = null;

        this.camera = new Camera();

        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.linkProgram(vertexShader, fragmentShader);
        this.gl.useProgram(this.program);

        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.worldMatrix = mat4.create();

        this.mProjectionUniformLoc = this.gl.getUniformLocation(this.program, 'mProjection') as WebGLUniformLocation;
        this.mViewUniformLoc = this.gl.getUniformLocation(this.program, 'mView') as WebGLUniformLocation;
        this.mWorldUniformLoc = this.gl.getUniformLocation(this.program, 'mWorld') as WebGLUniformLocation;
    }

    private compileShader(type: number, source: string): WebGLShader {

        const shader = this.gl.createShader(type);
        if (!shader) throw new Error('Failed to create shader');

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {

            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`Shader compile error: ${info}`);
        }

        return shader;
    }

    private linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {

        const program = this.gl.createProgram();
        if (!program) throw new Error('Failed to create program');

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {

            const info = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error(`Program link error: ${info}`);
        }

        return program;
    }

    public setScene(scene: Scene) {
        this.scene = scene;

        this.scene.shapes.forEach((shape: Shape3D) => {

            shape.uploadToGPU(this.gl, this.program);
        });
    }

    public render(dt: number) {

        mat4.identity(this.worldMatrix);
        mat4.rotateY(this.worldMatrix, this.worldMatrix, 0);
        this.camera.getViewMatrix(this.viewMatrix);
        mat4.perspective(this.projectionMatrix, glMatrix.toRadian(45), this.canvas.width / this.canvas.height, 0.1, 1000.0);

        this.gl.uniformMatrix4fv(this.mWorldUniformLoc, false, this.worldMatrix);
        this.gl.uniformMatrix4fv(this.mViewUniformLoc, false, this.viewMatrix);
        this.gl.uniformMatrix4fv(this.mProjectionUniformLoc, false, this.projectionMatrix);

        this.gl.clearColor(0.08, 0.08, 0.12, 1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.program);

        if (this.scene) {

            this.scene.shapes.forEach((shape: Shape3D) => {

                this.gl.uniformMatrix4fv(this.mWorldUniformLoc, false, shape.getModelMatrix());

                shape.updateRotation(dt);
                shape.draw(this.gl, this.program);
            });

        }
    }
}
