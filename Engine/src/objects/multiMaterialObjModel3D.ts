// objects/multiMaterialObjModel.ts
import { ObjModel3D } from './objModel3D';
import { parseObj, getVertexData } from '../objParser';

export class MultiMaterialObjModel {

    public parts: ObjModel3D[] = [];

    constructor(objText: string, materialTextures: Record<string, string | undefined>) {

        const parsed = parseObj(objText);

        for (const [materialName, faces] of parsed.facesByMaterial) {

            const vertexData = getVertexData(parsed, faces);

            this.parts.push(new ObjModel3D(vertexData, {
                textureUrl: materialTextures[materialName],
            }));
        }
    }

    public setOrigin(origin: [number, number, number]): this {
        this.parts.forEach(p => p.setOrigin(origin));
        return this;
    }

    public setRotationSpeed(speed: [number, number, number]): this {
        this.parts.forEach(p => p.setRotationSpeed(speed));
        return this;
    }

    public setScale(scale: [number, number, number]): this {
        this.parts.forEach(p => p.setScale(scale));
        return this;
    }
}