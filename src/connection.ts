import Connector from "./connector";

export default class Connection {
	from: Connector;
	to: Connector;
	path: SVGPathElement;

	constructor(from: Connector, to: Connector, path: SVGPathElement) {
		this.from = from;
		this.to = to;
		this.path = path;
	}
}
