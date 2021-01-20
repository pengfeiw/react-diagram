import {FC, useEffect, useRef, useState, forwardRef, useImperativeHandle} from "react";
import Entity, {Rectangle} from "../../entity";
import "./index.css";
import CoordTransform from "../../util/coordTrans";
import Bound from "../../util/bound";
import {MouseStatus} from "./interface";
import Layer from "./layer";

interface DiagramProps {
    width: string;
    height: string;
    entities: Array<Entity>;
    scaleLimit?: number;
    margin?: number;
}
const defaultLayer = new Layer("0");
let mouseDown = false;
const Diagram = forwardRef((props: DiagramProps, ref) => {
    const {height, width, entities, scaleLimit, margin} = props;
    const [layers, setLayers] = useState([defaultLayer]);
    const [activeLayer, setActiveLayer] = useState(defaultLayer);
    const containerRef = useRef<HTMLDivElement>(null);
    const [ctf] = useState(new CoordTransform()); // coordinate transform
    const [scale, setScale] = useState<number>(1); // zoom scale
    const [mask, setMask] = useState<boolean>(false);

    // set size of canvas
    const initCanvas = (canvas: HTMLCanvasElement) => {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        canvas.style.backgroundColor = "transparent";
        canvas.style.position = "absolute";
    };

    useEffect(() => {
        const container = containerRef.current as HTMLDivElement;
        // set size of container
        container.style.width = width;
        container.style.height = height;

        layers.forEach((layer) => {
            const canvas = layer.canvas;
            container.appendChild(canvas);
            initCanvas(canvas);
        });

        defaultLayer.addEntity(entities);
        defaultLayer.canvas.addEventListener("mousedown", onMouseDown);
        defaultLayer.canvas.addEventListener("mouseup", onMouseUp);
        defaultLayer.canvas.addEventListener("mousemove", onMouseMove);
        defaultLayer.canvas.addEventListener("wheel", onMouseWheel);
        defaultLayer.canvas.addEventListener("dblclick", onMouseDbClick);
        defaultLayer.canvas.style.zIndex = "1";
        setActiveLayer(defaultLayer);
    }, []);

    useEffect(() => {
        paint();
    }, []);

    /**
     * @param layer the layer be added
     */
    const addLayer = (layer: Layer) => {
        const resLayers = layers.concat(layer);
        setLayers(resLayers);
        const container = containerRef.current as HTMLDivElement;
        container.appendChild(layer.canvas);
        initCanvas(layer.canvas);
        layer.draw(ctf);
    };

    useImperativeHandle(ref, () => ({
        addLayer
    }));
    const paint = () => {
        console.log(layers);

        layers.forEach((layer) => {
            layer.draw(ctf);
        });
    }
    const onMouseDown = (event: MouseEvent) => {
        mouseDown = true;
    };
    const onMouseUp = (event: MouseEvent) => {
        mouseDown = false;
    };
    const onMouseMove = (event: MouseEvent) => {
        if (mouseDown) {
            if (event.buttons === 4) {
                // 平移
                ctf.displacement({X: event.movementX, Y: event.movementY});
                paint();
            }
        }
    };

    const onMouseWheel = (event: WheelEvent) => {
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
    const onMouseDbClick = (event: MouseEvent) => {
        if (event.button === 0) {
            zoomToBound();
        }
    };
    const onKeyDown: React.KeyboardEventHandler<HTMLCanvasElement> = (event) => {
        const keyCode = (event as any).code;
        console.log(keyCode);
        switch (keyCode) {
            case "KeyR":
                setMask(true);
                break;
            case "Escape":
                setMask(false);
                break;
            default:
                break;
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
        const widthRatio = (defaultLayer.canvas.clientWidth - 2 * realMargin) / deviceUnionBound.width;
        const heightRatio = (defaultLayer.canvas.clientHeight - 2 * realMargin) / deviceUnionBound.height;

        const clientCenter = {
            X: defaultLayer.canvas.clientWidth * 0.5,
            Y: defaultLayer.canvas.clientHeight * 0.5
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
        <div id="container" className={mask ? "mask" : ""} ref={containerRef} />
    );
});

export default Diagram;
