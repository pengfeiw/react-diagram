import Point from "./point";
import Vector from "./vector";

interface Displacement {
    (vector: Vector): void;
    (point1: Point, point2: Point): void;
}

const movePoint = (point: Point, vector: Vector): Point => {
    return new Point(point.X + vector.X, point.Y + vector.Y);
};

const scalePoint = (point: Point, scaleOrigin: Point, scale: number): Point => {
    var moveVector = {X: point.X - scaleOrigin.X, Y: point.Y - scaleOrigin.Y};
    moveVector = {X: scale * moveVector.X, Y: scale * moveVector.Y};
    return new Point(scaleOrigin.X + moveVector.X, scaleOrigin.Y + moveVector.Y);
}

export default class CoordTransform {
    private _worldOrigin: Point; // it's a device point, stand for the origin of world coord.
    private _worldToDevice_Len: number; // the ratio of world coord to device coord.
    
    public constructor(worldOrigin: Point = new Point(0, 0), worldToDevice_Len: number = 1) {
        this._worldOrigin = worldOrigin;
        this._worldToDevice_Len = worldToDevice_Len;
    }

    public get worldToDevice_Len () {
        return this._worldToDevice_Len;
    }

    public get deviceToWorld_Len () {
        return 1 / this._worldToDevice_Len;
    }

    public get worldOrigin () {
        return this._worldOrigin;
    }
    
    public displacement: Displacement = (point1: Point | Vector, point2?: Point) => {
        const moveVector: Vector =  point2 ? new Vector(point2.X - point1.X, point2.Y - point1.Y) : new Vector(point1.X, point1.Y);
        this._worldOrigin = movePoint(this._worldOrigin, moveVector);
    };
    
    public zoom = (deviceZoomOrigin: Point, scale: number) => {
        this._worldToDevice_Len = this._worldToDevice_Len * scale;
        let moveVect = {X: this._worldOrigin.X - deviceZoomOrigin.X, Y: this._worldOrigin.Y - deviceZoomOrigin.Y};
        moveVect = {X: moveVect.X * scale, Y: moveVect.Y * scale};
        this._worldOrigin = new Point(deviceZoomOrigin.X + moveVect.X, deviceZoomOrigin.Y + moveVect.Y);
    }
    
    // convert world coord to device coord
    public worldToDevice_Point = (point: Point) => {
        let resPnt = movePoint(point, this._worldOrigin);
        resPnt = scalePoint(resPnt, this._worldOrigin, this._worldToDevice_Len);
        return resPnt;
    };

    public deviceToWorld_Point = (point: Point) => {
        let resPnt = movePoint(point, new Vector(-this._worldOrigin.X, -this._worldOrigin.Y));
        resPnt = scalePoint(resPnt, new Point(0, 0), 1 / this._worldToDevice_Len);
        return resPnt;
    };
}
