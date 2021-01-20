import React, {FC, useState, useRef, useEffect} from "react";

const dynamicRect = {
    startX: 0,
    startY: 0,
    w: 0,
    h: 0
};
let drag = false;
const Test = (props: any) => {
    const {width, height} = props;
    const [ctx2, setCtx2] = useState<CanvasRenderingContext2D | null>(null);
    const canvas2Ref = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        debugger;
        const canvas2 = canvas2Ref.current as HTMLCanvasElement;
        const container = containerRef.current as HTMLDivElement;
        setCtx2(canvas2.getContext("2d"));
        container.style.width = width;
        container.style.height = height;

        // set size of canvas
        const initCanvas = (canvas: HTMLCanvasElement) => {
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        initCanvas(canvas2);

        
    }, []);
    const onMouseDown2: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        dynamicRect.startX = event.pageX - canvas2Ref.current!.offsetLeft;
        dynamicRect.startY = event.pageY - canvas2Ref.current!.offsetTop;
        drag = true;

        ctx2!.beginPath();
        ctx2!.arc(50, 50, 20, 0, 2 * Math.PI, true);
        ctx2!.stroke();
        ctx2!.closePath();
    };
    const onMouseUp2: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        drag = false;
        ctx2?.clearRect(0, 0, canvas2Ref.current!.width, canvas2Ref.current!.height);
    };
    const noMouseMove2: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        if (drag) {
            dynamicRect.w = (event.pageX - canvas2Ref.current!.offsetLeft) - dynamicRect.startX;
            dynamicRect.h = (event.pageY - canvas2Ref.current!.offsetTop) - dynamicRect.startY;
            ctx2!.clearRect(0, 0, canvas2Ref.current!.width, canvas2Ref.current!.height);
            ctx2!.strokeStyle = "red";
            ctx2?.beginPath();
            ctx2!.setLineDash([6]);
            ctx2!.strokeRect(dynamicRect.startX, dynamicRect.startY, dynamicRect.w, dynamicRect.h);
            ctx2?.closePath();
        }
    };
    return (
        <div id="container"
            ref={containerRef}
            style={{border: "1px solid black"}}
        >
            <canvas
                id="canvas2"
                ref={canvas2Ref}
                onMouseDown={onMouseDown2}
                onMouseUp={onMouseUp2}
                onMouseMove={noMouseMove2}
            />
        </div>
    )
};

export default Test;
