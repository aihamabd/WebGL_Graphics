import './style.css';

import { playerController } from './objects/playerController';
import { Renderer } from './renderer';
// import { mainScene } from './scenes/mainScene';
import { testScene } from './scenes/testScene';

const renderer = new Renderer(document.getElementById('glcanvas') as HTMLCanvasElement);
const pressedKeys = new Set<string>();

const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
const player = new playerController(0.5);

const moveInput = { forward: 0, right: 0, up: 0 };

let lastTime: number = 0;

function resizeCanvas() {

    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    renderer.gl.viewport(0, 0, canvas.width, canvas.height);
}

function updateMoveInput() {

    moveInput.forward = (pressedKeys.has('KeyW') ? 1 : 0) - (pressedKeys.has('KeyS') ? 1 : 0);
    moveInput.right = (pressedKeys.has('KeyD') ? 1 : 0) - (pressedKeys.has('KeyA') ? 1 : 0);
    moveInput.up = (pressedKeys.has('Space') ? 1 : 0) - (pressedKeys.has('ShiftLeft') ? 1 : 0);
}

function mainLoop(currentTime: number) {

    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    const upInput = player.isFlightEnabled()
        ? (pressedKeys.has('Space') ? 1 : 0) - (pressedKeys.has('ShiftLeft') ? 1 : 0)
        : 0;

    const verticalDelta = player.getVerticalDelta(dt, renderer.camera.position[1], upInput);
    moveInput.up = verticalDelta / (renderer.camera.moveSpeed * dt);

    renderer.camera.update(dt, moveInput);
    renderer.render(dt);

    requestAnimationFrame(mainLoop);
}

renderer.setScene(testScene);
resizeCanvas();
requestAnimationFrame(mainLoop);

document.addEventListener('keydown', (e) => {

    pressedKeys.add(e.code);
    updateMoveInput();

    if (e.code === 'Space') {
        player.jump(renderer.camera.position[1]);
    }

    if (e.code === 'KeyF') {
        player.toggleFlight();
    }
});

document.addEventListener('keyup', (e) => {

    pressedKeys.delete(e.code);
    updateMoveInput();
});

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

window.addEventListener('resize', resizeCanvas);