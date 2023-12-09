import "./Snippet.scss";
import "./CSS.scss";
import Reader from "./Reader";
import CSS from "./CSS";
import { allIndexesOf } from "./Generic";
import HTML from "./HTML";
import TS from "./TS";

export enum SnippetType{
    INLINE, INBETWEEN_LINES, BIG
}

export enum LanguageType{
    JS = "js",
    TS = "ts",
    CSS = "css",
	HTML = "html"
}

let options : Record<string, any> = { 
    css: CSS ,
    html: HTML ,
    ts: TS 
};

export default class Snippet{

    Type : LanguageType = LanguageType.CSS;
    Base : HTMLElement;
    Lines : HTMLElement;
    Element : HTMLElement;
    constructor(element : HTMLElement, file? : string, type? : LanguageType){

        this.Base = element;
        this.Lines = document.createElement("aside");
        this.Element = document.createElement("main");
        this.Base.append(this.Lines, this.Element);
        let url = this.Base.getAttribute("data-url");
        if(file || url){
            this.Load(file ? file : url, type);
        } else {
            // eh
        }
    }



    async Load(file : string, type? : LanguageType){
        let actualType = type ? type : (file.substring(file.lastIndexOf(".") + 1).toLowerCase());
        this.Base.classList.add(actualType);
       // console.log(actualType);
        let value = (await import(`../Snippets/${file}`)).default;
        value = value.replaceAll("\r", "");
        let lineCount = allIndexesOf(value, "\n").length;
        for (let i = 0; i < lineCount + 1; i++){
            let elem = document.createElement("div");
            elem.innerText = ""+(i + 1);
            this.Lines.append(elem);
        }
        if (options.hasOwnProperty(actualType)){
            let type = options[actualType];
            let reader = new type(file, this.Element, value);
        }
    }
}