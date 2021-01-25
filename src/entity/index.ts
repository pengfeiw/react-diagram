// Entity
import CoordTransform from "../util/coordTrans";
import Point from "../util/point";
import Bound from "../util/bound";

export default abstract class Entity {
    /**
     * @member color if the color is 'bylayer', the color is resolved by the layer it belong.
     */
    public color: string;
    public constructor(color="black") {
        this.color = color;
    }
    // draw shape
    public abstract draw(ctx: CanvasRenderingContext2D, ctf: CoordTransform): void

    /**
     * compute the bounding box
     */
    public abstract bound(): Bound;
}

export class Line extends Entity {
    /**
     * the ent point of line
     */
    public point1: Point;
    /**
     * the ent point of line
     */
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
        return new Bound(new Point(max_x, max_y), new Point(min_x, min_y));
    };
}

export class Circle extends Entity {
    /**
     * the origin(center) of circle
     */
    public origin: Point;
    /**
     * the radius of circle
     */
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
        const maxPoint = new Point(this.origin.X + this.radius, this.origin.Y + this.radius);
        const minPoint = new Point(this.origin.X - this.radius, this.origin.Y - this.radius);
        return new Bound(maxPoint, minPoint);
    }
}

export class Rectangle extends Entity {
    /**
     * the left top point of rectangle
     */
    public location: Point;
    /**
     * the width of rectangle
     */
    public width: number;
    /**
     * the height of rectangle
     */
    public height: number;
    public constructor(location: Point, width: number, height: number, color?: string) {
        super(color);
        this.location = location;
        this.width = width;
        this.height = height;
    }
    public draw = (ctx: CanvasRenderingContext2D, ctf: CoordTransform) => {
        // convert: Point and length
        const lt = ctf.worldToDevice_Point(this.location);
        const w = ctf.worldToDevice_Len * this.width;
        const h = ctf.worldToDevice_Len * this.height;

        // paint
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.strokeRect(lt.X, lt.Y, w, h);
        ctx.closePath();
    };
    public bound = () => {
        const maxPoint = new Point(this.location.X + this.width, this.location.Y + this.height);
        const minPoint = this.location;
        return new Bound(maxPoint, minPoint);
    };
}
