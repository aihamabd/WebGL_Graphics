import { Scene } from "../scene";

import { Cube3D } from "../objects/cube3D";
import { Grid } from "../objects/grid";
import { ObjModel3D } from "../objects/objModel3D";
import { Pyramid3D } from "../objects/pyramid3D";
import { Sphere3D } from "../objects/sphere3D";

import oiCatTexture from '../assets/Muchkin2_baseColor.png';
import marioTexture from '../assets/tripo_material_8ae6e7ff-9af6-41f8-923f-8025ee8e1df4_baseColor.jpg';

import suzzaneObjRaw from '../assets/suzanne.obj?raw';
import catObjRaw from '../assets/oiiaioooooiai_cat.obj?raw';
import spaceShipObjRaw from '../assets/light_fighter_spaceship_-_free_-.obj?raw';
import marioObjRaw from '../assets/mario_mini.obj?raw';

export let mainScene = new Scene();

mainScene.addShape(new Pyramid3D()
    .setOrigin([2, -2, 2])
    .setRotationSpeed([0, 1, 0]));
mainScene.addShape(new Cube3D(20, 0.02, 20, Array(6).fill([0.25, 0.25, 0.27]))
    .setOrigin([0, -0.02, 0]));
mainScene.addShape(new Grid( 20, 10, 0));
mainScene.addShape(new ObjModel3D( catObjRaw, { textureUrl: oiCatTexture })
    .setOrigin([0, 0, 0])
    .setRotationSpeed([0, 2, 0])
    .setScale([3, 3, 3]));
mainScene.shapes.push(new ObjModel3D(suzzaneObjRaw)
    .setOrigin([-2, 2, -2])
    .setRotationSpeed([1, 1, 1]));
mainScene.addShape(new ObjModel3D(spaceShipObjRaw)
    .setOrigin([2, 2, 2])
    .setRotationSpeed([0, 1, 0]));
mainScene.addShape(new ObjModel3D(marioObjRaw, { textureUrl: marioTexture })
    .setOrigin([0, 0.5, 5])
    .setRotationSpeed([0, 2, 0])
    .setScale([1, 1, 1]));
mainScene.addShape(new Sphere3D(0.5, 32, 32).setOrigin([3, 1, 3]));