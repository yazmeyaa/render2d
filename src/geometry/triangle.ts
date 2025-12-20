import { Geometry } from "./geometry";

export class TriangleGeometry extends Geometry {
    readonly indexCount: number = 3;
    readonly primitiveType: number = WebGL2RenderingContext['TRIANGLES'];
    readonly vbo: WebGLBuffer;
    readonly ibo: WebGLBuffer;

    constructor(gl: WebGL2RenderingContext) {
        super();
        const vertexes = new Float32Array([
            -1.0, -1.0,
            0.0, 1.0,
            1.0, -1.0,
        ])
        const indices = new Uint16Array([0, 1, 2]);

        const { ibo, vbo } = this.createBuffers(gl, vertexes, indices);
        this.vbo = vbo;
        this.ibo = ibo;
    }
}
