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


export class ScaleTransformer {
    static readonly attributeName = '__internal_base_scale_matrix';

    applyToShaderProgram(p: ShaderProgramBuilder): void {
        p.addAttributes({
            name: ScaleTransformer.attributeName,
            type: 'mat3',
            normalized: false,
            isInstanceAttribute: true,
            needPassToFragmentShader: false,
        });

        p.addVertexActions<typeof ScaleTransformer.attributeName>({
            apply({ vertPosVarName, attributes }) {
                return `${vertPosVarName} *= ${attributes.__internal_base_scale_matrix};`;
            },
        });
    }
}
