import Diagram from "./components/diagram";
import {FC} from "react";
import {Line, Circle} from "./entity";

const ents = [
    new Line({X: 100, Y: 100}, {X:200, Y: 200 }, "red"),
    new Circle({X: 100, Y: 100}, 50, "green")
];

const App: FC = () => {
    return (
        <div style={{width: "400px", height: "400px"}}>
            <Diagram width="100%" height="100%" entities={ents}/>
        </div>
    );
};

export default App;
