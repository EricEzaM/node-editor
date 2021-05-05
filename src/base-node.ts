import Connector, { InputConnector, OutputConnector } from "./connector";
import NodeEditor from "./node-editor";
import Position from "./position";

export default class BaseNode {
	title: string;
	inputs: Connector[] = [];
	outputs: Connector[] = [];
	rootElement: HTMLElement;
	headerElement: HTMLElement;
	listElement: HTMLElement;
	private _position: Position = new Position();

	constructor(title: string, initialPosition = new Position()) {
		this.title = title;

		this.rootElement = document.createElement("div");
		this.rootElement.className = "Node";

		this.headerElement = document.createElement("header");
		this.rootElement.appendChild(this.headerElement);
		this.headerElement.innerText = this.title;
		this.headerElement.addEventListener("mousedown", this);

		this.listElement = document.createElement("ul");
		this.rootElement.appendChild(this.listElement);

		this.position = initialPosition;
	}

	get position() {
		return this._position;
	}

	set position(newPosition) {
		this._position = newPosition;
		this.rootElement.style.left = newPosition.x + "px";
		this.rootElement.style.top = newPosition.y + "px";
	}

	addInput(name: string) {
		var connector = new InputConnector(this, name);
		this.inputs.push(connector);
		return connector;
	}

	addOutput(name: string) {
		var connector = new OutputConnector(this, name);
		this.outputs.push(connector);
		return connector;
	}

	onDragBegin(e: MouseEvent) {
		e.stopPropagation();
		window.addEventListener("mousemove", this);
		window.addEventListener("mouseup", this);
	}

	onDragMove(e: MouseEvent) {
		this.position = this.position.add(e.movementX, e.movementY);
		NodeEditor.updatePathsForNode(this);
	}

	onDragEnd(e: MouseEvent) {
		window.removeEventListener("mousemove", this);
		window.removeEventListener("mouseup", this);
	}

	handleEvent(e) {
		switch (e.type) {
			case "mousedown":
				this.onDragBegin(e);
				break;
			case "mousemove":
				this.onDragMove(e);
				break;
			case "mouseup":
				this.onDragEnd(e);
				break;
			default:
				break;
		}
	}
}
