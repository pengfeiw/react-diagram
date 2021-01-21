import {CSSProperties, FC, useEffect, useRef} from "react";
import Entity from "../../../entity";
import CoordTransform from "../../../util/coordTrans";

interface CanvasProps {
    entities: Entity[];
    color: string;
    ctf: CoordTransform;
    style?: CSSProperties;
}

const Canvas: FC<CanvasProps> = (props) => {
    const {entities, color, ctf, style} = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current!;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        canvas.style.backgroundColor = "transparent";
        canvas.style.position = "absolute";
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            entities.forEach((entity) => {
                if (entity.color.toLowerCase() === "bylayer") {
                    entity.color = color;
                }
                entity.draw(ctx!, ctf);
            });
        }
    }, [ctf, canvasRef, entities, color]);

    return (
        <canvas style={style} ref={canvasRef} />
    );
};

export default Canvas;
