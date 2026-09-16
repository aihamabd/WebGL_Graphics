import './style.css'

import vertexShaderSource from './shaders/vertexShader.vert.glsl?raw'
import fragmentShaderSource from './shaders/fragmentShader.frag.glsl?raw'

import { glMatrix, mat4, type mat4 as Mat4Type} from 'gl-matrix';
import { Pyramid3D } from './pyramid.ts';
import { Camera } from './camera.ts';
class Renderer {

    public gl;

    private canvas;

    private program;
    private shapes;
    private projectionMatrix;
    private viewMatrix;
    private worldMatrix;
    private angle;

    private mProjectionUniformLoc;
    private mViewUniformLoc;
    private mWorldUniformLoc;

    public camera;
    constructor() {

        this.angle = 0;
        this.shapes = [];

        this.camera = new Camera();

        this.canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
        this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;

        this.gl.enable(this.gl.DEPTH_TEST);

        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.linkProgram(vertexShader, fragmentShader);
        this.gl.useProgram(this.program);

        this.shapes.push(new Pyramid3D(this.gl, this.program));

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

    public render(dt: number) {

        this.angle += dt;

        mat4.identity(this.worldMatrix);
        mat4.rotateY(this.worldMatrix, this.worldMatrix, this.angle);
        this.camera.getViewMatrix(this.viewMatrix);
        mat4.perspective(this.projectionMatrix, glMatrix.toRadian(45), this.canvas.width / this.canvas.height, 0.1, 1000.0);

        this.gl.uniformMatrix4fv(this.mWorldUniformLoc, false, this.worldMatrix);
        this.gl.uniformMatrix4fv(this.mViewUniformLoc, false, this.viewMatrix);
        this.gl.uniformMatrix4fv(this.mProjectionUniformLoc, false, this.projectionMatrix);

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.program);

        this.shapes.forEach((shape) => {
            shape.draw();
        });
    }
}

const renderer = new Renderer();
const pressedKeys = new Set<string>();

let lastTime: number = 0;
function mainLoop(currentTime: number) {

    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    renderer.render(dt);
    renderer.camera.update(dt, moveInput);

    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);

const moveInput = { forward: 0, right: 0, up: 0 };

function updateMoveInput() {

    moveInput.forward = (pressedKeys.has('KeyW') ? 1 : 0) - (pressedKeys.has('KeyS') ? 1 : 0);
    moveInput.right = (pressedKeys.has('KeyD') ? 1 : 0) - (pressedKeys.has('KeyA') ? 1 : 0);
    moveInput.up = (pressedKeys.has('Space') ? 1 : 0) - (pressedKeys.has('ShiftLeft') ? 1 : 0);
}

document.addEventListener('keydown', (e) => {
    pressedKeys.add(e.code);
    updateMoveInput();
});

document.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.code);
    updateMoveInput();
});

const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;

canvas.addEventListener('click', () => {

    canvas.requestPointerLock();
});

document.addEventListener('mousemove', (e) => {

    if (document.pointerLockElement !== canvas) return;

    const sensitivity = 0.1;
    renderer.camera.look(e.movementX * sensitivity, e.movementY * sensitivity);
});

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer.gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();