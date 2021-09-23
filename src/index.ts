import { node } from "webpack";
import BaseNode from "./base-node";
import NodeEditor from "./node-editor";
import Position from "./position";
import "./styles/main.scss";

window.addEventListener("load", function () {
	NodeEditor.init();
});

window.addEventListener("load", function (e) {
	// let node = new BaseNode("Some Title", new Position(300, 100));
	// node.addInput("Test Input");
	// node.addOutput("Output Test Long Test");
	// NodeEditor.addNode(node);
	// node = new BaseNode("Some Title", new Position(600, 150));
	// node.addInput("Test Input");
	// node.addOutput("Output Test Long Test");
	// NodeEditor.addNode(node);
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

document.getElementById("add-node-1")?.addEventListener("click", function (e) {
	let node = new BaseNode("Get File", new Position(50, 50));
	node.addOutput("File Location");
	NodeEditor.addNode(node);
});

document.getElementById("add-node-2")?.addEventListener("click", function (e) {
	let node = new BaseNode("Get PDF Text", new Position(50, 50));
	node.addInput("PDF File Location");
	node.addOutput("Page Data (list)");
	NodeEditor.addNode(node);
});

document.getElementById("add-node-3")?.addEventListener("click", function (e) {
	let node = new BaseNode("Extract Tables", new Position(50, 50));
	node.addInput("Page Data (list)");
	node.addOutput("Dataframe");
	NodeEditor.addNode(node);
});

document.getElementById("add-node-4")?.addEventListener("click", function (e) {
	let node = new BaseNode("Read PDF", new Position(50, 50));
	node.addInput("PDF File Location");
	node.addOutput("PDF Data");
	node.addOutput("Total Pages");
	NodeEditor.addNode(node);
});

document.getElementById("add-node-5")?.addEventListener("click", function (e) {
	let node = new BaseNode("To CSV", new Position(50, 50));
	node.addInput("Output Path");
	node.addInput("Dataframe");
	NodeEditor.addNode(node);
});

document.getElementById("add-node-6")?.addEventListener("click", function (e) {
	let node = new BaseNode("Constant String", new Position(50, 50));
	node.addOutput("Value");
	NodeEditor.addNode(node);
});

document.getElementById("add-node-7")?.addEventListener("click", function (e) {
	let node = new BaseNode("Find Text", new Position(50, 50));
	node.addInput("PDF Data");
	node.addOutput("Results Dataframe");
	NodeEditor.addNode(node);
});

// @ts-ignore
if (module.hot) module.hot.accept();
