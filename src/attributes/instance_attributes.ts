export class AttributeBuffer{
    readonly buffer: WebGLBuffer;
    readonly data: AllowSharedBufferSource;
    readonly attributeName: string;

    constructor(
        gl: WebGL2RenderingContext,
        attributeName: string,
        data: AllowSharedBufferSource,
        usage = gl.DYNAMIC_DRAW
    ) {
        this.attributeName = attributeName;
        this.buffer = gl.createBuffer();
        this.data = data;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    update(gl: WebGL2RenderingContext) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
