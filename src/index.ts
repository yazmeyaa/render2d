import { GeometryManager } from './geometry/geometry_manager';
import { Renderable } from './renderer/renderable';
import { ShaderProgramBuilder } from './shader_program/shader_builder';

const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const geoManager = new GeometryManager(gl);
const q = geoManager.getGeometry('triangle')
const p = new ShaderProgramBuilder();
q.applyAttributesToProgram(p);

p.addAttributes(
    {
        type: 'mat3',
        name: 'scale_matrix',
        normalized: false,
        isInstanceAttribute: true,
        needPassToFragmentShader: true,
    }
)

type ProgramEnvironment = { attributes: 'translation_matrix' | 'rotation_matrix' | 'scale_matrix', uniforms: 'sun_position' };

p.addVertexActions<ProgramEnvironment['attributes'], ProgramEnvironment['uniforms']>(
    {
        apply({ vertPosVarName }) {
            return `mat3 scale = mat3(0.5, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 1.0);${vertPosVarName} *= scale;`
        },
    }
)

// p.addFragmentActions<ProgramEnvironment['attributes'], ProgramEnvironment['uniforms']>(
//     {
//         apply({ colorVar }) {
//             // Add solid red material
//             return `${colorVar} = vec4(1.0, 0.0, 0.0, 1.0);`
//         },
//     },
//     {
//         apply({ uniforms, colorVar }) {
//             const { sun_position } = uniforms;
//             return `${colorVar}.x *= float(${sun_position}.x) * 0.0;`;
//         },
//     }
// )

p.addFragmentActions(
    {
        apply: function (ctx: { colorVar: string; attributes: Record<string, string>; uniforms: Record<string, string>; }): string {
            const { colorVar } = ctx;
            return `${colorVar} = vec4(1.0, 0.0, 0.0, ${colorVar});`
        }
    }
)

const { fragment, vertex } = p.buildSources();
console.log(fragment);
console.log(vertex);
const glProgram = p.build(gl);
glProgram.use(gl);
const renderable = new Renderable(gl, q, glProgram);
renderable.draw(gl);