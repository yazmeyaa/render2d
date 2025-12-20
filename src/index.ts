import { GeometryManager } from './geometry/geometry_manager';
import { ShaderProgramBuilder } from './shader_program/shader_builder';
import type { RuntimeAttribute } from './shader_program/types';

const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const geoManager = new GeometryManager(gl);
const q = geoManager.getGeometry('quad')
const p = new ShaderProgramBuilder();
q.applyAttributesToProgram(p);


p.addAttributes(
    {
        type: 'mat3',
        name: 'translation_matrix',
        normalized: false,
        isInstanceAttribute: true,
        needPassToFragmentShader: true
    },
    {
        type: 'mat3',
        name: 'rotation_matrix',
        normalized: false,
        isInstanceAttribute: true,
        needPassToFragmentShader: true,
    },
    {
        type: 'mat3',
        name: 'scale_matrix',
        normalized: false,
        isInstanceAttribute: true,
        needPassToFragmentShader: true,
    }
)

p.addUniforms({
    type: 'ivec3',
    name: 'sun_position',
    isVertexUniform: true,
    isFragmentUniform: true
})

type ProgramEnvironment = { attributes: 'translation_matrix' | 'rotation_matrix' | 'scale_matrix', uniforms: 'sun_position' };

p.addVertexActions<ProgramEnvironment['attributes'], ProgramEnvironment['uniforms']>(
    {
        apply({ vertPosVarName, attributes }) {
            const { rotation_matrix, scale_matrix, translation_matrix } = attributes;
            return `${vertPosVarName} *= ${translation_matrix} * ${rotation_matrix} * ${scale_matrix};`
        },
    }
)

p.addFragmentActions<ProgramEnvironment['attributes'], ProgramEnvironment['uniforms']>(
    {
        apply({ colorVar }) {
            // Add solid red material
            return `${colorVar} = vec4(1.0, 0.0, 0.0, 1.0);`
        },
    },
    {
        apply({ uniforms, colorVar }) {
            const { sun_position } = uniforms;
            return `${colorVar}.x *= float(${sun_position}.x) * 0.0;`;
        },
    }
)

const { fragment, vertex } = p.buildSources();
const container = document.getElementById('debugCodes')!

for (const source of [vertex, fragment]) {
    const codeContainer = document.createElement('div');
    codeContainer.style.cssText = 'background-color: black; color: #00ff00; font-size: 1.25rem; margin: 1rem 0px; padding: 1rem 1rem; width: 600px; word-break: break-all; line-height: 1.5;';
    const code = document.createElement('code');
    codeContainer.appendChild(code);
    code.style.cssText = 'white-space: pre-wrap; word-break: break-word';
    code.innerText = source;
    container.appendChild(codeContainer);
}

const glProgram = p.build(gl);
glProgram.use(gl);

const keys = new Map<RuntimeAttribute, string>();
const properties = new Set<string>();
const attributes: RuntimeAttribute[] = [];
for (const [name, attr] of glProgram.getAttributes()) {
    for (const key in attr) {
        properties.add(key);
    }
    keys.set(attr, name);
    attributes.push(attr);
}

console.table(attributes.map((v) => ({ ...v, 'attribute name': keys.get(v), "locations": v.locations.map((l) => "0x" + l.toString(16)).join(', ') })), ["attribute name", ...properties])

console.log(glProgram)
