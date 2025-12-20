/*  ////////////////////////
        Shared types
*/  ////////////////////////

export type VecOrMat234fi = `${'f' | 'i' | ''}${'vec' | 'mat'}${2 | 3 | 4}`;

export type UniformEntryType =
        | 'float'
        | 'int'
        | VecOrMat234fi;


export type RuntimeAttribute = {
        locations: number[]
        size: number
        type: GLenum
        normalized: boolean
        stride: number
        offset: number
        divisor: number
}

export type RuntimeUniform = {
        location: WebGLUniformLocation
        type: UniformEntryType
};