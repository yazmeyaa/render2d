type AttributeLayout = {
    location: number;
    size: number;
    type: number;
    normalized: boolean;
    stride: number;
    offset: number;
    divisor?: number;
};

export const ATTRIBUTES_LAYOUT: AttributeLayout[] = [
    /** vec2 a_position vertex attribute */
    {
        location: 0,
        size: 2,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
        stride: 2 * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
    },
    /** mat3 a_translation_matrix */
    {
        location: 1,
        size: 3,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
        stride: 9 * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
        divisor: 1,
    },
    /** mat2 a_rotation_matrix*/
    {
        location: 4,
        size: 2,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
        stride: 4 * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
        divisor: 1,
    },
    /** mat2 a_scale_matrix */
    {
        location: 6,
        size: 2,
        type: WebGL2RenderingContext.FLOAT,
        normalized: false,
        stride: 4 * Float32Array.BYTES_PER_ELEMENT,
        offset: 0,
        divisor: 1,
    },
];
