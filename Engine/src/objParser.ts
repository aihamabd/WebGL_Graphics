// objParser.ts
export interface ParsedObjFace {
    indices: [string, string][]; // [vertexIndex, uvIndex] per corner, 1-indexed strings
}

export interface ParsedObj {
    positions: [number, number, number][];
    uvs: [number, number][];
    facesByMaterial: Map<string, ParsedObjFace[]>; // grouped, not flat
}

export function parseObj(objText: string): ParsedObj {

    const positions: [number, number, number][] = [];
    const uvs: [number, number][] = [];
    const facesByMaterial = new Map<string, ParsedObjFace[]>();

    let currentMaterial = 'default';

    for (const line of objText.split('\n')) {

        const parts = line.trim().split(/\s+/);

        if (parts[0] === 'v') {

            positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);

        } else if (parts[0] === 'vt') {

            uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);

        } else if (parts[0] === 'usemtl') {

            currentMaterial = parts[1];

        } else if (parts[0] === 'f') {

            const indices: [string, string][] = [];

            for (let i = 1; i <= 3; i++) {

                const [vStr, vtStr] = parts[i].split('/');
                indices.push([vStr, vtStr]);
            }

            if (!facesByMaterial.has(currentMaterial)) {
                facesByMaterial.set(currentMaterial, []);
            }

            facesByMaterial.get(currentMaterial)!.push({ indices });
        }
    }

    return { positions, uvs, facesByMaterial };
}

export function getVertexData(
    parsed: ParsedObj,
    faces: ParsedObjFace[]
): number[] {

    const vertexData: number[] = [];

    for (const face of faces) {

        for (const [vStr, vtStr] of face.indices) {

            const [x, y, z] = parsed.positions[parseInt(vStr) - 1];
            const [u, v] = vtStr ? parsed.uvs[parseInt(vtStr) - 1] : [0, 0];

            vertexData.push(x, y, z, 1, 1, 1, u, v);
        }
    }

    return vertexData;
}