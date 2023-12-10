import Reader, { ReaderResult } from "./Reader";
import * as csstree from 'css-tree';
import "./CSS.scss"
import { allIndexesOf } from "../Generic";


export default class CSS extends Reader{

	Modifiers : {[key:string] : string[]} = {
		"brackets": ["{", "}"],
		"punctuation": [":", ";"]
	};
    constructor(file : string, element : HTMLElement, value : string){
        super(file, element, value);
        const AST = csstree.parse(value, {
            positions : true,
			onComment:(comment, loc)=>{
				if (comment == "relevant"){
					this.Relevants.push(loc.end.offset);
					/*this.Results.push({
						ClassList: ["RemovedComment"],
						Area: [loc.start.offset, loc.end.offset],
						Children: [],
						DebugText: ""
					});*/
				}else if (comment == "irrelevant"){
					this.Relevants.push(loc.start.offset);
					/*this.Results.push({
						ClassList: ["RemovedComment"],
						Area: [loc.start.offset, loc.end.offset],
						Children: [],
						DebugText: ""
					});*/
				}else{
					
					this.Results.push({
						ClassList: ["Comment"],
						Area: [loc.start.offset, loc.end.offset],
						Children: [],
						DebugText: ""
					});
				}
			}
        });
        
        csstree.walk(AST, (node) => {
            if (node.type != "StyleSheet"){
                let temp = node as any;
                this.Results.push({
                    ClassList: [temp.type],
                    Area: [node.loc!.start.offset, node.loc!.end.offset],
                    Children: [],
					DebugText: ""
                });
            }
        });

        this.SetElements(true);
        
    }
};