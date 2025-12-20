import type { ShaderProgramBuilder } from "../shader_program/shader_builder";

export class ScaleInstanceData {
    readonly data = new Float32Array(9);

    set(x: number, y: number) {
        this.data.set([
            x, 0, 0,
            0, y, 0,
            0, 0, 1,
        ]);
    }
}


export class InstanceAttributeBuffer {
    readonly buffer: WebGLBuffer;
    readonly data: Float32Array;
    readonly attributeName: string;

    constructor(
        gl: WebGL2RenderingContext,
        attributeName: string,
        data: Float32Array,
        usage = gl.DYNAMIC_DRAW
    ) {
        this.attributeName = attributeName;
        this.buffer = gl.createBuffer();
        this.data = data;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    update(gl: WebGL2RenderingContext) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}


export class ScaleTransformer {
    static readonly attributeName = 'scale_matrix';

    applyToShaderProgram(p: ShaderProgramBuilder): void {
        p.addAttributes({
            name: ScaleTransformer.attributeName,
            type: 'mat3',
            normalized: false,
            isInstanceAttribute: true,
            needPassToFragmentShader: false,
        });

        p.addVertexActions<'scale_matrix'>({
            apply({ vertPosVarName, attributes }) {
                return `${vertPosVarName} *= ${attributes.scale_matrix};`;
            },
        });
    }
}
