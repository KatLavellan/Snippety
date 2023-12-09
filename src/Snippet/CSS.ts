import Reader, { ReaderResult } from "./Reader";
import * as csstree from 'css-tree';
import "./CSS.scss"
import { allIndexesOf } from "./Generic";


export default class CSS extends Reader{

	Brackets : string[] = ["{", "}"];
    constructor(file : string, element : HTMLElement, value : string){
        super(file, element, value);
		//console.log(value);
        const AST = csstree.parse(value, {
            positions : true
        });
        
        csstree.walk(AST, (node) => {
            if (node.type != "StyleSheet"){
               // console.log(node);
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