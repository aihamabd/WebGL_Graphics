import type { Shape3D } from "./objects/shape3D";

export class Scene {

    public shapes: Shape3D[];
    constructor() {

        this.shapes = [];
    }

    public addShape(shape: Shape3D) {
        this.shapes.push(shape);
    }
}