import Reader, { ReaderResult } from "./Reader";
import "./TS.scss"
import * as ts from "typescript";
import config from "../../tsconfig.json";
import initSwc, { ModuleItem, parse, parseSync, transform, transformSync } from "@swc/wasm-web";

export default class TS extends Reader{
	Brackets : string[] = ["{", "}", "(", ")"];
	Modifiers : Record<string, string[]> = {
		"brackets": ["{", "}"],
		"punctuation": [";", ",", ":", "."],
		"parantheses": ["(", ")"]
	};
    constructor(file : string, element : HTMLElement, value : string){
        super(file, element, value);
		
        this.load(value);
    }

	addItem(elem : any) : ReaderResult {
		//if (elem.type){
			let type = elem.type;
			if (!type){
				if (elem.body.type){
					type = elem.body.type;
				}
				console.error(elem);
			}
			if (elem.type == "TsKeywordType" && elem.kind){
				type = elem.kind;
			}
			console.log(elem);
			let result : ReaderResult= {
				ClassList : [type],
				Area : [elem.span.start - 1, elem.span.end - 1],
				Children : [],
				DebugText: ""
			};
			//console.log("looking for ", elem, elem.body, elem.decl)
			if (elem.body){
				if (Array.isArray(elem.body)){
					for (let i = 0; i < elem.body.length; i++){
						let item = elem.body[i];
						result.Children.push(this.addItem(item));
					}
				}else{
					result.Children.push(this.addItem(elem.body));
				}
			}if (elem.stmts){
				if (Array.isArray(elem.stmts)){
					for (let i = 0; i < elem.stmts.length; i++){
						let item = elem.stmts[i];
						result.Children.push(this.addItem(item));
					}
				}else{
					console.warn("adding singular ", elem.body);
					result.Children.push(this.addItem(elem.body));
				}
			}
			if (elem.arguments){
				for (let item of elem.arguments){
					result.Children.push(this.addItem(item.expression));
				}
			}
			if (elem.params){
				for (let item of elem.params){
					result.Children.push(this.addItem(item));
				}
			}
			if (elem.elements){
				for (let item of elem.elements){
					result.Children.push(this.addItem(item.expression));
				}
			}
			if (elem.implements){
				for (let item of elem.implements){
					result.Children.push(this.addItem(item));
				}
			}
			if (elem.extends){
				for (let item of elem.extends){
					result.Children.push(this.addItem(item));
				}
			}
			let values = ["declaration", "returnType", "property", "callee", "expression", "identifier", "id", "decl", "key", "function", "elemType", "value", "superClass", "pat", "typeAnnotation"];
			for (let key of values){
				if (elem[key] && typeof elem[key] === "object"){
					result.Children.push(this.addItem(elem[key]));
				} 
			}
			if (elem.Type == "TsPropertySignature"){
				console.error(elem);
			}
			//if (!elem.hasOwnProperty("function")){
			//	if (elem.key && typeof elem.key === "object"){
			//		result.Children.push(this.addItem(elem.key));
			//	} 
			//}
			/*if (elem.key && typeof elem.key === "object"){
				console.log("Checking ", elem.key)
				result.Children.push(this.addItem(elem.key));
			} */
			//result.Children = result.Children.filter((a)=>{return a != undefined; })
			//result.Children.sort((a,b)=>{return a.Area[0] - b.Area[0];})
			//console.error(result.Children);
			//console.error("Creating ", result)
			return result;
		//}
		return undefined;
	}

	async load(value : string){
		await initSwc();
		//let result = ts.createSourceFile(this.File, "// @ts-expect-error\n"+value, ts.ScriptTarget.ESNext);
		let result = parseSync(value,{
			comments:true,
			syntax: "typescript",
			target: "es2022"

		});

		for (let i = 0; i < result.body.length; i++){
			let item = result.body[i];
			let res = this.addItem(item);
			if (res){
				this.Results.push(res);
			}
		}
		/*const parsed = await parser.parseSource(value);
		for (let i = 0; i < parsed.declarations.length; i++){
			let decl = parsed.declarations[i];
			this.Results.push({
				ClassList:[decl.name],
				Area:[decl.start, decl.end],
				Children: []
			});
		}*/
        this.SetElements(true);
	}
};