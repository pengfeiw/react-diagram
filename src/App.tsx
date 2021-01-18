import Diagram from "./components/diagram";
import {FC} from "react";
import {Line, Circle, Rectangle} from "./entity";

const ents = [
    new Line({X: 100, Y: 100}, {X:200, Y: 200 }, "red"),
    new Circle({X: 100, Y: 100}, 50, "green"),
    new Line({X: -100, Y: -30}, {X:300, Y: 50 }, "black"),
    new Rectangle({X: 500, Y:500}, 200, 400, "gray")
];

const App: FC = () => {
    return (
        <div style={{width: "400px", height: "400px"}}>
            <Diagram width="100%" height="100%" entities={ents}/>
        </div>
    );
};

export default App;
