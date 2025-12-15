const F32 = Float32Array.BYTES_PER_ELEMENT;
const U16 = Uint16Array.BYTES_PER_ELEMENT;

type AttributeMeta = {
    size: number;
    stride: number;
    glType: number;
    glslType: string;
};

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

type AddAttributeEntryType =
    'float' |
    'int' |
    'vec2' |
    'vec3' |
    'vec4' |
    'mat2' |
    'mat3' |
    'mat4'

type VecOrMat234fi = `${'vec' | 'mat'}${2 | 3 | 4}${'f' | 'i' | ''}`

type UniformEntryType =
    'float' |
    'int' |
    VecOrMat234fi

type AddAttributeEntry = {
    type: AddAttributeEntryType;
    name: string;
    normalized: boolean;
    isInstanceAttribute: boolean;
    needPassToFragmentShader: boolean;
    offset?: number;
    applyToVertex?: (posVarName: string, attributeName: string) => string;
};

type Uniform = {
    type: UniformEntryType;
    name: string;
    isVertexUniform: boolean;
    isFragmentUniform: boolean;
};

export type AttributeLayout = {
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
    applyToVertex?: AddAttributeEntry['applyToVertex'];
};

export class ShaderProgram {
    private attributes: AttributeLayout[] = [];
    private uniforms: Uniform[] = [];
    private location = 0;
    private static readonly positionVariableName = "vert_position";

    private static attributeToFragmentOutCode(attr: AttributeLayout) {
        return `out ${attr.glslType} ${attr.name};`
    }
    private static attributeToLayoutCode(attr: AttributeLayout) {
        if (attr.isInstanceAttribute) {
            return `layout(location = ${attr.location}) in ${attr.glslType} a_${attr.name};`
        } else {
            return `in ${attr.glslType} a_${attr.name};`
        }
    }

    private static uniformToInputText(uniform: Uniform): string {
        return `uniform ${uniform.type} ${uniform.name};`
    }

    private uniformsToText(shaderType: 'vertex' | 'fragment'): string {
        const strings: string[] = [];
        for (const u of this.uniforms) {
            if ((shaderType === 'vertex' && !u.isVertexUniform) || (shaderType === 'fragment' && !u.isFragmentUniform))
                continue;

            strings.push(ShaderProgram.uniformToInputText(u));
        }
        return strings.join('\n')
    }

    private attributesToLayoutText(): string {
        return this.attributes.map((attr) => ShaderProgram.attributeToLayoutCode(attr)).join('\n');
    }

    public addUniforms(...uniforms: Uniform[]): this {
        this.uniforms.push(...uniforms);
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
                applyToVertex: entry.applyToVertex,
            };

            this.attributes.push(layout);

            if (entry.isInstanceAttribute) {
                this.location += meta.size;
            }
        }
        return this;
    }


    private createShader(gl: Readonly<WebGL2RenderingContext>, type: number, source: Readonly<string>): WebGLShader {
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error('Cannot compile shader.');
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile error');
        }
        return shader;
    }

    private createProgram(gl: Readonly<WebGL2RenderingContext>, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program) || 'Program link error');
        }
        return program;
    }

    private buildVertexSource(): string {
        const varyingDeclarations: string[] = [];
        const varyingAssignments: string[] = [];
        const vertexTransforms: string[] = [];

        for (const attr of this.attributes) {
            const attributeVar = `a_${attr.name}`;

            if (attr.applyToVertex) {
                vertexTransforms.push(
                    attr.applyToVertex(
                        ShaderProgram.positionVariableName,
                        attributeVar
                    )
                );
            }

            if (attr.passToFragmentShader) {
                varyingDeclarations.push(
                    ShaderProgram.attributeToFragmentOutCode(attr)
                );

                varyingAssignments.push(
                    `${attr.name} = ${attributeVar};`
                );
            }
        }

        return `#version 300 es
precision highp float;

${this.uniformsToText('vertex')}

${this.attributesToLayoutText()}
${varyingDeclarations.join('\n')}

void main() {
    vec3 ${ShaderProgram.positionVariableName} = vec3(0.0);

    ${vertexTransforms.join('\n    ')}

    gl_Position = vec4(${ShaderProgram.positionVariableName}, 1.0);

    ${varyingAssignments.join('\n    ')}
}
`.trim();
    }

    private buildFragmentSource(): string {
        const varyingDeclarations: string[] = [];

        for (const attr of this.attributes) {
            if (attr.passToFragmentShader) {
                varyingDeclarations.push(
                    `in ${attr.glslType} ${attr.name};`
                );
            }
        }

        const fragmentBody: string[] = [
            'outColor = vec4(0.0, 0.0, 0.0, 1.0);'
        ];

        return `
#version 300 es
precision mediump float;

${this.uniformsToText('fragment')}

${varyingDeclarations.join('\n')}

out vec4 outColor;

void main() {
    ${fragmentBody.join('\n')}
}
`.trim();
    }


    public build(gl: WebGL2RenderingContext): WebGLProgram {
        const vertexSource = this.buildVertexSource();
        const fragmentSource = this.buildFragmentSource();

        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

        const prog = this.createProgram(gl, vertexShader, fragmentShader);
        return prog;
    }

    public buildSources(): { vertex: string, fragment: string } {
        return {
            vertex: this.buildVertexSource(),
            fragment: this.buildFragmentSource(),
        }
    }
}