import BaseNode from "./base-node";
import NodeEditor from "./node-editor";
import Position from "./position";
import "./styles/main.scss";

window.addEventListener("load", function () {
	NodeEditor.init();
});

window.addEventListener("load", function (e) {
	var node = new BaseNode("Some Title", new Position(300, 100));
	node.addInput("Test Input");
	node.addOutput("Output Test Long Test");

	var node = new BaseNode("Some Title", new Position(600, 150));
	node.addInput("Test Input");
	node.addOutput("Output Test Long Test");
});

// @ts-ignore
if (module.hot) module.hot.accept();
