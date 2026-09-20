export function parseObj(objText: string): { vertexData: number[], indices: number[] } {

    const positions: [number, number, number][] = [];
    const uvs: [number, number][] = [];

    const vertexData: number[] = [];
    const indices: number[] = [];
    const vertexCache = new Map<string, number>(); // "v/vt" key -> combined vertex index

    for (const line of objText.split('\n')) {

        const parts = line.trim().split(/\s+/);

        if (parts[0] === 'v') {

            positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);

        } else if (parts[0] === 'vt') {

            uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);

        } else if (parts[0] === 'f') {

            for (let i = 1; i <= 3; i++) {

                const [vStr, vtStr] = parts[i].split('/'); // ignore normal index

                const key = `${vStr}/${vtStr}`;

                let combinedIndex = vertexCache.get(key);

                if (combinedIndex === undefined) {

                    const [x, y, z] = positions[parseInt(vStr) - 1]; // OBJ is 1-indexed
                    const [u, v] = uvs[parseInt(vtStr) - 1];

                    vertexData.push(x, y, z, x, y, z, u, v); // white color, real UV

                    combinedIndex = vertexData.length / 8 - 1;
                    vertexCache.set(key, combinedIndex);
                }

                indices.push(combinedIndex);
            }
        }
    }

    return { vertexData, indices };
}