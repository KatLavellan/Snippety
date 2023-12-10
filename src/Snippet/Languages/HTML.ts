import Reader, { ReaderResult } from "./Reader";
import "./HTML.scss"
import { allIndexesOf } from "../Generic";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import {parse} from "svelte/compiler";
import { TemplateNode } from "svelte/types/compiler/interfaces";

export default class HTML extends Reader{

	Modifiers : {[key:string] : string[]} = {
		"brackets": ["<", ">", "!", "/"]
	};
	Brackets : string[] = ["<", ">", "!", "/"];
	Nodes : string[] = ["\n", "\t"];
	ReadNode(elem : TemplateNode) : ReaderResult {
		let newResult : ReaderResult = {
			ClassList : [elem.type],
			Children: [],
			Area: [elem.start, elem.end],
			DebugText: ""
		}
		if (elem.type == "Attribute"){
			if (elem.value && elem.value != true){
				for (let i = 0; i < elem.value.length; i++){
					let res = this.ReadNode(elem.value[i]);
					if (res.ClassList.at(0) == "Text"){
						res.Area[0] -= 1;
						res.Area[1] += 1;
					}
					newResult.Children.push(res);
				}
			}
		}
		if (elem.attributes?.length > 0){ 
			for (let i = 0; i < elem.attributes.length; i++){
				newResult.Children.push(this.ReadNode(elem.attributes[i]));
			}
		}
		if (elem.children?.length > 0){ 
			for (let i = 0; i < elem.children.length; i++){
				newResult.Children.push(this.ReadNode(elem.children[i]));
			}
		}
		//console.log(elem);
		return newResult;
	}

    constructor(file : string, element : HTMLElement, value : string){
        super(file, element, value);
        const AST = parse(value);
        for (let i = 0; i < AST.html.children.length; i++){
			this.Results.push(this.ReadNode(AST.html.children[i]));
		}
        this.SetElements();
        
    }
};