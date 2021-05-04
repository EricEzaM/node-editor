class Position {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	add(x, y) {
		this.x += x;
		this.y += y;

		return this;
	}
}

var NodeEditor = {};
NodeEditor.offset = new Position();
NodeEditor.element = null;
NodeEditor.svgElement = null;

NodeEditor.fromNode = null;
NodeEditor.fromOutput = -1;
NodeEditor.toNode = null;
NodeEditor.toInput = -1;

NodeEditor.init = function () {
	this.element = document.getElementById("NodeEditor");
	this.svgElement = document.getElementById("Connections");
};

NodeEditor.addPath = function (x1, y1, x2, y2) {
	let path = document.createElementNS(this.svgElement.namespaceURI, "path");
	path.setAttribute("fill", "none");
	path.setAttribute("stroke", "#000");
	path.setAttribute("stroke-width", 2);
	// path.setAttribute("stroke-dasharray", "20,5,5,5,5,5");
	NodeEditor.setPathDAttribute(path, x1, y1, x2, y2);
	NodeEditor.svgElement.appendChild(path);

	return path;
};

NodeEditor.setPathDAttribute = function (pathElement, x1, y1, x2, y2) {
	let str =
		`M${x1},${y1}` + // Move pen to starting position
		` L${x2},${y2}`; // Draw the line to the end point

	pathElement.setAttribute("d", str);
};

NodeEditor.completeConnection = function () {
	const s = this.fromOutput.getPosition();
	const e = this.toInput.getPosition();

	return NodeEditor.addPath(s.x, s.y, e.x, e.y);
};

NodeEditor.updatePath = function (pathElement, x1, y1, x2, y2) {
	NodeEditor.setPathDAttribute(pathElement, x1, y1, x2, y2);
};

class MyNode {
	// CONSTRUCTOR

	constructor(title, initialPosition = new Position()) {
		this.title = title;
		this.inputs = [];
		this.outputs = [];

		this.rootElement = document.createElement("div");
		this.rootElement.className = "Node";

		this.headerElement = document.createElement("header");
		this.rootElement.appendChild(this.headerElement);
		this.headerElement.innerText = this.title;
		this.headerElement.addEventListener("mousedown", this);

		this.listElement = document.createElement("ul");
		this.rootElement.appendChild(this.listElement);

		this._position = new Position();
		this.position = initialPosition;

		NodeEditor.element.appendChild(this.rootElement);
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

	addInput(name) {
		var connector = new InputConnector(this, name);
		this.inputs.push(connector);
		return connector;
	}

	addOutput(name) {
		var connector = new OutputConnector(this, name);
		this.outputs.push(connector);
		return connector;
	}

	onDragBegin(e) {
		e.stopPropagation();
		window.addEventListener("mousemove", this);
		window.addEventListener("mouseup", this);
	}

	onDragMove(e) {
		this.position = this.position.add(e.movementX, e.movementY);
		this.inputs.forEach((i) => {
			i.updatePaths();
		});
		this.outputs.forEach((o) => {
			o.updatePaths();
		});
	}

	onDragEnd(e) {
		window.removeEventListener("mousemove", this);
		window.removeEventListener("mouseup", this);
	}

	handleEvent(e) {
		switch (e.type) {
			case "mousedown":
				this.onDragBegin(e);
			case "mousemove":
				this.onDragMove(e);
				break;
			case "mouseup":
				this.onDragEnd(e);
			default:
				break;
		}
	}
}

class Connection {
	constructor() {
		this.from = null;
		this.to = null;
		this.path = null;
	}
}

class Connector {
	constructor(node, name) {
		this.name = name;
		this.node = node;

		this.root = document.createElement("li");
		this.connPoint = document.createElement("i");
		this.label = document.createElement("span");
		this.root.appendChild(this.connPoint);
		this.root.appendChild(this.label);

		node.listElement.appendChild(this.root);
		this.label.innerText = name;
		this.connPoint.innerHTML = "&nbsp;";

		this.connPoint.addEventListener("click", this);

		this.connections = [];
	}

	handleEvent(e) {}

	getPosition() {
		let element = this.connPoint;
		let pos = new Position(element.offsetWidth / 2, element.offsetHeight / 2);

		while (element) {
			pos.add(element.offsetLeft, element.offsetTop);
			element = element.offsetParent;
		}

		// Center the position in the middle of the width/height

		return pos;
	}

	updatePaths() {
		this.connections.forEach((c) => {
			const s = c.from.getPosition();
			const e = c.to.getPosition();
			NodeEditor.updatePath(c.path, s.x, s.y, e.x, e.y);
		});
	}
}

class InputConnector extends Connector {
	constructor(node, name) {
		super(node, name);
		this.root.className = "input";
	}

	handleEvent(e) {
		// Move an existing connection
		// Finish creating an already started connection

		NodeEditor.toNode = this.node;
		NodeEditor.toInput = this;

		const path = NodeEditor.completeConnection();
		let connection = new Connection();
		connection.from = NodeEditor.fromOutput;
		connection.to = NodeEditor.toInput;
		connection.path = path;

		this.connections.push(connection);
		NodeEditor.fromOutput.connections.push(connection);

		// this.paths.push(path);
		// NodeEditor.fromOutput.paths.push(path);
	}
}

class OutputConnector extends Connector {
	constructor(node, name) {
		super(node, name);
		this.root.className = "output";
	}

	handleEvent(e) {
		// Clear existing connection if any, and create new connection

		NodeEditor.fromNode = this.node;
		NodeEditor.fromOutput = this;
	}
}

window.addEventListener("load", function () {
	NodeEditor.init();
});
