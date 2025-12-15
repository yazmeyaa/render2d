import { QuadGeometry } from "./quad";

export type Geometry = {
    readonly vbo: WebGLBuffer;
    readonly ibo: WebGLBuffer;
    readonly vao: WebGLVertexArrayObject;
    readonly indexCount: number;
    readonly primitiveType: number;
}



export class GeometryManager {
    #quad?: Geometry;
    readonly #gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.#gl = gl;
    }

    getQuad(): Geometry {
        if (!this.#quad) {
            this.#quad = new QuadGeometry(this.#gl);
        }
        return this.#quad;
    }
}