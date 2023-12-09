import Reader, { ReaderResult } from "./Reader";
import * as csstree from 'css-tree';
import "./CSS.scss"
import { allIndexesOf } from "./Generic";


export default class CSS extends Reader{

	Brackets : string[] = ["{", "}"];
    constructor(element : HTMLElement, value : string){
        super(element, value);
        const AST = csstree.parse(value, {
            positions : true
        });
        
        csstree.walk(AST, (node) => {
            if (node.type != "StyleSheet"){
                console.log(node);
                let temp = node as any;
                this.Results.push({
                    ClassList: [temp.type],
                    Area: [node.loc!.start.offset, node.loc!.end.offset],
                    Children: []
                });
            }
        });
        this.SetElements();
        
    }
};