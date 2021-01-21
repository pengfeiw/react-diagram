import Entity from "../../../entity";
class Layer {
    /**
     * the color of layer
     */
    private _color: string;
    /**
     * the name of layer
     */
    public readonly name: string;
    /**
     * wether the layer is visible
     */
    private _visible: boolean;
    /**
     * the entities on the layer
     */
    private _entities: Entity[];
    /**
     * @param name the name of layer
     * @param ents the entities on the layer
     * @param visible wether the layer is visible
     * @param color the color of layer, determine the color of entity
     */
    public constructor(name: string, color = "white") {
        this.name = name;
        this._entities = [];
        this._color = color;
        this._visible = true;
    }
    public get color() {
        return this._color;
    }
    public get visible() {
        return this._visible;
    }
    public get entities() {
        return this._entities;
    }

    /**
     * add one entity.
     * @param entity 
     */
    public addEntity(entity: Entity): void;
    /**
     * add an array of entities.
     * @param ents 
     */
    public addEntity(ents: Entity[]): void;

    public addEntity(entity: any) {
        this._entities = this._entities.concat(entity);
    }

    /**
     * clear the layer.
     */
    public clear = () => {
        this._entities = [];
    }

    /**
     * set the color of layer.
     * @param color 
     */
    public setColor = (color: string) => {
        this._color = color;
    }

    /**
     * show or hide the layer.
     */
    public toogleLayer = () => {
        this._visible = !this._visible;
    }

    /**
     * hide layer.
     */
    public hideLayer = () => {
        if (!this._visible) {
            console.log("The layer you want to hide is alerady hide.")
            return;
        }
        this.toogleLayer();
    }
    /**
     * show layer.
     */
    public showLayer = () => {
        if (this._visible) {
            console.log("The layer you want to hide is alerady show.")
            return;
        }
        this.toogleLayer();
    }
}

export default Layer;
