import Point from "./point";
export default class Bound {
    private maxPoint: Point;
    private minPoint: Point;
    public constructor(maxPoint: Point, minPoint: Point) {
        this.maxPoint = maxPoint;
        this.minPoint = minPoint;
    }
    public get max() {
        return this.maxPoint;
    }
    public get min() {
        return this.minPoint;
    }
    public get width() {
        return this.maxPoint.X - this.minPoint.X;
    }
    public get height() {
        return this.maxPoint.Y - this.minPoint.Y;
    }

    // get the boundingBox
    public static getUnionBound = (bounds: Bound[]) => {
        if (bounds.length === 0) {
            return new Bound(new Point(0, 0), new Point(0, 0));
        }

        let unionBound = bounds[0];
        for(let i = 1; i < bounds.length; i++) {
            const max_x = Math.max(unionBound.max.X, bounds[i].max.X);
            const min_x = Math.min(unionBound.min.X, bounds[i].min.X);
            const max_y = Math.max(unionBound.max.Y, bounds[i].max.Y);
            const min_y = Math.min(unionBound.min.Y, bounds[i].min.Y);
            unionBound = new Bound(new Point(max_x, max_y), new Point(min_x, min_y));
        }
        return unionBound;
    }
}
