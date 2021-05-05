import Connection from "./connection";
import BaseNode from "./base-node";
import NodeEditor from "./node-editor";
import Position from "./position";

export default class Connector {
	name: string;
	node: BaseNode;

	connections: Connection[] = [];

	protected root: HTMLElement;
	protected connPoint: HTMLElement;
	protected label: HTMLElement;

	constructor(node: BaseNode, name: string) {
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
	constructor(node: BaseNode, name: string) {
		super(node, name);
		this.root.className = "output";
	}

	handleEvent(e: MouseEvent) {
		// Clear existing connection if any, and create new connection
		NodeEditor.currentFromOutput = this;
	}
}
