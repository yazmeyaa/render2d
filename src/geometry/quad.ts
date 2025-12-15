import { ATTRIBUTES_LAYOUT } from "../attributes";
import type { Geometry } from "./geometry";

export class QuadGeometry implements Geometry {
    public readonly vbo: WebGLBuffer;
    public readonly ibo: WebGLBuffer;
    public readonly vao: WebGLVertexArrayObject;
    readonly indexCount: number;
    readonly primitiveType: number;

    constructor(gl: WebGL2RenderingContext) {
        this.vbo = gl.createBuffer();
        this.ibo = gl.createBuffer();
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        for (const attr of ATTRIBUTES_LAYOUT) {
            gl.enableVertexAttribArray(attr.location);
            gl.vertexAttribPointer(
                attr.location,
                attr.size,
                attr.type,
                attr.normalized,
                attr.stride,
                attr.offset
            );
            if (attr.divisor !== undefined) {
                gl.vertexAttribDivisor(attr.location, attr.divisor);
            }
        }

        const vertexes = new Float32Array([
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
            1.0, -1.0,
        ]);

        const indices = new Uint16Array([0, 1, 2, 0, 2, 3])
        this.indexCount = indices.length;
        this.primitiveType = gl.TRIANGLES;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
