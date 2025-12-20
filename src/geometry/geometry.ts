import type { ShaderProgramBuilder } from "../shader_program/shader_builder";

export abstract class Geometry {
    abstract readonly indexCount: number;
    abstract readonly primitiveType: number;
    abstract readonly vbo: WebGLBuffer
    abstract readonly ibo: WebGLBuffer

    public applyAttributesToProgram(p: ShaderProgramBuilder): void {
        p.addAttributes({
            name: 'geometry',
            type: 'vec2',
            normalized: false,
            isInstanceAttribute: false,
            needPassToFragmentShader: false,
        })

        p.addVertexActions<'geometry'>({
            apply: function (ctx): string {
                const { attributes: { geometry }, vertPosVarName } = ctx;
                return `${vertPosVarName} = vec3(${geometry}, ${vertPosVarName}.z);`;
            }
        })
    }

    protected unbindBuffers(gl: WebGL2RenderingContext): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    protected createBuffers(gl: WebGL2RenderingContext, vertexes: Float32Array, indices: Uint16Array): { vbo: WebGLBuffer, ibo: WebGLBuffer } {
        const vbo = gl.createBuffer();
        const ibo = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.unbindBuffers(gl);

        return { vbo, ibo }
    }
}



