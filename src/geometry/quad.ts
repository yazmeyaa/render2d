import { Geometry } from "./geometry";

export class QuadGeometry extends Geometry {
    readonly vbo: WebGLBuffer
    readonly ibo: WebGLBuffer
    readonly indexCount = 6
    readonly primitiveType = WebGL2RenderingContext['TRIANGLES']

    constructor(gl: WebGL2RenderingContext) {
        super();
        const vertexes = new Float32Array([
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
            1.0, -1.0,
        ])
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);


        const { ibo, vbo } = this.createBuffers(gl, vertexes, indices);

        this.vbo = vbo
        this.ibo = ibo
    }
}
