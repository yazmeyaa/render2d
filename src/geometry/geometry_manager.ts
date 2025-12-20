import type { Geometry } from "./geometry";
import { QuadGeometry } from "./quad";
import { TriangleGeometry } from "./triangle";

type BasicGeometries = "quad" | "triangle"
type GeometryHasMapKeyType = BasicGeometries | (string & {})

export class GeometryManager {
    readonly #geometries = new Map<GeometryHasMapKeyType, Geometry>();
    readonly #gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.#gl = gl;
        this.#geometries.get('asd')
    }


    getGeometry(key: GeometryHasMapKeyType): Geometry {
        switch (key) {
            case 'quad':
                let quad = this.#geometries.get('quad');
                if (!quad) {
                    quad = new QuadGeometry(this.#gl);
                    this.#geometries.set(key, quad)
                }
                return quad;

            case "triangle":
                let tri = this.#geometries.get('triangle');
                if (!tri) {
                    tri = new TriangleGeometry(this.#gl);
                    this.#geometries.set(key, tri);
                }
                return tri;
            default:
                const g = this.#geometries.get(key);
                if (!g) throw new Error(`Requested unknown geometry key ("${key}"). Please, register geometry via "GemoetryManager.registerGeometry()" before retrieving it.`);
                return g;
        }
    }
}