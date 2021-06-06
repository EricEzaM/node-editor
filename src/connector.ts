import Connection from "./connection";
import BaseNode from "./base-node";
import NodeEditor from "./node-editor";
import Position from "./position";

export default class Connector {
	name: string;

	protected root: HTMLElement;
	protected connPoint: HTMLElement;
	protected label: HTMLElement;

	constructor(node: BaseNode, name: string) {
		this.name = name;

		this.root = document.createElement("li");
		this.connPoint = document.createElement("i");
		this.label = document.createElement("span");
		this.root.appendChild(this.connPoint);
		this.root.appendChild(this.label);

		node.listElement.appendChild(this.root);
		this.label.innerText = this.name;
		this.connPoint.innerHTML = "&nbsp;";

		this.connPoint.addEventListener("mousedown", this);
	}

	handleEvent(e: MouseEvent) {}

	getPosition() {
		let element: HTMLElement | null = this.connPoint;
		let pos = new Position(
			element.offsetWidth / 2 + 2,
			element.offsetHeight / 2 + 2
		);

		while (element && element != NodeEditor.viewportElement) {
			pos.add(element.offsetLeft, element.offsetTop);
			element = element.offsetParent as HTMLElement;
		}

		return pos;
	}
}

export class InputConnector extends Connector {
	constructor(node: BaseNode, name: string) {
		super(node, name);
		this.root.className = "input";
	}

	handleEvent(e: MouseEvent) {
		e.stopPropagation();

		// Finish creating an already started connection
		if (NodeEditor.isConnectionInProgress()) {
			NodeEditor.completeConnection(this);
			return;
		}

		// Has an active connection terminating at this connector, so delete the connection but make re-start the connection so the user can move it.
		const activeConnection = NodeEditor.connections.find((c) => c.to === this);
		if (activeConnection) {
			NodeEditor.startConnection(activeConnection.from);
			NodeEditor.deleteConnection(activeConnection);
		}
	}
}

export class OutputConnector extends Connector {
	constructor(node: BaseNode, name: string) {
		super(node, name);
		this.root.className = "output";
	}

	handleEvent(e: MouseEvent) {
		e.stopPropagation();
		// Clear existing connection if any, and create new connection
		if (
			NodeEditor.isConnectionInProgress() &&
			NodeEditor.getConnectionStartConnector() == this
		) {
			NodeEditor.cancelConnection();
		} else {
			NodeEditor.startConnection(this);
		}
	}
}
