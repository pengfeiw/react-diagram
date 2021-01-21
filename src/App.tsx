import Diagram from "./components/diagram";
import {FC} from "react";
import {Line, Circle, Rectangle} from "./entity";
import Layer from "./components/diagram/layer";

const ents1 = [
    new Line({X: 100, Y: 100}, {X: 200, Y: 200}, "red"),
    new Circle({X: 100, Y: 100}, 50, "green"),
    new Line({X: -100, Y: -30}, {X: 300, Y: 50}, "yellow"),
    new Rectangle({X: 500, Y: 500}, 200, 400, "bylayer")
];

const ents2 = [
    new Line({X: 20, Y: 40}, {X: 200, Y: 200}, "green"),
    new Circle({X: 10, Y: 100}, 50, "blue"),
    new Line({X: -700, Y: -330}, {X: 300, Y: 50}, "bylayer"),
    new Rectangle({X: 500, Y: 500}, 200, 400, "gray")
]

const layer1 = new Layer("0", "black");
const layer2 = new Layer("1", "red");
layer1.addEntity(ents1);
layer2.addEntity(ents2);
const layers = [layer1, layer2];

const App: FC = () => {

    return (
        <>
            <div style={{width: "800px", height: "800px"}}>
                <Diagram width="100%" height="100%" layers={layers} />
            </div>
        </>
    );
};

export default App;
