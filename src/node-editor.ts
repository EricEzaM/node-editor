import BaseNode from "./base-node";
import Connection from "./connection";
import Connector from "./connector";
import Position from "./position";

export default class NodeEditor {
	private constructor() {}

	private static offset = new Position();
	private static element: HTMLElement | null;
	private static svgElement: HTMLElement | null;

	private static currentSourceConnector: Connector | null;

	static nodes: BaseNode[] = [];
	static connections: Connection[] = [];

	static init() {
		this.element = document.getElementById("NodeEditor");
		this.svgElement = document.getElementById("Connections");
	}

	static addNode(node: BaseNode) {
		this.nodes.push(node);
		this.element?.appendChild(node.rootElement);
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

		this.currentSourceConnector = source;
	}

	static completeConnection(destination: Connector): void {
		if (this.currentSourceConnector && destination) {
			if (
				this.connections.find(
					(c) => c.from == this.currentSourceConnector && c.to == destination
				)
			) {
				console.warn("This connection already exists.");
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
}
