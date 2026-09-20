
import { Shape3D, type Shape3DOptions } from './shape3D';
export class Pyramid3D extends Shape3D {

    private static readonly FACES: number[][] = [

        [0, 1, 2],
        [0, 2, 3],
        [0, 1, 4],
        [1, 2, 4],
        [2, 3, 4],
        [3, 0, 4],
    ];

    private static readonly DEFAULT_COLORS: [number, number, number][] = [

        [1, 1, 0],  // base
        [1, 1, 0],  // base
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
        [1, 0, 0],
    ];

    private static readonly FACE_UV: [number, number][][] = [
        [[0, 0], [1, 0], [1, 1]], // base tri 1 (corners 0,1,2)
        [[0, 0], [1, 1], [0, 1]], // base tri 2 (corners 0,2,3)
        [[0, 0], [1, 0], [0.5, 1]], // back side (base-left, base-right, apex)
        [[0, 0], [1, 0], [0.5, 1]], // right side
        [[0, 0], [1, 0], [0.5, 1]], // front side
        [[0, 0], [1, 0], [0.5, 1]], // left side
    ];
    constructor(
        gl: WebGL2RenderingContext,
        program: WebGLProgram,
        width: number = 1,
        height: number = 1,
        depth: number = 1,
        faceColors: [number, number, number][] = Pyramid3D.DEFAULT_COLORS,
        options?: Shape3DOptions
    ) {

        if (faceColors.length !== 6) throw new Error('Pyramid3D requires exactly 6 face colors');

        const vertexData = Pyramid3D.buildVertexData(width, height, depth, faceColors);

        super(gl, program, vertexData, options);
    }

    private static buildVertexData(
        baseWidth: number, baseDepth: number, height: number,
        colors: [number, number, number][]
    ): number[] {

        const hw = baseWidth / 2, hd = baseDepth / 2;

        const positions: [number, number, number][] = [
            [-hw, 0, -hd], [+hw, 0, -hd], [+hw, 0, +hd], [-hw, 0, +hd], [0, height, 0],
        ];

        const vertexData: number[] = [];

        for (let f = 0; f < Pyramid3D.FACES.length; f++) {

            const face = Pyramid3D.FACES[f];
            const faceUV = Pyramid3D.FACE_UV[f];
            const [r, g, b] = colors[f];

            for (let i = 0; i < face.length; i++) {

                const cornerIndex = face[i];
                const [x, y, z] = positions[cornerIndex];
                const [u, v] = faceUV[i];

                vertexData.push(x, y, z, r, g, b, u, v);
            }
        }

        return vertexData;
    }
}