import BaseNode from "./base-node";
import Connection from "./connection";
import Connector from "./connector";
import Position from "./position";

export default class NodeEditor {
	private static offset = new Position();

	// Element references
	public static rootElement: HTMLElement | null;
	public static viewportElement: HTMLElement | null;
	private static svgElement: HTMLElement | null;

	// Nodes and connections
	static nodes: BaseNode[] = [];
	static connections: Connection[] = [];

	private static currentSourceConnector?: Connector;

	// Connection Preview Path

	private static previewPath: SVGPathElement | null;
	private static previewPathUpdateListener: (me: MouseEvent) => void;

	// Panning

	static panning = false;
	private static panListerener: (me: MouseEvent) => void;
	private static startPanListerener: (me: MouseEvent) => void;
	private static endPanListerener: (me: MouseEvent) => void;

	// Methods

	static init() {
		this.rootElement = document.getElementById("NodeEditor");
		this.viewportElement = document.getElementById("EditorViewport");
		this.svgElement = document.getElementById("Connections");

		this.startPanListerener = this.onStartPan.bind(this);
		this.panListerener = this.onPan.bind(this);
		this.endPanListerener = this.onEndPan.bind(this);

		this.rootElement?.addEventListener("mousedown", this.startPanListerener);
	}

	static onStartPan(me: MouseEvent) {
		me.preventDefault(); // Prevents selection of elements when dragging outside the bounds of the root element.

		this.panning = true;
		window.addEventListener("mousemove", this.panListerener);
		window.addEventListener("mouseup", this.endPanListerener);
	}

	static onPan(me: MouseEvent) {
		if (this.viewportElement) {
			if (this.offset.x - me.movementX >= 0) {
				this.offset.add(-me.movementX, 0);
				this.viewportElement.style.left = -this.offset.x + "px";
			}

			if (this.offset.y - me.movementY >= 0) {
				this.offset.add(0, -me.movementY);
				this.viewportElement.style.top = -this.offset.y + "px";
			}
		}
	}

	static onEndPan(me: MouseEvent) {
		this.panning = false;
		window.removeEventListener("mousemove", this.panListerener);
		window.removeEventListener("mouseup", this.endPanListerener);
	}

	static addNode(node: BaseNode) {
		this.nodes.push(node);
		this.viewportElement?.appendChild(node.rootElement);
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

	static getConnectionStartConnector() {
		return this.currentSourceConnector;
	}

	static isConnectionInProgress() {
		return this.currentSourceConnector != null;
	}

	static startConnection(source: Connector): void {
		if (this.currentSourceConnector != null) {
			console.warn(
				"Connection creation already in progress - cannot start another."
			);
			return;
		}

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

		this.removePreviewPath();

		if (this.currentSourceConnector && destination) {
			if (
				this.connections.find(
					(c) => c.from == this.currentSourceConnector && c.to == destination
				)
			) {
				console.warn("This connection already exists.");
				this.currentSourceConnector = undefined;
				return;
			}

			const s = this.currentSourceConnector.getPosition();
			const e = destination.getPosition();

			let path = this.addPath(s, e);

			if (path) {
				let c = new Connection(this.currentSourceConnector, destination, path);

				this.connections.push(c);
			}

			this.currentSourceConnector = undefined;
		} else {
			console.warn(
				"Connection could not be completed - source or desitnation is null."
			);
		}
	}

	static cancelConnection() {
		this.removePreviewPath();
		this.currentSourceConnector = undefined;
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

			const rect = (me.currentTarget as HTMLElement).getBoundingClientRect();
			const e = new Position(me.x, me.y)
				.add(-rect.left, -rect.top) // adjust for position of the node editor itself
				.add(this.offset.x, this.offset.y); // adjust for any panning done

			if (this.previewPath) {
				this.updatePath(this.previewPath, s, e);
			} else {
				this.previewPath = this.addPath(s, e, "#c2c2c2");
			}
		}
	}

	static removePreviewPath() {
		if (this.previewPath) {
			this.previewPath.remove();
			this.previewPath = null;
		}
	}
}
