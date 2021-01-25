import Diagram, {ToolTypes} from "./components/diagram";
import {FC, useEffect, useState} from "react";
import {Line, Circle, Rectangle} from "./entity";
import Layer from "./components/diagram/layer";
import Point from "./util/point";

const ents1 = [
    new Line(new Point(100, 100), new Point(200, 200), "red"),
    new Circle(new Point(100, 100), 50, "green"),
    new Line(new Point(-100, -30), new Point(300, 50), "yellow"),
    new Rectangle(new Point(500, 500), 200, 400, "bylayer")
];

const ents2 = [
    new Line(new Point(20, 40), new Point(200, 200), "green"),
    new Circle(new Point(10, 100), 50, "blue"),
    new Line(new Point(-700, -330), new Point(300, 50), "bylayer"),
    new Rectangle(new Point(500, 500), 200, 400, "gray")
];

const layer1 = new Layer("0", "black");
const layer2 = new Layer("1", "red");
layer1.addEntity(ents1);
layer2.addEntity(ents2);

const App: FC = () => {
    // const [layer1Visible, setLayer1Visible] = useState(true);
    // const [layer2Visible, setLayer2Visible] = useState(true);
    const [layers, setLayers] = useState<Layer[]>([]);
    const [tool, setTool] = useState<ToolTypes>("Normal");
    useEffect(() => {
        setLayers([layer1, layer2]);
    }, []);
    const onclick1 = () => {
        layer1.toogleLayer();
        setLayers([layer1, layer2]);
    }
    const onclick2 = () => {
        layer2.toogleLayer();
        setLayers([layer1, layer2]);
    };
    const onClick3 = () => {
        setTool("Normal");
    };
    const onClick4 = () => {
        setTool("LocalScale");
    };

    return (
        <>
            <button onClick={onclick1}>layer1</button>
            <button onClick={onclick2}>layer2</button>
            <button onClick={onClick3}>toolNormal</button>
            <button onClick={onClick4}>toolLocalScale</button>
            <div style={{width: "600px", height: "600px"}}>
                <Diagram width="100%" height="100%" layers={layers} toolType={tool}/>
            </div>
        </>
    );
};

export default App;
