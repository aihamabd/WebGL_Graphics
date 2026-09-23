import { Shape3D, type Shape3DOptions } from './shape3D';

export class Sphere3D extends Shape3D {

    constructor(
        radius: number = 1,
        latBands?: number,
        longBands?: number,
        color?: [number, number, number],
        options?: Shape3DOptions
    ) {

        const vertexData = Sphere3D.buildVertexData(radius, latBands, longBands, color);

        super(vertexData, options);
    }

    private static buildVertexData(
        radius: number,
        latBands?: number,
        longBands?: number,
        color?: [number, number, number]
    ): number[] {

        // Build a grid of unique vertices first (position + UV), then de-index into triangles
        const positions: [number, number, number][] = [];
        const uvs: [number, number][] = [];

        latBands = latBands ?? Math.max(8, Math.round(radius * 24));
        longBands = longBands ?? Math.max(8, Math.round(radius * 24));

        for (let lat = 0; lat <= latBands; lat++) {

            const theta = (lat * Math.PI) / latBands;

            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= longBands; lon++) {

                const phi = (lon * 2 * Math.PI) / longBands;

                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                positions.push([x * radius, y * radius, z * radius]);

                const u = lon / longBands;
                const v = lat / latBands;

                uvs.push([u, v]);
            }
        }

        const vertexData: number[] = [];

        for (let lat = 0; lat < latBands; lat++) {

            for (let lon = 0; lon < longBands; lon++) {

                const first = lat * (longBands + 1) + lon;
                const second = first + longBands + 1;

                const quadIndices = [first, first + 1, second, first + 1, second + 1, second];

                for (const idx of quadIndices) {

                    const [x, y, z] = positions[idx];
                    const [u, v] = uvs[idx];

                    const vertexColor: [number, number, number] = color ?? [
                        (x / radius) * 0.5 + 0.5,
                        (y / radius) * 0.5 + 0.5,
                        (z / radius) * 0.5 + 0.5,
                    ];

                    vertexData.push(x, y, z, ...vertexColor, u, v);
                }
            }
        }

        return vertexData;
    }
}