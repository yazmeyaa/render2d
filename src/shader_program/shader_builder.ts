import type { UniformEntryType } from "./types";

type AttributeMeta = {
    size: number;
    stride: number;
    glType: number;
    glslType: string;
};

type AddAttributeEntryType =
    | 'float'
    | 'int'
    | 'vec2'
    | 'vec3'
    | 'vec4'
    | 'mat2'
    | 'mat3'
    | 'mat4';

type AddAttributeEntry = {
    type: AddAttributeEntryType;
    name: string;
    normalized: boolean;
    isInstanceAttribute: boolean;
    needPassToFragmentShader: boolean;
    offset?: number;
};

type Uniform = {
    type: UniformEntryType;
    name: string;
    isVertexUniform: boolean;
    isFragmentUniform: boolean;
};

type AttributeLayout = {
    location: number;
    name: string;
    size: number;
    type: number;
    normalized: boolean;
    stride: number;
    offset: number;
    divisor?: number;

    glslType: string;
    passToFragmentShader: boolean;
    isInstanceAttribute: boolean;
};

type VertexContext<A extends string = string, U extends string = string> = {
    vertPosVarName: string;
    attributes: Record<A, string>;
    uniforms: Record<U, string>;
};

type FragmentContext<A extends string = string, U extends string = string> = {
    colorVar: string;
    attributes: Record<A, string>;
    uniforms: Record<U, string>
};

type VertexAction<A extends string = string, U extends string = string> = {
    apply: (ctx: VertexContext<A, U>) => string;
};

type FragmentAction<A extends string = string, U extends string = string> = {
    apply: (ctx: FragmentContext<A, U>) => string;
};


const F32 = Float32Array.BYTES_PER_ELEMENT;
const U16 = Uint16Array.BYTES_PER_ELEMENT;

const ATTRIBUTE_TYPE_META: Record<AddAttributeEntryType, AttributeMeta> = {
    float: { size: 1, stride: F32, glType: WebGL2RenderingContext.FLOAT, glslType: 'float' },
    int: { size: 1, stride: U16, glType: WebGL2RenderingContext.INT, glslType: 'int' },

    vec2: { size: 2, stride: F32 * 2, glType: WebGL2RenderingContext.FLOAT, glslType: 'vec2' },
    vec3: { size: 3, stride: F32 * 3, glType: WebGL2RenderingContext.FLOAT, glslType: 'vec3' },
    vec4: { size: 4, stride: F32 * 4, glType: WebGL2RenderingContext.FLOAT, glslType: 'vec4' },

    mat2: { size: 2, stride: F32 * 4, glType: WebGL2RenderingContext.FLOAT, glslType: 'mat2' },
    mat3: { size: 3, stride: F32 * 9, glType: WebGL2RenderingContext.FLOAT, glslType: 'mat3' },
    mat4: { size: 4, stride: F32 * 16, glType: WebGL2RenderingContext.FLOAT, glslType: 'mat4' },
};

export class ShaderProgram {
    private attributes: Map<string, AttributeLayout> = new Map();
    private uniforms: Map<string, Uniform> = new Map();

    private vertexActions: VertexAction[] = [];
    private fragmentActions: FragmentAction[] = [];

    private location = 0;

    private static readonly positionVar = 'vert_position';
    private static readonly fragmentColorVar = 'fragColor';

    /*  ////////////////////////
            Public API
    */  ////////////////////////

    public addUniforms(...uniforms: Uniform[]): this {
        for (const u of uniforms) {
            this.uniforms.set(u.name, u);
        }
        return this;
    }

    public addAttributes(...entries: AddAttributeEntry[]): this {
        for (const entry of entries) {
            const meta = ATTRIBUTE_TYPE_META[entry.type];

            const layout: AttributeLayout = {
                location: this.location,
                name: entry.name,
                size: meta.size,
                type: meta.glType,
                stride: meta.stride,
                offset: entry.offset ?? 0,
                normalized: entry.normalized,
                divisor: entry.isInstanceAttribute ? 1 : undefined,

                glslType: meta.glslType,
                passToFragmentShader: entry.needPassToFragmentShader,
                isInstanceAttribute: entry.isInstanceAttribute,
            };

            this.attributes.set(layout.name, layout);

            if (entry.isInstanceAttribute) {
                this.location += meta.size;
            }
        }

        return this;
    }

    public addVertexActions<A extends string = string, U extends string = string>(...actions: VertexAction<A, U>[]): this {
        this.vertexActions.push(...actions);
        return this;
    }

    public addFragmentActions<A extends string = string, U extends string = string>(...actions: FragmentAction<A, U>[]): this {
        this.fragmentActions.push(...actions);
        return this;
    }

    public getAttribute(name: string): AttributeLayout | null {
        return this.attributes.get(name) ?? null;
    }

    public getUniform(name: string): Uniform | null {
        return this.uniforms.get(name) ?? null;
    }

    public build(gl: WebGL2RenderingContext): WebGLProgram {
        const vs = this.createShader(gl, gl.VERTEX_SHADER, this.buildVertexSource());
        const fs = this.createShader(gl, gl.FRAGMENT_SHADER, this.buildFragmentSource());
        return this.createProgram(gl, vs, fs);
    }

    public buildSources(): { vertex: string; fragment: string } {
        return {
            vertex: this.buildVertexSource(),
            fragment: this.buildFragmentSource(),
        };
    }

    /*  ////////////////////////
            Helpers
    */  ////////////////////////

    private buildAttributeMaps(stage: 'vertex' | 'fragment'): Record<string, string> {
        const map: Record<string, string> = {};

        for (const attr of this.attributes.values()) {
            if (stage === 'vertex') {
                map[attr.name] = `a_${attr.name}`;
            } else if (attr.passToFragmentShader) {
                map[attr.name] = attr.name;
            }
        }

        return map;
    }

    private buildUniformMap(stage: 'vertex' | 'fragment'): Record<string, string> {
        const map: Record<string, string> = {};

        for (const u of this.uniforms.values()) {
            if (stage === 'vertex' && u.isVertexUniform) {
                map[u.name] = u.name;
            }
            if (stage === 'fragment' && u.isFragmentUniform) {
                map[u.name] = u.name;
            }
        }

        return map;
    }

    private uniformsToText(stage: 'vertex' | 'fragment'): string {
        return Array.from(this.uniforms.values())
            .filter(u => stage === 'vertex' ? u.isVertexUniform : u.isFragmentUniform)
            .map(u => `uniform ${u.type} ${u.name};`)
            .join('\n');
    }

    private attributesToLayoutText(): string {
        return Array.from(this.attributes.values())
            .map(attr =>
                attr.isInstanceAttribute
                    ? `layout(location = ${attr.location}) in ${attr.glslType} a_${attr.name};`
                    : `in ${attr.glslType} a_${attr.name};`
            )
            .join('\n');
    }

    /*  ////////////////////////
            Build vertex shader
    */  ////////////////////////

    private buildVertexSource(): string {
        const varyingOut: string[] = [];
        const varyingAssign: string[] = [];

        for (const attr of this.attributes.values()) {
            if (attr.passToFragmentShader) {
                varyingOut.push(`out ${attr.glslType} ${attr.name};`);
                varyingAssign.push(`${attr.name} = a_${attr.name};`);
            }
        }

        const ctx: VertexContext = {
            vertPosVarName: ShaderProgram.positionVar,
            attributes: this.buildAttributeMaps('vertex'),
            uniforms: this.buildUniformMap('vertex'),
        };

        const steps = this.vertexActions.map(a => a.apply(ctx));

        return `#version 300 es
precision highp float;

${this.uniformsToText('vertex')}

${this.attributesToLayoutText()}
${varyingOut.join('\n')}

void main() {
    vec3 ${ShaderProgram.positionVar} = vec3(0.0);

    ${steps.join('\n    ')}

    gl_Position = vec4(${ShaderProgram.positionVar}, 1.0);

    ${varyingAssign.join('\n    ')}
}`.trim();
    }

    /*  ////////////////////////
            Build fragment shader
    */  ////////////////////////

    private buildFragmentSource(): string {
        const varyingIn = Array.from(this.attributes.values())
            .filter(a => a.passToFragmentShader)
            .map(a => `in ${a.glslType} ${a.name};`)
            .join('\n');

        const ctx: FragmentContext = {
            colorVar: ShaderProgram.fragmentColorVar,
            attributes: this.buildAttributeMaps('fragment'),
            uniforms: this.buildUniformMap('fragment'),
        };

        const steps = this.fragmentActions.map(a => a.apply(ctx));

        return `#version 300 es
precision mediump float;

${this.uniformsToText('fragment')}

${varyingIn}

out vec4 outColor;

void main() {
    vec4 ${ShaderProgram.fragmentColorVar} = vec4(0.0, 0.0, 0.0, 1.0);

    ${steps.join('\n    ')}

    outColor = ${ShaderProgram.fragmentColorVar};
}`.trim();
    }

    /*  ////////////////////////
            GL Compile
    */  ////////////////////////

    private createShader(
        gl: WebGL2RenderingContext,
        type: number,
        source: string
    ): WebGLShader {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compile error');
        }

        return shader;
    }

    private createProgram(
        gl: WebGL2RenderingContext,
        vs: WebGLShader,
        fs: WebGLShader
    ): WebGLProgram {
        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program) ?? 'Program link error');
        }

        return program;
    }

}
