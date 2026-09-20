#version 300 es

precision mediump float;

in vec3 fragColor;
in vec2 fragUV;

uniform sampler2D uTexture;
uniform bool uHasTexture;
uniform int uColorMode;

out vec4 outColor;

void main() {

    if (!uHasTexture || uColorMode == 0) {

        outColor = vec4(fragColor, 1.0);
        return;
    }

    vec4 texColor = texture(uTexture, fragUV);

    if (uColorMode == 1) {

        outColor = texColor;
    } else {

        outColor = vec4(texColor.rgb * fragColor, texColor.a);
    }
}