import type { AttributeBuffer } from "../attributes/instance_attributes";
import type { Geometry } from "../geometry/geometry";
import type { LinkedShaderProgram } from "../shader_program/linked_program";

export class Renderable {
    readonly geometry: Geometry;
    readonly program: LinkedShaderProgram;
    readonly attributes: Map<string, AttributeBuffer>;
    readonly vao: WebGLVertexArrayObject;

    constructor(gl: WebGL2RenderingContext, geometry: Geometry, program: LinkedShaderProgram) {
        this.geometry = geometry;
        this.program = program;
        this.attributes = new Map();
        this.vao = gl.createVertexArray();

        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbo);

        for (const [_, attr] of program.getAttributes()) {
            if (attr.divisor !== 0) continue;
            for (const loc of attr.locations) {
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(
                    loc,
                    attr.size,
                    attr.type,
                    attr.normalized,
                    attr.stride,
                    attr.offset
                );
                gl.vertexAttribDivisor(loc, 0);
            }
        }

        for (const [name, attr] of program.getAttributes()) {
            if (attr.divisor === 0) continue;

            const buffer = this.attributes.get(name);
            if (!buffer) continue;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);

            for (const loc of attr.locations) {
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(
                    loc,
                    attr.size,
                    attr.type,
                    attr.normalized,
                    attr.stride,
                    attr.offset
                );
                gl.vertexAttribDivisor(loc, attr.divisor);
            }
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.ibo);

        gl.bindVertexArray(null);
    }


    addAttribute(buffer: AttributeBuffer) {
        this.attributes.set(buffer.attributeName, buffer);
    }

    public draw(gl: WebGL2RenderingContext, instanceCount = 1) {
        gl.useProgram(this.program.program);
        gl.bindVertexArray(this.vao);

        gl.drawElementsInstanced(
            this.geometry.primitiveType,
            this.geometry.indexCount,
            gl.UNSIGNED_SHORT,
            0,
            instanceCount
        );

        gl.bindVertexArray(null);
    }
}