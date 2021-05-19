import BaseNode from "./base-node";
import Connection from "./connection";
import Connector from "./connector";
import Position from "./position";

export default class NodeEditor {
	private static offset = new Position();
	private static rootElement: HTMLElement | null;
	private static svgElement: HTMLElement | null;

	private static currentSourceConnector: Connector | null;

	private static previewPathUpdateListener: (me: MouseEvent) => void;
	private static previewPath: SVGPathElement | null;

	static nodes: BaseNode[] = [];
	static connections: Connection[] = [];

	static init() {
		this.rootElement = document.getElementById("NodeEditor");
		this.svgElement = document.getElementById("Connections");
	}

	static addNode(node: BaseNode) {
		this.nodes.push(node);
		this.rootElement?.appendChild(node.rootElement);
	}

	static addPath(
		startPos: Position,
		endPos: Position,
		color: string = "#000000"
	): SVGPathElement | null {
		if (this.svgElement) {
			let path = document.createElementNS(
				this.svgElement.namespaceURI,
				"path"
			) as SVGPathElement;
			path.setAttribute("fill", "none");
			path.setAttribute("stroke", color);
			path.setAttribute("stroke-width", "2");
			path.setAttribute("stroke-dasharray", "20,5,5,5,5,5");
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

		const xDiff = Math.abs(endPos.x - startPos.x) / 1.5;

		str =
			`M${startPos.x} ${startPos.y}` + // Move pen to starting position
			` C ${startPos.x + xDiff} ${startPos.y}` + // Control Point 1
			`, ${endPos.x - xDiff} ${endPos.y}` + // Control Point 2
			`, ${endPos.x} ${endPos.y}`; // End point

		pathElement.setAttribute("d", str);
	}

	static startConnection(source: Connector): void {
		if (this.currentSourceConnector != null) {
			console.warn(
				"Connection creation already in progress - cannot start another."
			);
			return;
		}

		debugger;

		this.currentSourceConnector = source;

		this.previewPathUpdateListener = this.updatePreviewPath.bind(this);
		this.rootElement &&
			this.rootElement.addEventListener(
				"mousemove",
				this.previewPathUpdateListener
			);
	}

	static completeConnection(destination: Connector): void {
		this.rootElement &&
			this.rootElement.removeEventListener(
				"mousemove",
				this.previewPathUpdateListener
			);
		this.previewPath?.remove();
		this.previewPath = null;

		if (this.currentSourceConnector && destination) {
			if (
				this.connections.find(
					(c) => c.from == this.currentSourceConnector && c.to == destination
				)
			) {
				console.warn("This connection already exists.");
				this.currentSourceConnector = null;
				return;
			}

			const s = this.currentSourceConnector.getPosition();
			const e = destination.getPosition();

			let path = this.addPath(s, e);

			if (path) {
				let c = new Connection(this.currentSourceConnector, destination, path);

				this.connections.push(c);
			}

			this.currentSourceConnector = null;
		} else {
			console.warn(
				"Connection could not be completed - source or desitnation is null."
			);
		}
	}

	static updatePathsForNode(node: BaseNode) {
		this.connections
			// Filter for only connections which are attached to the provided node
			.filter(
				(c) => node.outputs.includes(c.from) || node.inputs.includes(c.to)
			)
			// Update each path
			.forEach((c) => {
				this.updatePath(c.path, c.from.getPosition(), c.to.getPosition());
			});
	}

	static updatePath(
		pathElement: SVGPathElement,
		startPos: Position,
		endPos: Position
	) {
		this.setPathDAttribute(pathElement, startPos, endPos);
	}

	static getJson() {
		console.log("NODES");
		console.log(JSON.stringify(this.nodes));
		console.log("CONNECTIONS");
		console.log(JSON.stringify(this.connections));
	}

	static updatePreviewPath(me: MouseEvent) {
		if (this.currentSourceConnector) {
			const s = this.currentSourceConnector.getPosition();
			const e = new Position(me.x, me.y);

			if (this.previewPath) {
				this.updatePath(this.previewPath, s, e);
			} else {
				this.previewPath = this.addPath(s, e, "#c2c2c2");
			}
		}
	}
}
