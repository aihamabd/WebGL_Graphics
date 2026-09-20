import { Shape3D } from './shape3D';

export class Grid extends Shape3D {

    constructor(
        gl: WebGL2RenderingContext,
        program: WebGLProgram,
        size: number = 50,
        divisions: number = 50,
        y: number = 0,
        color: [number, number, number] = [0.15, 0.15, 0.15]
    ) {

        const vertexData = Grid.buildVertexData(size, divisions, y, color);

        super(gl, program, vertexData, { drawMode: gl.LINES });
    }

    private static buildVertexData(
        size: number,
        divisions: number,
        y: number,
        color: [number, number, number]
    ): number[] {

        const [r, g, b] = color;
        const half = size / 2;
        const step = size / divisions;

        const vertexData: number[] = [];

        for (let i = 0; i <= divisions; i++) {

            const z = -half + i * step;

            vertexData.push(-half, y, z, r, g, b, 0, 0);
            vertexData.push(half, y, z, r, g, b, 0, 0);
        }

        for (let i = 0; i <= divisions; i++) {

            const x = -half + i * step;

            vertexData.push(x, y, -half, r, g, b, 0, 0);
            vertexData.push(x, y, half, r, g, b, 0, 0);
        }

        return vertexData;
    }
}