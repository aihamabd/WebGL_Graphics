import { Shape3D, type Shape3DOptions } from './shape3D';
export class ObjModel3D extends Shape3D {

    constructor(
        gl: WebGL2RenderingContext,
        program: WebGLProgram,
        objText: string,
        options?: Shape3DOptions
    ) {

        const vertexData = ObjModel3D.buildVertexData(objText);

        super(gl, program, vertexData, options);
    }

    private static buildVertexData(objText: string): number[] {

        const positions: [number, number, number][] = [];
        const uvs: [number, number][] = [];

        const uniqueVertexData: number[] = []; // 8 floats per unique v/vt combo
        const vertexCache = new Map<string, number>();
        const indices: number[] = [];

        for (const line of objText.split('\n')) {

            const parts = line.trim().split(/\s+/);

            if (parts[0] === 'v') {

                positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);

            } else if (parts[0] === 'vt') {

                uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);

            } else if (parts[0] === 'f') {

                for (let i = 1; i <= 3; i++) {

                    const [vStr, vtStr] = parts[i].split('/');
                    const key = `${vStr}/${vtStr}`;

                    let combinedIndex = vertexCache.get(key);

                    if (combinedIndex === undefined) {

                        const [x, y, z] = positions[parseInt(vStr) - 1];
                        const [u, v] = uvs[parseInt(vtStr) - 1];

                        uniqueVertexData.push(x, y, z, x, y, z, u, v); // white, real UV

                        combinedIndex = uniqueVertexData.length / 8 - 1;
                        vertexCache.set(key, combinedIndex);
                    }

                    indices.push(combinedIndex);
                }
            }
        }

        // De-index: flatten into a flat drawArrays-style list, matching Cube3D/Pyramid3D
        const flatVertexData: number[] = [];

        for (const idx of indices) {

            const offset = idx * 8;
            for (let i = 0; i < 8; i++) {

                flatVertexData.push(uniqueVertexData[offset + i]);
            }
        }

        return flatVertexData;
    }
}