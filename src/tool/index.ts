import CoordTransform from "../util/coordTrans";
import {Vector} from "../util/interface";

export default abstract class Tool {
    protected canvas: HTMLCanvasElement;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }
    public abstract addListeners = () => {
        console.log("Tool add");
    };
    public abstract removeListeners: () => void;
    public changeTool(targetTool: Tool) {
        this.removeListeners();
        targetTool.addListeners();
    }
}

export class LocalZoom extends Tool{
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
    private onMouseUp = () => {
        this.drag = false;
        const ctx = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const dynamicRectCenter = {
            X: this.dynamicRect.startX + this.dynamicRect.w * 0.5,
            Y: this.dynamicRect.startY + this.dynamicRect.h * 0.5
        };
        const clientCenter = {
            X: this.canvas.clientWidth * 0.5,
            Y: this.canvas.clientHeight * 0.5
        };
        const displaceVector: Vector = {
            X: clientCenter.X - dynamicRectCenter.X,
            Y: clientCenter.Y - dynamicRectCenter.Y
        };

        const widthRatio = this.canvas.clientWidth / this.dynamicRect.w;
        const heightRatio = this.canvas.clientHeight / this.dynamicRect.h;
        
        const newCtf = new CoordTransform(this.ctf.worldOrigin, this.ctf.worldToDevice_Len);
        newCtf.displacement(displaceVector);
        newCtf.zoom(clientCenter, Math.min(widthRatio, heightRatio));
        this.ctf = newCtf;
        this.updateDiagramHandle(this.ctf);
    };
    private onMouseDown = (event: MouseEvent) => {
        this.dynamicRect.startX = event.offsetX; // event.pageX - this.canvas.offsetLeft;
        this.dynamicRect.startY = event.offsetY; // event.pageY - this.canvas.offsetTop;
        this.drag = true;
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
    public addListeners = () => {
        console.log("LocalZoom add");
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
    };

    public removeListeners = () => {
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
    };
}
