#version 300 es

precision mediump float;

in vec3 vertexPosition;
in vec3 vertexColor;
in vec2 vertexUV;

out vec3 fragColor;
out vec2 fragUV;

uniform mat4 mProjection;
uniform mat4 mView;
uniform mat4 mWorld;

void main() {
	fragColor = vertexColor;
	fragUV = vertexUV;

	gl_Position = mProjection * mView * mWorld * vec4(vertexPosition, 1.0);
}