#version 300 es
precision highp float;

uniform vec2 something;
in vec2 a_position;
layout(location = 0) in vec2 a_offset;
out vec2 f_a_position;
out vec2 f_a_offset;

void main() {
    gl_Position = vec4(0,0,0,0);

    f_a_position = a_position;
f_a_offset = a_offset;
}