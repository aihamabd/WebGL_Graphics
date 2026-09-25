
import mobileHomeObjRaw from "../assets/model/mobile_home.obj?raw";

import { Scene } from "../scene";

const materialToFilename: Record<string, string | undefined> = {
    'mat0': 'foliage_baked_baseColor.png',
    'mat1': 'pipes_moving_baked_baseColor.jpg',
    'mat2': 'stones_baseColor.jpg',
    'mat3': 'rock_top_baked_baseColor.jpg',
    'mat4': 'rock_right_baked_baseColor.jpg',
    'mat5': 'rock_middle_baked_baseColor.png',
    'mat6': 'platform_calm_baseColor.png',
    'mat7': 'house_baked_baseColor.jpg',
    'mat8': 'flame_baseColor.png',
    'mat9': 'platform_unstable_baked_baseColor.jpg',
    'mat10': undefined, // no map_Kd — falls back to vertex color / ColorMode.VertexColor
};

import foliageTexture from '../assets/model/foliage_baked_baseColor.png';
import pipesTexture from '../assets/model/pipes_moving_baked_baseColor.jpg';
import stonesTexture from '../assets/model/stones_baseColor.jpg';
import rockTopTexture from '../assets/model/rock_top_baked_baseColor.jpg';
import rockRightTexture from '../assets/model/rock_right_baked_baseColor.jpg';
import rockMiddleTexture from '../assets/model/rock_middle_baked_baseColor.png';
import platformCalmTexture from '../assets/model/platform_calm_baseColor.png';
import houseTexture from '../assets/model/house_baked_baseColor.jpg';
import flameTexture from '../assets/model/flame_baseColor.png';
import platformUnstableTexture from '../assets/model/platform_unstable_baked_baseColor.jpg';
import { MultiMaterialObjModel } from "../objects/multiMaterialObjModel3D";

const filenameToUrl: Record<string, string> = {
    'foliage_baked_baseColor.png': foliageTexture,
    'pipes_moving_baked_baseColor.jpg': pipesTexture,
    'stones_baseColor.jpg': stonesTexture,
    'rock_top_baked_baseColor.jpg': rockTopTexture,
    'rock_right_baked_baseColor.jpg': rockRightTexture,
    'rock_middle_baked_baseColor.png': rockMiddleTexture,
    'platform_calm_baseColor.png': platformCalmTexture,
    'house_baked_baseColor.jpg': houseTexture,
    'flame_baseColor.png': flameTexture,
    'platform_unstable_baked_baseColor.jpg': platformUnstableTexture,
};

const materialTextures: Record<string, string | undefined> = {};
for (const [material, filename] of Object.entries(materialToFilename)) {
    materialTextures[material] = filename ? filenameToUrl[filename] : undefined;
}

export let testScene = new Scene;

const mobileHome = new MultiMaterialObjModel(mobileHomeObjRaw, materialTextures);
mobileHome.setOrigin([-60, 0, 0]);

mobileHome.parts.forEach(part => testScene.addShape(part));