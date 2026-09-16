export type Mat4 = Float32Array;

export function identity(): Mat4 {

    return new Float32Array([

        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
}

export function multiply(a: Mat4, b: Mat4): Mat4 {

    const out = new Float32Array(16);

    for (let col = 0; col < 4; col++) {

        for (let row = 0; row < 4; row++) {

            let sum = 0;
            for (let i = 0; i < 4; i++) {

                sum += a[i * 4 + row] * b[col * 4 + i];
            }
            out[col * 4 + row] = sum;
        }
    }

    return out;
}
export function rotateY(angle: number): Mat4 {

    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return new Float32Array([

        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ]);
}

export function translate(x: number, y: number, z: number): Mat4 {

    return new Float32Array([

        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
    ]);
}

export function perspective(fovYRadians: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1.0 / Math.tan(fovYRadians / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0,
    ]);
}

function subtract(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function dot(a: [number, number, number], b: [number, number, number]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function normalize(v: [number, number, number]): [number, number, number] {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

export function lookAt(
    eye: [number, number, number],
    target: [number, number, number],
    up: [number, number, number]
): Mat4 {
    const zAxis = normalize(subtract(eye, target));
    const xAxis = normalize(cross(up, zAxis));
    const yAxis = cross(zAxis, xAxis);

    return new Float32Array([
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
    ]);
}