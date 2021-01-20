import Diagram from "./components/diagram";
// import Test from "./components/test";
import react, {FC, useEffect, useRef} from "react";
import {Line, Circle, Rectangle} from "./entity";
import Layer from "./components/diagram/layer";

const ents = [
    new Line({X: 100, Y: 100}, {X: 200, Y: 200}, "red"),
    new Circle({X: 100, Y: 100}, 50, "green"),
    new Line({X: -100, Y: -30}, {X: 300, Y: 50}, "black"),
    new Rectangle({X: 500, Y: 500}, 200, 400, "gray")
];

const App: FC = () => {
    const diagramRef = useRef();
    // 测试添加一个图层
    const onClick = () => {
        const diagram = diagramRef.current as any;
        if (diagram) {
            const layer: Layer = new Layer("layer1", "red");
            layer.addEntity(new Line({X: 1000, Y: -100}, {X: 200, Y: 200}, "byLayer"));
            layer.addEntity(new Rectangle({X: 1000, Y: 1000}, 800, 500, "white"));
            diagram.addLayer(layer);
        }
    };

    return (
        <>
            <div style={{width: "400px", height: "400px"}}>
                <Diagram ref={diagramRef} width="100%" height="100%" entities={ents} />
            </div>
            <button onClick={onClick}>add</button>
        </>
    );
};

export default App;
