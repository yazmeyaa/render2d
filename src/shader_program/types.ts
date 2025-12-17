/*  ////////////////////////
        Shared types
*/  ////////////////////////

export type VecOrMat234fi = `${'vec' | 'mat'}${2 | 3 | 4}${'f' | 'i' | ''}`;

export type UniformEntryType =
    | 'float'
    | 'int'
    | VecOrMat234fi;


