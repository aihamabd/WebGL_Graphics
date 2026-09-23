// objects/objModel3D.ts
import { Shape3D, type Shape3DOptions } from './shape3D';
import { parseObj, getVertexData } from '../objParser';

export class ObjModel3D extends Shape3D {

    constructor(objTextOrVertexData: string | number[], options?: Shape3DOptions) {

        const vertexData = Array.isArray(objTextOrVertexData)
            ? objTextOrVertexData
            : ObjModel3D.buildVertexData(objTextOrVertexData, !options?.textureUrl);

        super(vertexData, options);
    }

    private static buildVertexData(objText: string, colorFromPosition: boolean): number[] {

        const parsed = parseObj(objText);

        // Single-material mode: use every face, regardless of which usemtl group it belongs to
        const allFaces = [...parsed.facesByMaterial.values()].flat();
        const vertexData = getVertexData(parsed, allFaces);

        if (colorFromPosition && parsed.positions.length > 0) {

            const min: [number, number, number] = [Infinity, Infinity, Infinity];
            const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

            for (const [x, y, z] of parsed.positions) {

                min[0] = Math.min(min[0], x); max[0] = Math.max(max[0], x);
                min[1] = Math.min(min[1], y); max[1] = Math.max(max[1], y);
                min[2] = Math.min(min[2], z); max[2] = Math.max(max[2], z);
            }

            const range: [number, number, number] = [
                max[0] - min[0] || 1,
                max[1] - min[1] || 1,
                max[2] - min[2] || 1,
            ];

            for (let i = 0; i < vertexData.length; i += 8) {

                vertexData[i + 3] = (vertexData[i] - min[0]) / range[0];
                vertexData[i + 4] = (vertexData[i + 1] - min[1]) / range[1];
                vertexData[i + 5] = (vertexData[i + 2] - min[2]) / range[2];
            }
        }

        return vertexData;
    }
}