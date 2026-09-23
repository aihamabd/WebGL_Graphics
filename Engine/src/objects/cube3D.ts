
import { Shape3D, type Shape3DOptions } from './shape3D';
export class Cube3D extends Shape3D {

    private static readonly FACE_CORNERS: number[][] = [

        [0, 1, 2, 3],
        [5, 4, 7, 6],
        [4, 0, 3, 7],
        [1, 5, 6, 2],
        [4, 5, 1, 0],
        [3, 2, 6, 7],
    ];

    private static readonly DEFAULT_COLORS: [number, number, number][] = [

        [0, 0, 1], // front
        [0, 0, 1], // back
        [1, 0, 0], // left
        [1, 0, 0], // right
        [0, 1, 0], // top
        [0, 1, 0], // bottom
    ];

    private static readonly QUAD_UV: [number, number][] = [
        [0, 1], [1, 1], [1, 0], [0, 0],
    ];
    constructor(
        width: number = 1,
        height: number = 1,
        depth: number = 1,
        faceColors: [number, number, number][] = Cube3D.DEFAULT_COLORS,
        options?: Shape3DOptions
    ) {

        if (faceColors.length !== 6) throw new Error('Cube3D requires exactly 6 face colors');

        const vertexData = Cube3D.buildVertexData(width, height, depth, faceColors);

        super(vertexData, options);
    }

    private static buildVertexData(
        width: number,
        height: number,
        depth: number,
        faceColors: [number, number, number][]
    ): number[] {

        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;

        const positions: [number, number, number][] = [

            [-hw, +hh, -hd],
            [+hw, +hh, -hd],
            [+hw, -hh, -hd],
            [-hw, -hh, -hd],
            [-hw, +hh, +hd],
            [+hw, +hh, +hd],
            [+hw, -hh, +hd],
            [-hw, -hh, +hd],
        ];

        const vertexData: number[] = [];

        for (let f = 0; f < Cube3D.FACE_CORNERS.length; f++) {

            const face = Cube3D.FACE_CORNERS[f];
            const triLocalIndices = [0, 1, 2, 0, 2, 3];

            const [r, g, b] = faceColors[f];

            for (const localIndex of triLocalIndices) {

                const cornerIndex = face[localIndex];
                const [x, y, z] = positions[cornerIndex];

                const [u, v] = Cube3D.QUAD_UV[localIndex];

                vertexData.push(x, y, z, r, g, b, u, v);
            }
        }

        return vertexData;
    }
}