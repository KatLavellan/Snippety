import "./Snippet.scss";
import CSS from "./Languages/CSS";
import { allIndexesOf } from "./Generic";
import HTML from "./Languages/HTML";
import TS from "./Languages/TS";
import Showcase from "./Showcase";

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
    ts: TS ,
    js: TS 
};

export default class Snippet{

    Type : LanguageType = LanguageType.CSS;
    Base : HTMLElement;
    Lines : HTMLElement;
    Main : HTMLElement;
    Element : HTMLElement;
	Nav : HTMLElement;

	static Initialise(){
		let snippetShowcaseElements = document.getElementsByTagName("code-showcase");
		let snippetElements = document.getElementsByTagName("code-snippet");
		for (let i = 0; i < snippetElements.length; i++){
			let element = snippetElements[i];
			new Snippet(element as HTMLElement);
		}		
		for (let elem of snippetShowcaseElements){
			new Showcase(elem as HTMLElement);

		}

	}
    constructor(element : HTMLElement, file? : string, type? : LanguageType){

        this.Base = element;
        this.Lines = document.createElement("aside");
        this.Main = document.createElement("main");
        this.Element = document.createElement("article");
		this.Nav = document.createElement("nav");
		let fileType = document.createElement("span");
		fileType.classList.add("fileType");
		this.Main.append(this.Lines, this.Element)
        this.Base.append(this.Nav, this.Main);
        let url = this.Base.getAttribute("data-url");
		file = file ? file : url;
        let actualType = type ? type : (file.substring(file.lastIndexOf(".") + 1).toLowerCase());
        this.Base.classList.add(actualType);
		this.Base.setAttribute("data-type", actualType);
		fileType.classList.add(actualType);
		fileType.innerText = actualType;
		this.Nav.append(fileType);
        if (this.Base.getAttribute("data-hidden") == "true"){
			this.Base.style.display="none";
		}else{
			if(file || url){
				this.Load(file ? file : url, actualType);
			} else {
				// eh
			}
			if (this.Base.getAttribute("data-description")){
				//this.Nav.innerText = this.Base.getAttribute("data-description");
			}
		}
    }



    async Load(file : string, actualType : string){
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