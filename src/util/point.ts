import Vector from "./vector";
export default class Point {
    public X: number;
    public Y: number;
    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }
    public getVectorTo(point: Point) {
        return new Vector(point.X - this.X, point.Y - this.Y);
    }
}
