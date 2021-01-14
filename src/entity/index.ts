// Entity
import CoordTransform from "../util/coordTrans";
import {Point} from "../util/interface";
export type {Point};
export default abstract class Entity {
    public color: string;
    public constructor(color="black") {
        this.color = color;
    }

    // draw shape
    public abstract draw(ctx: CanvasRenderingContext2D, ctf: CoordTransform): void
}

export class Line extends Entity {
    public point1: Point;
    public point2: Point;
    public constructor(point1: Point, point2: Point, color?: string) {
        super(color);
        this.point1 = point1;
        this.point2 = point2;
    }
    public draw = (ctx: CanvasRenderingContext2D, ctf: CoordTransform) => {
        // convert
        const p1 = ctf.worldToDevice_Point(this.point1);
        const p2 = ctf.worldToDevice_Point(this.point2);

        // paint
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(p1.X, p1.Y);
        ctx.lineTo(p2.X, p2.Y);
        ctx.stroke();
        ctx.closePath();
    };
}

export class Circle extends Entity {
    public origin: Point;
    public radius: number;
    public constructor(origin: Point, radius: number, color?: string) {
        super(color);
        this.origin = origin;
        this.radius = radius;
    }
    public draw = (ctx: CanvasRenderingContext2D, ctf: CoordTransform) => {
        // convert: Point and length
        const o = ctf.worldToDevice_Point(this.origin);
        const r = ctf.worldToDevice_Len * this.radius;
        // paint
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(o.X, o.Y, r, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.closePath();
    };
}
