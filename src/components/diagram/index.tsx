import {FC, useEffect, useRef, useState} from "react";
import Entity from "../../entity";
import "./index.css";
import CoordTransform from "../../util/coordTrans";
import Bound from "../../util/bound";

interface DiagramProps {
    width: string;
    height: string;
    entities: Array<Entity>;
    scaleLimit?: number;
    margin?: number;
}

const Diagram: FC<DiagramProps> = (props) => {
    const {height, width, entities, scaleLimit, margin} = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [ctf] = useState(new CoordTransform()); // coordinate transform
    const [mouseDown, setMouseDown] = useState<boolean>(false);
    const [scale, setScale] = useState<number>(1); // zoom scale
    
    useEffect(() => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const container = containerRef.current as HTMLDivElement;

        // set size of container
        container.style.width = width;
        container.style.height = height;

        // set size of canvas
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }, []);

    useEffect(() => {
        paint();
    }, []);

    const paint = () => {
        var ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            for (let i = 0; i < entities.length; i++) {
                entities[i].draw(ctx, ctf);
            }
        }
    }

    const onMouseDown:React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (event.button === 1) {
            setMouseDown(true);
        }
    };
    const onMouseUp:React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (event.button === 1) {
            setMouseDown(false);
        }
    };
    const onMouseMove:React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (mouseDown) {
            ctf.displacement({X: event.movementX, Y: event.movementY});
            paint();
        }
    };
    const onMouseWheel:React.WheelEventHandler<HTMLCanvasElement> = (event) => {
        const resScale = scale * (1 - event.deltaY / 1000);
        let minScale = 0.001;
        let maxScale = 1000;
        if (scaleLimit !== undefined) {
            minScale = 1 / scaleLimit;
            maxScale = scaleLimit;
        }
        if (resScale <= maxScale && resScale >= minScale) {
            ctf.zoom({X: event.clientX, Y: event.clientY}, (1 - event.deltaY / 1000));
            paint();
            setScale(resScale);
        }
    };
    const onMouseDbClick: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (event.button === 0) {
            zoomToBound();
        }
    };

    const zoomToBound = () => {
        const bounds: Bound[] = [];
        entities.forEach((ent) => {
            bounds.push(ent.bound());
        });
        const unionBound = Bound.getUnionBound(bounds);
        const deviceUnionBound = new Bound(ctf.worldToDevice_Point(unionBound.max), ctf.worldToDevice_Point(unionBound.min));
        const realMargin = margin ? margin : 5;
        const widthRatio =  (canvasRef.current!.clientWidth - 2 * realMargin) / deviceUnionBound.width;
        const heightRatio = (canvasRef.current!.clientHeight - 2 * realMargin) / deviceUnionBound.height;

        const clientCenter = {
            X: canvasRef.current!.clientWidth * 0.5,
            Y: canvasRef.current!.clientHeight * 0.5
        };

        const moveVector = {
            X: clientCenter.X - 0.5 * (deviceUnionBound.max.X + deviceUnionBound.min.X),
            Y: clientCenter.Y - 0.5 * (deviceUnionBound.max.Y + deviceUnionBound.min.Y)
        };

        ctf.displacement(moveVector);
        ctf.zoom(clientCenter, Math.min(widthRatio, heightRatio));
        setScale(scale * Math.min(widthRatio, heightRatio));

        paint();
    };

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
            >
                Sorry, this browser does not support <i>canvas</i>!
            </canvas>
        </div>
    );
};

export default Diagram;
