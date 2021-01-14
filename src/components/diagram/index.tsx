import {FC, useEffect, useRef, useState} from "react";
import Entity from "../../entity";
import "./index.css";
import CoordTransform from "../../util/coordTrans";

interface DiagramProps {
    width: string;
    height: string;
    entities: Array<Entity>
}

const Diagram: FC<DiagramProps> = (props) => {
    const {height, width, entities} = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [ctf] = useState(new CoordTransform()); // coordinate transform
    const [mouseDown, setMouseDown] = useState<boolean>(false);

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

    // paint
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
        setMouseDown(true);
    };
    const onMouseUp:React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        setMouseDown(false);
    };

    const onMouseMove:React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (mouseDown) {
            ctf.displacement({X: event.movementX, Y: event.movementY});
            paint();
        }
    };

    return (
        <div id="container" ref={containerRef}>
            <canvas
                id="canvas"
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
            >
                Sorry, this browser does not support <i>canvas</i>!
            </canvas>
        </div>
    );
};

export default Diagram;
