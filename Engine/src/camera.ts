import { glMatrix, mat4, vec3 } from 'gl-matrix';

export class Camera {

    public position: vec3;
    public yaw: number;
    public pitch: number;
    public moveSpeed: number;

    constructor(
        position: vec3 = vec3.fromValues(0.0, 0.0, 5.0),
        yaw: number = -90,
        pitch: number = 0,
        moveSpeed: number = 3.0
    ) {

        this.position = position;
        this.yaw = yaw;
        this.pitch = pitch;
        this.moveSpeed = moveSpeed;
    }

    // full basis, including pitch — used for the view/look direction
    public getBasisVectors(): { forward: vec3, right: vec3, up: vec3 } {

        const yawRad = glMatrix.toRadian(this.yaw);
        const pitchRad = glMatrix.toRadian(this.pitch);

        const forward = vec3.fromValues(
            Math.cos(yawRad) * Math.cos(pitchRad),
            Math.sin(pitchRad),
            Math.sin(yawRad) * Math.cos(pitchRad)
        );
        vec3.normalize(forward, forward);

        const worldUp = vec3.fromValues(0, 1, 0);

        const right = vec3.create();
        vec3.cross(right, forward, worldUp);
        vec3.normalize(right, right);

        const up = vec3.create();
        vec3.cross(up, right, forward);
        vec3.normalize(up, up);

        return { forward, right, up };
    }

    // flattened basis (pitch ignored) — used for WASD movement, keeps it level
    private getMovementBasisVectors(): { forward: vec3, right: vec3 } {

        const yawRad = glMatrix.toRadian(this.yaw);

        const forward = vec3.fromValues(
            Math.cos(yawRad),
            0,
            Math.sin(yawRad)
        );
        vec3.normalize(forward, forward);

        const worldUp = vec3.fromValues(0, 1, 0);

        const right = vec3.create();
        vec3.cross(right, forward, worldUp);
        vec3.normalize(right, right);

        return { forward, right };
    }

    public update(dt: number, input: { forward: number, right: number, up: number }) {

        const { forward, right } = this.getMovementBasisVectors();
        const worldUp = vec3.fromValues(0, 1, 0);

        const move = vec3.create();
        vec3.scaleAndAdd(move, move, forward, input.forward * this.moveSpeed * dt);
        vec3.scaleAndAdd(move, move, right, input.right * this.moveSpeed * dt);
        vec3.scaleAndAdd(move, move, worldUp, input.up * this.moveSpeed * dt);

        vec3.add(this.position, this.position, move);

        this.position[1] = Math.max(this.position[1], 0.5);

        const worldHalfExtent = 9.75; // adjust to match your grid/ground size

        this.position[0] = Math.max(-worldHalfExtent, Math.min(worldHalfExtent, this.position[0]));
        this.position[2] = Math.max(-worldHalfExtent, Math.min(worldHalfExtent, this.position[2]));
    }

    public look(deltaYaw: number, deltaPitch: number) {

        this.yaw += deltaYaw;
        this.pitch -= deltaPitch;
        this.pitch = Math.max(-89.9, Math.min(89.9, this.pitch));
    }

    public getViewMatrix(out: mat4): mat4 {

        const { forward } = this.getBasisVectors();
        const target = vec3.create();
        vec3.add(target, this.position, forward);

        mat4.lookAt(out, this.position, target, [0, 1, 0]);
        return out;
    }
}