import {Point, Vector} from "./interface";

interface Displacement {
    (vector: Vector): void;
    (point1: Point, point2: Point): void;
}

const movePoint = (point: Point, vector: Vector) => {
    return {
        X: point.X + vector.X,
        Y: point.Y + vector.Y
    };
};

export default class CoordTransform {
    public _worldOrigin: Point; // the origin of world coord.
    public get worldOrigin () {
        return this._worldOrigin;
    }
    public constructor() {
        this._worldOrigin = {X: 0, Y: 0};
    }

    public displacement: Displacement = (point1: Point, point2?: Point) => {
        const moveVector: Vector = point2 ? {X: point2.X - point1.X, Y: point2.Y - point1.Y} : point1;
    
        this._worldOrigin = movePoint(this._worldOrigin, moveVector);
    };
    
    // convert world coord to device coord
    public worldToDevice = (point: Point) => {
        const resPnt = movePoint(point, this._worldOrigin);
        return resPnt;
    };
}
