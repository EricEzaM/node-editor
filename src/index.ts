import "./styles/main.scss";

export class Position {
	x: number;
	y: number;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	add(x: number, y: number) {
		this.x += x;
		this.y += y;

		return this;
	}
}

export class NodeEditor {
	private constructor() {}

	static offset = new Position();
	static element: HTMLElement | null;
	static svgElement: HTMLElement | null;

	static currentFromOutput: Connector;
	static currentToInput: Connector;

	static init() {
		this.element = document.getElementById("NodeEditor");
		this.svgElement = document.getElementById("Connections");
	}

	static addPath(startPos: Position, endPos: Position): SVGPathElement | null {
		if (this.svgElement) {
			let path = document.createElementNS(
				this.svgElement.namespaceURI,
				"path"
			) as SVGPathElement;
			path.setAttribute("fill", "none");
			path.setAttribute("stroke", "#000");
			path.setAttribute("stroke-width", "2");
			// path.setAttribute("stroke-dasharray", "20,5,5,5,5,5");
			this.setPathDAttribute(path, startPos, endPos);
			this.svgElement.appendChild(path);

			return path;
		} else {
			return null;
		}
	}

	static setPathDAttribute(
		pathElement: SVGPathElement,
		startPos: Position,
		endPos: Position
	): void {
		let str =
			`M${startPos.x},${startPos.y}` + // Move pen to starting position
			` L${endPos.x},${endPos.y}`; // Draw the line to the end point

		pathElement.setAttribute("d", str);
	}

	static completeConnection(): SVGPathElement | null {
		const s = this.currentFromOutput?.getPosition();
		const e = this.currentToInput?.getPosition();

		return s && e ? this.addPath(s, e) : null;
	}

	static updatePath(
		pathElement: SVGPathElement,
		startPos: Position,
		endPos: Position
	) {
		this.setPathDAttribute(pathElement, startPos, endPos);
	}
}

export class MyNode {
	// CONSTRUCTOR

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

		NodeEditor.element?.appendChild(this.rootElement);
	}

	// PROPERTIES

	get position() {
		return this._position;
	}

	set position(newPosition) {
		this._position = newPosition;
		this.rootElement.style.left = newPosition.x + "px";
		this.rootElement.style.top = newPosition.y + "px";
	}

	// METHODS

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
		this.inputs.forEach((i) => {
			i.updatePaths();
		});
		this.outputs.forEach((o) => {
			o.updatePaths();
		});
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

export class Connection {
	from: Connector;
	to: Connector;
	path: SVGPathElement;

	constructor(from: Connector, to: Connector, path: SVGPathElement) {
		this.from = from;
		this.to = to;
		this.path = path;
	}
}

export class Connector {
	name: string;
	node: MyNode;

	connections: Connection[] = [];

	protected root: HTMLElement;
	protected connPoint: HTMLElement;
	protected label: HTMLElement;

	constructor(node: MyNode, name: string) {
		this.name = name;
		this.node = node;

		this.root = document.createElement("li");
		this.connPoint = document.createElement("i");
		this.label = document.createElement("span");
		this.root.appendChild(this.connPoint);
		this.root.appendChild(this.label);

		node.listElement.appendChild(this.root);
		this.label.innerText = this.name;
		this.connPoint.innerHTML = "&nbsp;";

		this.connPoint.addEventListener("click", this);
	}

	handleEvent(e: MouseEvent) {}

	getPosition() {
		let element: HTMLElement | null = this.connPoint;
		let pos = new Position(element.offsetWidth / 2, element.offsetHeight / 2);

		while (element) {
			pos.add(element.offsetLeft, element.offsetTop);
			element = element.offsetParent as HTMLElement;
		}

		return pos;
	}

	updatePaths() {
		this.connections.forEach((c) => {
			const s = c.from.getPosition();
			const e = c.to.getPosition();
			NodeEditor.updatePath(c.path, s, e);
		});
	}
}

export class InputConnector extends Connector {
	constructor(node, name) {
		super(node, name);
		this.root.className = "input";
	}

	handleEvent(e: MouseEvent) {
		// Move an existing connection
		// Finish creating an already started connection

		NodeEditor.currentToInput = this;

		const path = NodeEditor.completeConnection();
		if (path) {
			let connection = new Connection(
				NodeEditor.currentFromOutput,
				NodeEditor.currentToInput,
				path
			);

			this.connections.push(connection);
			NodeEditor.currentFromOutput.connections.push(connection);
		}
	}
}

export class OutputConnector extends Connector {
	constructor(node: MyNode, name: string) {
		super(node, name);
		this.root.className = "output";
	}

	handleEvent(e: MouseEvent) {
		// Clear existing connection if any, and create new connection
		NodeEditor.currentFromOutput = this;
	}
}

window.addEventListener("load", function () {
	NodeEditor.init();
});

window.addEventListener("load", function (e) {
	var node = new MyNode("Some Title", new Position(300, 100));
	node.addInput("Test Input");
	node.addOutput("Output Test Long Test");

	var node = new MyNode("Some Title", new Position(600, 150));
	node.addInput("Test Input");
	node.addOutput("Output Test Long Test");
});
