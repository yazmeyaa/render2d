#version 300 es
precision mediump float;

out vec4 outColor;
uniform float elapsedTime;

void main() {
    float r = sin(elapsedTime);
    float g = cos(elapsedTime);
    outColor = vec4(r, g, 0.0f, 1.0f);
}