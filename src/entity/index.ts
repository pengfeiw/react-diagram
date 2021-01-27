// Entity
import CoordTransform from "../util/coordTrans";
import Point from "../util/point";
import Bound from "../util/bound";

const drawSelectedPoint = (point: Point, ctx: CanvasRenderingContext2D, color: string) => {
    const size = 6;
    ctx.fillStyle = color;
    ctx.fillRect(point.X - size * 0.5, point.Y - size * 0.5, size, size);
};

const pointInRect = (point: Point, rect: Rectangle): boolean => {
    const p1 = rect.location;
    const p2 = new Point(rect.location.X + rect.width, rect.location.Y + rect.height);
    const max_x = Math.max(p1.X, p2.X);
    const min_x = Math.min(p1.X, p2.X);
    const max_y = Math.max(p1.Y, p2.Y);
    const min_y = Math.min(p1.Y, p2.Y);
    return point.X < max_x && point.X > min_x && point.Y < max_y && point.Y > min_y;
};

export default abstract class Entity {
    /**
     * @member color if the color is 'bylayer', the color is resolved by the layer it belong.
     */
    public color: string;
    public selectedColor = "#99095183";
    public selectedWidth = 2; // line width when selected.
    public lineWidth = 1; // line width when unselected.
    /**
     * @member selected determine whether the entity is selected.
     */
    public selected: boolean = false;
    public constructor(color = "black") {
        this.color = color;
    }
    /**
     * draw entity
     * @param ctx CanvasRenderingContext2D object.
     * @param ctf CoordTransform object of current canvas.
     */
    public abstract draw(ctx: CanvasRenderingContext2D, ctf: CoordTransform): void

    /**
     * compute the bounding box
     */
    public abstract bound(): Bound;

    /**
     * wether the entity is intersect with a rect
     * @param rect 
     */
    public abstract isIntersectWithReact(rect: Rectangle): boolean;
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
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(p1.X, p1.Y);
        ctx.lineTo(p2.X, p2.Y);
        ctx.stroke();
        ctx.closePath();

        // draw selected symbol point
        if (this.selected) {
            drawSelectedPoint(p1, ctx, this.selectedColor);
            drawSelectedPoint(p2, ctx, this.selectedColor);

            ctx.lineWidth = this.selectedWidth;
            ctx.strokeStyle = this.selectedColor;
            ctx.beginPath();
            ctx.moveTo(p1.X, p1.Y);
            ctx.stroke();
            ctx.closePath();
        }
    };

    public bound = () => {
        const min_x = Math.min(this.point1.X, this.point2.X);
        const max_x = Math.max(this.point1.X, this.point2.X);
        const min_y = Math.min(this.point1.Y, this.point2.Y);
        const max_y = Math.max(this.point1.Y, this.point2.Y);
        return new Bound(new Point(max_x, max_y), new Point(min_x, min_y));
    };
    public isIntersectWithReact(rect: Rectangle): boolean {
        return pointInRect(this.point1, rect) || pointInRect(this.point2, rect);
    }
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
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(o.X, o.Y, r, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.closePath();

        if (this.selected) {
            const p1 = new Point(o.X - r, o.Y);
            const p2 = new Point(o.X + r, o.Y);
            const p3 = new Point(o.X, o.Y - r);
            const p4 = new Point(o.X, o.Y + r);
            drawSelectedPoint(p1, ctx, this.selectedColor);
            drawSelectedPoint(p2, ctx, this.selectedColor);
            drawSelectedPoint(p3, ctx, this.selectedColor);
            drawSelectedPoint(p4, ctx, this.selectedColor);
            drawSelectedPoint(o, ctx, this.selectedColor);

            ctx.lineWidth = this.selectedWidth;
            ctx.strokeStyle = this.selectedColor;
            ctx.beginPath();
            ctx.arc(o.X, o.Y, r, 0, 2 * Math.PI, true);
            ctx.stroke();
            ctx.closePath();
        }
    };

    public bound = () => {
        const maxPoint = new Point(this.origin.X + this.radius, this.origin.Y + this.radius);
        const minPoint = new Point(this.origin.X - this.radius, this.origin.Y - this.radius);
        return new Bound(maxPoint, minPoint);
    }
    public isIntersectWithReact(rect: Rectangle): boolean {
        const p1 = new Point(this.origin.X - this.radius, this.origin.Y);
        const p2 = new Point(this.origin.X + this.radius, this.origin.Y);
        const p3 = new Point(this.origin.X, this.origin.Y - this.radius);
        const p4 = new Point(this.origin.X, this.origin.Y + this.radius);
        return pointInRect(p1, rect) || pointInRect(p2, rect) || pointInRect(p3, rect) || pointInRect(p4, rect);
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
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.strokeRect(lt.X, lt.Y, w, h);
        ctx.closePath();

        if (this.selected) {
            const p1 = lt;
            const p2 = new Point(lt.X + w, lt.Y);
            const p3 = new Point(lt.X + w, lt.Y + h);
            const p4 = new Point(lt.X, lt.Y + h);

            drawSelectedPoint(p1, ctx, this.selectedColor);
            drawSelectedPoint(p2, ctx, this.selectedColor);
            drawSelectedPoint(p3, ctx, this.selectedColor);
            drawSelectedPoint(p4, ctx, this.selectedColor);

            ctx.lineWidth = this.selectedWidth;
            ctx.strokeStyle = this.selectedColor;
            ctx.beginPath();
            ctx.strokeRect(lt.X, lt.Y, w, h);
            ctx.closePath();
        }
    };
    public bound = () => {
        const maxPoint = new Point(this.location.X + this.width, this.location.Y + this.height);
        const minPoint = this.location;
        return new Bound(maxPoint, minPoint);
    };

    public isIntersectWithReact(rect: Rectangle): boolean {
        const p1 = this.location;
        const p2 = new Point(this.location.X + this.width, this.location.Y);
        const p3 = new Point(this.location.X + this.width, this.location.Y + this.height);
        const p4 = new Point(this.location.X, this.location.Y + this.height);
        return pointInRect(p1, rect) || pointInRect(p2, rect) || pointInRect(p3, rect) || pointInRect(p4, rect);
    }
}
