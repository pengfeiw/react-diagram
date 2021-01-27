import {Rectangle} from "../entity";
import CoordTransform from "../util/coordTrans";
import Point from "../util/point";
import Vector from "../util/vector";

export default abstract class Tool {
    protected canvas: HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }
    /**
     * call it when install the tool on diagram.
     * initialization, such as add event listener, change mouse cursor after install the tool.
     */
    public abstract initialize: () => void;
    /**
     * call it when uninstall the tool with diagram.
     * do some reset work after uninstall the tool.
     */
    public abstract reset: () => void;
}

export class LocalZoom extends Tool {
    private ctf: CoordTransform;
    /**
     * update diagram by new ctf
     * @param newCtf new CoortTransform
     */
    private updateDiagramHandle: (newCtf: CoordTransform) => void;
    private dynamicRect = {
        startX: 0,
        startY: 0,
        w: 0,
        h: 0
    };
    private drag = false;
    constructor(canvas: HTMLCanvasElement, ctf: CoordTransform, updateDiagramHandle: (newCtf: CoordTransform) => void) {
        super(canvas);
        this.ctf = ctf;
        this.updateDiagramHandle = updateDiagramHandle;
    }
    private onMouseUp = (event: MouseEvent) => {
        this.drag = false;
        if (event.button === 0 && this.dynamicRect.w !== 0 && this.dynamicRect.h !== 0) {
            const ctx = this.canvas.getContext("2d")!;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const clientCenter = new Point(this.canvas.clientWidth * 0.5, this.canvas.clientHeight * 0.5);
            const dynamicRectCenter = new Point(this.dynamicRect.startX + this.dynamicRect.w * 0.5, this.dynamicRect.startY + this.dynamicRect.h * 0.5);
            const displaceVector = new Vector(clientCenter.X - dynamicRectCenter.X, clientCenter.Y - dynamicRectCenter.Y);

            const widthRatio = this.canvas.clientWidth / Math.abs(this.dynamicRect.w);
            const heightRatio = this.canvas.clientHeight / Math.abs(this.dynamicRect.h);

            const newCtf = new CoordTransform(this.ctf.worldOrigin, this.ctf.worldToDevice_Len);
            newCtf.displacement(displaceVector);
            newCtf.zoom(clientCenter, Math.min(widthRatio, heightRatio));
            this.ctf = newCtf;
            // update diagram
            this.reset();
            this.updateDiagramHandle(this.ctf);
        }
    };
    private onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            this.dynamicRect.startX = event.offsetX; // event.pageX - this.canvas.offsetLeft;
            this.dynamicRect.startY = event.offsetY; // event.pageY - this.canvas.offsetTop;
            this.drag = true;
        }
    };
    private onMouseMove = (event: MouseEvent) => {
        if (this.drag) {
            this.dynamicRect.w = event.offsetX - this.dynamicRect.startX;
            this.dynamicRect.h = event.offsetY - this.dynamicRect.startY;
            const ctx = this.canvas.getContext("2d")!;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.beginPath();
            ctx.setLineDash([6]);
            ctx.strokeRect(this.dynamicRect.startX, this.dynamicRect.startY, this.dynamicRect.w, this.dynamicRect.h);
            ctx.closePath();
        }
    };
    public initialize = () => {
        this.canvas.style.cursor = "crosshair";
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
    };

    public reset = () => {
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.style.cursor = "auto";
    };
}

// draw Box to choose entity
export class Normal extends Tool {
    private updateDiagramHandle: (rectangle: Rectangle) => void;
    private drag = false;
    private dynamicRect = {
        startX: 0,
        startY: 0,
        w: 0,
        h: 0
    };
    constructor(canvas: HTMLCanvasElement, updateDiagramHandle: (retangle: Rectangle) => void) {
        super(canvas);
        this.updateDiagramHandle = updateDiagramHandle;
    }
    private onMouseUp = (event: MouseEvent) => {
        this.drag = false;
        if (event.button === 0 && this.dynamicRect.w !== 0 && this.dynamicRect.h !== 0) {
            const ctx = this.canvas.getContext("2d")!;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.updateDiagramHandle(new Rectangle(new Point(this.dynamicRect.startX, this.dynamicRect.startY), this.dynamicRect.w, this.dynamicRect.h));
        }
    };
    private onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            this.dynamicRect.startX = event.offsetX; // event.pageX - this.canvas.offsetLeft;
            this.dynamicRect.startY = event.offsetY; // event.pageY - this.canvas.offsetTop;
            this.drag = true;
        }
    };
    private onMouseMove = (event: MouseEvent) => {
        if (this.drag) {
            this.dynamicRect.w = event.offsetX - this.dynamicRect.startX;
            this.dynamicRect.h = event.offsetY - this.dynamicRect.startY;
            const ctx = this.canvas.getContext("2d")!;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.beginPath();
            ctx.setLineDash([6]);
            ctx.strokeRect(this.dynamicRect.startX, this.dynamicRect.startY, this.dynamicRect.w, this.dynamicRect.h);
            ctx.closePath();
        }
    };
    public initialize = () => {
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
    };
    public reset = () => {
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
    };
}
