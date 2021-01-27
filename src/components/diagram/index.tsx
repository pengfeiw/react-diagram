import {FC, useEffect, useRef, useState} from "react";
import Entity, {Rectangle} from "../../entity";
import "./index.css";
import CoordTransform from "../../util/coordTrans";
import Bound from "../../util/bound";
import Layer from "./layer";
import Canvas from "./Canvas";
import Tool, {LocalZoom, Normal} from "../../tool";
import Point from "../../util/point";

export type ToolTypes = "Normal" | "LocalScale";
interface DiagramProps {
    width: string;
    height: string;
    margin?: number;
    layers: Layer[];
    toolType: ToolTypes;
    setToolType: (toolType: ToolTypes) => void;
}
let mouseDown = false;
const Diagram: FC<DiagramProps> = (props) => {
    const {height, width, margin, layers, toolType, setToolType} = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctf, setCtf] = useState(new CoordTransform()); // coordinate transform
    // const [scale, setScale] = useState<number>(1); // zoom scale, used for set scale limit
    const [tool, setTool] = useState<Tool>(); // tool: used to add some utility
    const [, forceUpdate] = useState({});

    // set size of canvas
    const initCanvas = (canvas: HTMLCanvasElement) => {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        canvas.style.backgroundColor = "transparent";
        canvas.style.position = "absolute";
    };

    const selectedEntitiesByRect = (rectangle: Rectangle) => {
        // convert device rectangle to world rectangle
        const lt = rectangle.location;
        const w = rectangle.width;
        const h = rectangle.height;
        const w_lt = ctf.deviceToWorld_Point(lt);
        const w_w = ctf.deviceToWorld_Len * w;
        const w_h = ctf.deviceToWorld_Len * h;
        const worldRect = new Rectangle(w_lt, w_w, w_h);

        for(let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            let isSelected = false;
            const newEnts = layer.entities.map((ent) => {
                if (ent.isIntersectWithReact(worldRect)) {
                    ent.selected = true;
                    isSelected = true;
                }
                return ent;
            });
            if (isSelected) {
                layer.clear();
                layer.addEntity(newEnts);
            }
        }

        // force to update, make the change in layers
        forceUpdate({});
    };

    // unselect all entities
    const unselectAll = () => {
        for (let i = 0; i < layers.length; i++) {
            // layers[i].entities.forEach(ent => ent.selected = false);
            let updatelayer = false;
            const newEnts = layers[i].entities.map((ent) => {
                if (ent.selected) {
                    ent.selected = false;
                    updatelayer = true;
                }
                return ent;
            })

            if (updatelayer) {
                layers[i].clear();
                layers[i].addEntity(newEnts);
            }
        }
        // force update
        forceUpdate({});
    }

    useEffect(() => {
        const container = containerRef.current as HTMLDivElement;
        const canvas = canvasRef.current as HTMLCanvasElement;
        // set size of container
        container.style.width = width;
        container.style.height = height;
        // set operate canvas
        canvas.style.zIndex = "1";
        initCanvas(canvas);
    }, []);

    useEffect(() => {
        tool?.reset();
        let newTool: Tool | undefined = undefined;
        switch (toolType) {
            case "Normal":
                newTool = new Normal(canvasRef.current!, selectedEntitiesByRect);
                break;
            case "LocalScale":
                newTool = new LocalZoom(canvasRef.current!, ctf, (newCtf: CoordTransform) => {setCtf(newCtf); setToolType("Normal");});
                break;
            default:
                break;
        }
        newTool?.initialize();
        setTool(newTool);
    }, [toolType, layers, ctf]);
    
    const onMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (toolType !== "Normal") return;
        if (event.button === 1) {
            mouseDown = true;
            canvasRef.current!.style.cursor = "grab";
        }
    };
    const onMouseUp: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (toolType !== "Normal") return;
        if (event.button === 1) {
            mouseDown = false;
            canvasRef.current!.style.cursor = "auto";
        }
    };
    const onMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (toolType !== "Normal") return;
        if (mouseDown) {
            if (event.buttons === 4) {
                // 平移
                const newCtf = new CoordTransform(ctf.worldOrigin, ctf.worldToDevice_Len);
                newCtf.displacement({X: event.movementX, Y: event.movementY});
                setCtf(newCtf);
            }
        }
    };

    const onMouseWheel: React.WheelEventHandler<HTMLCanvasElement> = (event) => {
        if (toolType !== "Normal") return;
        // const resScale = scale * (1 - event.deltaY / 1000);
        // set the zoom limit
        // let minScale = 0.001;
        // let maxScale = 1000;
        // if (scaleLimit !== undefined) {
        //     minScale = 1 / scaleLimit;
        //     maxScale = scaleLimit;
        // }
        // if (resScale <= maxScale && resScale >= minScale) {
        //     const newCtf = new CoordTransform(ctf.worldOrigin, ctf.worldToDevice_Len);
        //     newCtf.zoom({X: event.clientX, Y: event.clientY}, (1 - event.deltaY / 1000));
        //     setCtf(newCtf);
        //     setScale(resScale);
        // }

        const newCtf = new CoordTransform(ctf.worldOrigin, ctf.worldToDevice_Len);
        // newCtf.zoom({X: event.clientX, Y: event.clientY}, (1 - event.deltaY / 1000));
        newCtf.zoom(new Point(event.clientX, event.clientY), (1 - event.deltaY / 1000));
        setCtf(newCtf);
        // setScale(resScale);
    };
    const onMouseDbClick: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (toolType !== "Normal") {
            return;
        }
        zoomToBound();
    };
    const onKeyDown: React.KeyboardEventHandler<HTMLCanvasElement> = (event) => {
        const keyCode = (event as any).code;
        switch (keyCode) {
            case "KeyR":
                break;
            case "Escape":
                unselectAll();
                break;
            default:
                break;
        }
    };

    const zoomToBound = () => {
        const bounds: Bound[] = [];
        const allEntities: Entity[] = [];
        layers.forEach((layer) => {
            allEntities.push(...layer.entities);
        });
        allEntities.forEach((ent) => {
            bounds.push(ent.bound());
        });
        const unionBound = Bound.getUnionBound(bounds);
        const deviceUnionBound = new Bound(ctf.worldToDevice_Point(unionBound.max), ctf.worldToDevice_Point(unionBound.min));
        const realMargin = margin ? margin : 5;
        const widthRatio = (canvasRef.current!.clientWidth - 2 * realMargin) / deviceUnionBound.width;
        const heightRatio = (canvasRef.current!.clientHeight - 2 * realMargin) / deviceUnionBound.height;
        const clientCenter = new Point(canvasRef.current!.clientWidth * 0.5, canvasRef.current!.clientHeight * 0.5);

        const moveVector = {
            X: clientCenter.X - 0.5 * (deviceUnionBound.max.X + deviceUnionBound.min.X),
            Y: clientCenter.Y - 0.5 * (deviceUnionBound.max.Y + deviceUnionBound.min.Y)
        };

        const newCtf = new CoordTransform(ctf.worldOrigin, ctf.worldToDevice_Len);
        newCtf.displacement(moveVector);
        newCtf.zoom(clientCenter, Math.min(widthRatio, heightRatio));
        setCtf(newCtf);
        // setScale(scale * Math.min(widthRatio, heightRatio));
    };

    // selectedEntitiesByRect(new Rectangle(new Point(0, 0), 0, 0));

    return (
        <div id="container" ref={containerRef}>
            <canvas
                id="canvas"
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onWheel={onMouseWheel}
                onDoubleClick={onMouseDbClick}
                onKeyDown={onKeyDown}
                tabIndex={-1}
            >
                Sorry, this browser does not support <i>canvas</i>!
            </canvas>
            {
                layers.map((layer) => (<Canvas style={{display: layer.visible ? "block" : "none"}} key={layer.name} ctf={ctf} color={layer.color} entities={layer.entities} />))
            }
        </div>
    );
};

export default Diagram;
