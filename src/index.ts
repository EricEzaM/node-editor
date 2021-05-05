import { node } from "webpack";
import BaseNode from "./base-node";
import NodeEditor from "./node-editor";
import Position from "./position";
import "./styles/main.scss";

window.addEventListener("load", function () {
	NodeEditor.init();
});

window.addEventListener("load", function (e) {
	let node = new BaseNode("Some Title", new Position(300, 100));
	node.addInput("Test Input");
	node.addOutput("Output Test Long Test");
	NodeEditor.addNode(node);

	node = new BaseNode("Some Title", new Position(600, 150));
	node.addInput("Test Input");
	node.addOutput("Output Test Long Test");
	NodeEditor.addNode(node);
});

document.getElementById("print")?.addEventListener("click", function (e) {
	NodeEditor.getJson();
});

document.getElementById("add-node")?.addEventListener("click", function (e) {
	let node = new BaseNode("New Node", new Position(50, 50));
	node.addInput("New Input");
	node.addOutput("New Output");
	NodeEditor.addNode(node);
});

// @ts-ignore
if (module.hot) module.hot.accept();
