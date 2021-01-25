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

const scalePoint = (point: Point, scaleOrigin: Point, scale: number): Point => {
    var moveVector = {X: point.X - scaleOrigin.X, Y: point.Y - scaleOrigin.Y};
    moveVector = {X: scale * moveVector.X, Y: scale * moveVector.Y};

    return {
        X: scaleOrigin.X + moveVector.X,
        Y: scaleOrigin.Y + moveVector.Y
    };
}

export default class CoordTransform {
    private _worldOrigin: Point; // the origin of world coord.
    private _worldToDevice_Len: number; // the ratio of world coord to device coord.
    
    public constructor(worldOrigin: Point = {X: 0, Y: 0}, worldToDevice_Len: number = 1) {
        this._worldOrigin = worldOrigin;
        this._worldToDevice_Len = worldToDevice_Len;
    }

    public get worldToDevice_Len () {
        return this._worldToDevice_Len;
    }

    public get worldOrigin () {
        return this._worldOrigin;
    }
    
    public displacement: Displacement = (point1: Point, point2?: Point) => {
        const moveVector: Vector = point2 ? {X: point2.X - point1.X, Y: point2.Y - point1.Y} : point1;
        this._worldOrigin = movePoint(this._worldOrigin, moveVector);
    };
    
    public zoom = (deviceZoomOrigin: Point, scale: number) => {
        this._worldToDevice_Len = this._worldToDevice_Len * scale;
        let moveVect = {X: this._worldOrigin.X - deviceZoomOrigin.X, Y: this._worldOrigin.Y - deviceZoomOrigin.Y};
        moveVect = {X: moveVect.X * scale, Y: moveVect.Y * scale};
        this._worldOrigin = {X: deviceZoomOrigin.X + moveVect.X, Y: deviceZoomOrigin.Y + moveVect.Y};
    }
    
    // convert world coord to device coord
    public worldToDevice_Point = (point: Point) => {
        let resPnt = movePoint(point, this._worldOrigin);
        resPnt = scalePoint(resPnt, this._worldOrigin, this._worldToDevice_Len);
        return resPnt;
    };
}
