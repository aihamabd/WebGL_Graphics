import './style.css'

import oiCatTexture from './assets/Muchkin2_baseColor.png';

import suzzaneObjRaw from './assets/suzanne.obj?raw';
import catObjRaw from './assets/oiiaioooooiai_cat.obj?raw';

import vertexShaderSource from './shaders/vertexShader.vert.glsl?raw'
import fragmentShaderSource from './shaders/fragmentShader.frag.glsl?raw'

import { glMatrix, mat4 } from 'gl-matrix';

import { Camera } from './camera';
import { playerController } from './playerController';

import { Pyramid3D } from './pyramid3D';
import { Cube3D } from './cube3D';
import { Grid } from './grid';
import { ObjModel3D } from './objModel3D';
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

        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.worldMatrix = mat4.create();

        this.mProjectionUniformLoc = this.gl.getUniformLocation(this.program, 'mProjection') as WebGLUniformLocation;
        this.mViewUniformLoc = this.gl.getUniformLocation(this.program, 'mView') as WebGLUniformLocation;
        this.mWorldUniformLoc = this.gl.getUniformLocation(this.program, 'mWorld') as WebGLUniformLocation;

        this.shapes.push(new Pyramid3D(this.gl, this.program)
            .setOrigin([2, -2, 2])
            .setRotationSpeed([0, 1, 0]));
        this.shapes.push(new Cube3D(this.gl, this.program, 20, 0.02, 20, Array(6).fill([0.25, 0.25, 0.27]))
            .setOrigin([0, -0.02, 0]));
        this.shapes.push(new Grid(this.gl, this.program, 20, 10, 0));
        this.shapes.push(new ObjModel3D(this.gl, this.program, catObjRaw, { textureUrl: oiCatTexture })
            .setOrigin([0, 0, 0])
            .setRotationSpeed([0, 2, 0])
            .setScale([3, 3, 3]));
        this.shapes.push(new ObjModel3D(this.gl, this.program, suzzaneObjRaw)
            .setOrigin([-2, 2, -2])
            .setRotationSpeed([1, 1, 1]));
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
        mat4.rotateY(this.worldMatrix, this.worldMatrix, 0);
        this.camera.getViewMatrix(this.viewMatrix);
        mat4.perspective(this.projectionMatrix, glMatrix.toRadian(45), this.canvas.width / this.canvas.height, 0.1, 1000.0);

        this.gl.uniformMatrix4fv(this.mWorldUniformLoc, false, this.worldMatrix);
        this.gl.uniformMatrix4fv(this.mViewUniformLoc, false, this.viewMatrix);
        this.gl.uniformMatrix4fv(this.mProjectionUniformLoc, false, this.projectionMatrix);

        this.gl.clearColor(0.08, 0.08, 0.12, 1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.program);

        this.shapes.forEach((shape) => {

            this.gl.uniformMatrix4fv(this.mWorldUniformLoc, false, shape.getModelMatrix());

            shape.updateRotation(dt);
            shape.draw();
        });
    }
}

const renderer = new Renderer();
const pressedKeys = new Set<string>();

let lastTime: number = 0;

const player = new playerController(0.5);
function mainLoop(currentTime: number) {

    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    const verticalDelta = player.getVerticalDelta(dt, renderer.camera.position[1]);
    moveInput.up = verticalDelta / (renderer.camera.moveSpeed * dt); // undo the moveSpeed*dt scaling Camera.update applies

    renderer.camera.update(dt, moveInput);
    renderer.render(dt);

    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);

const moveInput = { forward: 0, right: 0, up: 0 };

function updateMoveInput() {

    moveInput.forward = (pressedKeys.has('KeyW') ? 1 : 0) - (pressedKeys.has('KeyS') ? 1 : 0);
    moveInput.right = (pressedKeys.has('KeyD') ? 1 : 0) - (pressedKeys.has('KeyA') ? 1 : 0);
    // moveInput.up = (pressedKeys.has('Space') ? 1 : 0) - (pressedKeys.has('ShiftLeft') ? 1 : 0);
}

document.addEventListener('keydown', (e) => {

    pressedKeys.add(e.code);
    updateMoveInput();

    if (e.code === 'Space') {
        player.jump(renderer.camera.position[1]);
    }
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

    const maxDelta = 50;

    const dx = Math.max(-maxDelta, Math.min(maxDelta, e.movementX));
    const dy = Math.max(-maxDelta, Math.min(maxDelta, e.movementY));

    const sensitivity = 0.1;
    renderer.camera.look(dx * sensitivity, dy * sensitivity);
});
function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer.gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
