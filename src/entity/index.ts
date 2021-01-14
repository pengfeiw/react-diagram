// Entity
import CoordTransform from "../util/coordTrans";
import {Point, Rectangle} from "../util/interface";
export type {Point, Rectangle};

export default abstract class Entity {
    public color: string;
    public constructor(color="black") {
        this.color = color;
    }

    // draw shape
    public abstract draw(ctx: CanvasRenderingContext2D, ctf: CoordTransform): void
    public abstract bound(): Rectangle;
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

    public bound = () => {
        const min_x = Math.min(this.point1.X, this.point2.X);
        const max_x = Math.max(this.point1.X, this.point2.X);
        const min_y = Math.min(this.point1.Y, this.point2.Y);
        const max_y = Math.max(this.point1.Y, this.point2.Y);
        return new Rectangle({X: max_x, Y: max_y}, {X: min_x, Y: min_y});
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

    public bound = () => {
        const maxPoint = {
            X: this.origin.X + this.radius,
            Y: this.origin.Y + this.radius
        };
        const minPoint = {
            X: this.origin.X - this.radius,
            Y: this.origin.Y - this.radius
        };
        
        return new Rectangle(maxPoint, minPoint);
    }
}
