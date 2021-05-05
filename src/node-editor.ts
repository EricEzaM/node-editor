import BaseNode from "./base-node";
import Connector from "./connector";
import Position from "./position";

export default class NodeEditor {
	private constructor() {}

	private static offset = new Position();
	private static element: HTMLElement | null;
	private static svgElement: HTMLElement | null;

	static currentFromOutput: Connector;
	static currentToInput: Connector;

	static nodes: BaseNode[] = [];

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
