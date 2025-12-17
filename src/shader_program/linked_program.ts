import type { UniformEntryType } from "./types";

export type RuntimeAttribute = {
    location: number

    size: number
    type: GLenum
    normalized: boolean
    stride: number
    offset: number

    divisor: number
};

export type RuntimeUniform = {
    location: WebGLUniformLocation
    type: UniformEntryType
};

export class LinkedShaderProgram {
    public readonly program: WebGLProgram;
    private readonly attributes: Map<string, RuntimeAttribute>;
    private readonly uniforms: Map<string, RuntimeUniform>;

    constructor(
        program: WebGLProgram,
        attributes: Map<string, RuntimeAttribute>,
        uniforms: Map<string, RuntimeUniform>,
    ) {
        this.program = program;
        this.attributes = attributes;
        this.uniforms = uniforms;
    }

    public use(gl: WebGL2RenderingContext): void {
        gl.useProgram(this.program)
    }

    public getAttribute(name: string): RuntimeAttribute {
        const a = this.attributes.get(name)
        if (!a) throw new Error(`Attribute '${name}' not found`)
        return a
    }

    public getUniform(name: string): RuntimeUniform {
        const u = this.uniforms.get(name)
        if (!u) throw new Error(`Uniform '${name}' not found`)
        return u
    }
}