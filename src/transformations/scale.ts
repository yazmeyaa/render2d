import type { ShaderProgram } from "../shader_program/shader_builder";

const ScaleMatrixAttributeName = 'scale_matrix' as const;

export class ScaleInstanceBuffer {
    buffer: WebGLBuffer;
    readonly data: Float32Array;

    constructor(buffer: WebGLBuffer) {
        this.data = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ])
        this.buffer = buffer;
    }
}

export class ScaleTransformer {
    private _x: number = 1;
    public get x(): number {
        return this._x;
    }
    public set x(value: number) {
        this._x = value;
    }
    private _y: number = 1;
    public get y(): number {
        return this._y;
    }
    public set y(value: number) {
        this._y = value;
    }

    public applyToShaderProgram(p: ShaderProgram): void {
        p.addAttributes(
            {
                type: 'mat3',
                name: ScaleMatrixAttributeName,
                normalized: false,
                isInstanceAttribute: true,
                needPassToFragmentShader: false,
            }
        )

        p.addVertexActions<typeof ScaleMatrixAttributeName>(
            {
                apply({ vertPosVarName, attributes }) {
                    const { scale_matrix } = attributes
                    return `${vertPosVarName} *= ${scale_matrix}`
                },
            }
        )
    }
}