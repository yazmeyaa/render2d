import { GeometryManager } from './geometry/geometry';
import { ShaderProgram } from './shaders/shader_builder';

const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const p = new ShaderProgram();
p.addAttributes(
    {
        type: 'vec2',
        name: 'position',
        normalized: false,
        isInstanceAttribute: false,
        needPassToFragmentShader: true
    },
    {
        type: 'mat3',
        name: 'translation_matrix',
        normalized: false,
        isInstanceAttribute: true,
        applyToVertex(posVarName, attr) {
            return `${posVarName} = ${attr} * ${posVarName};`
        },
        needPassToFragmentShader: false
    },
    {
        type: 'mat3',
        name: 'rotation_matrix',
        normalized: false,
        isInstanceAttribute: true,
        needPassToFragmentShader: false,
        applyToVertex(posVarName, attributeName) {
            return `${posVarName} = ${attributeName} * ${posVarName};`
        },
    },
    {
        type: 'mat3',
        name: 'scale_matrix',
        normalized: false,
        isInstanceAttribute: true,
        needPassToFragmentShader: false,
        applyToVertex(posVarName, attributeName) {
            return `${posVarName} = ${attributeName} * ${posVarName};`
        },
    }
).addUniforms(
    {
        type: 'vec2',
        name: 'sun_position',
        isVertexUniform: true,
        isFragmentUniform: true
    },
    {
        type: 'vec3',
        name: 'moon_position',
        isVertexUniform: true,
        isFragmentUniform: false,
    },
    {
        type: 'int',
        name: 'entities_count',
        isVertexUniform: false,
        isFragmentUniform: true,
    }
)

const { fragment, vertex } = p.buildSources();
const container = document.getElementById('debugCodes')!

for(const source of [vertex, fragment]) {
    const codeContainer = document.createElement('div');
    codeContainer.style.cssText = 'background-color: black; color: white; margin: 1rem 0px; padding: 1rem 1rem; width: 600px;';
    const code = document.createElement('code');
    codeContainer.appendChild(code);
    code.style.cssText = 'white-space: pre;';
    code.innerText = source;
    container.appendChild(codeContainer);
}

p.build(gl);

const geoManager = new GeometryManager(gl);
const q = geoManager.getQuad();
console.log(q)