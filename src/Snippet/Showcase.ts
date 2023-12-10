import {Host} from "./Constants";
import Snippet from "./Snippet";

interface SnippetDetails{
	Option? : string;
	Source : string;
	Active : boolean;
	ID : number;
	Header : string;
	Element : Element;
}

export default class Showcase{
	private AreSnippetsIdentical(elements : HTMLCollectionOf<Element>) {
		let type;
		for (let i = 0; i < elements.length; i++){
			if (!type){
				type = elements[i].getAttribute("data-type")
			}
			if (type != elements[i].getAttribute("data-type")){
				return false;
			}
		}
		return true;
	}

	Stage : Element;
	Base : Element;
	Frame : HTMLIFrameElement;
	Left : HTMLElement;
	Right : HTMLElement;
	constructor(element : HTMLElement){
		this.Base = element;
		this.Stage = this.Base.querySelector("code-stage");
		if (this.Stage){
			this.load();
		}

	}

	async GetCodeSnippetById(id : number){
		let snippets = this.Base.getElementsByTagName("code-snippet");
		for (let i = 0; i < snippets.length; i++){
			let thisID = parseInt(snippets[i].getAttribute("data-snippet-id"));
			if (thisID == id){
				return snippets[i];
			}
		}
		return undefined;
	}

	async GetNewInnerText(snippets : HTMLCollectionOf<Element>){
		let baseFile = "SampleBase.snippet.css";
		let activeTexts : {[key:string]:boolean} = {};
		let innerHTMLText = "";//"<style>"+((await import(`../Snippets/${baseFile}`)).default)+"</style>";
		console.log("testing ", baseFile, " receiving ", innerHTMLText);
		for (let i = 0; i < snippets.length; i++){
			let type = snippets[i].getAttribute("data-type");
			let file = snippets[i].getAttribute("data-url")
			let fileData = (await import(`../Snippets/${file}`)).default;
			let headerData = "";
			let bodyData = "";
			if (type == "css"){
				headerData = "<style>"+ (fileData)+"</style>";
			}else if (["js","ts"].includes(type)){
				headerData = "<script type=\"text/javascript\">"+ (fileData)+"</script>";
			}else{
				bodyData = fileData;
			}
			let result : SnippetDetails = {
				Source : bodyData,
				Active : true,
				Header: headerData,
				ID : parseInt(snippets[i].getAttribute("data-snippet-id")),
				Element : snippets[i]
			};

			let option = snippets[i].getAttribute("data-option");
			if (option){
				snippets[i].classList.add("activatable");
				if (activeTexts.hasOwnProperty(option)){
					result.Active = false;
				}else{	
					activeTexts[option] = true;
					snippets[i].classList.add("activated");
				}
				result.Option = option;

				snippets[i].addEventListener("click", (ev)=>{
					this.enable(snippets[i]);
				})
			}
			this.Snippets.push(result);
			//console.log(iframe.contentDocument.body.innerHTML);
		}
		//return innerHTMLText;
	}

	Snippets : SnippetDetails[] = [];


	getBodyText(){
		return this.Snippets.map(
			(a)=>{
				if (a.Active){ return a.Source; }else{
					return "";
				}
			}).join("");
	}
	getHeaderText(){
		return this.Snippets.map(
			(a)=>{
				if (a.Active){ return a.Header; }else{
					return "";
				}
			}).join("");
	}

	async enable(snippet : Element){
		let snippets = this.Base.getElementsByTagName("code-snippet");
		let curOption = snippet.getAttribute("data-option");
		for (let i = 0; i < snippets.length; i++){
			if (snippets[i].getAttribute("data-option") == curOption){
				snippets[i].classList.remove("activated");
			}
		}
		let id = parseInt(snippet.getAttribute("data-snippet-id"));
		let temp : SnippetDetails;
		for (let snippet of this.Snippets){
			if (snippet.Option == curOption){
				console.log(id, "==", snippet.ID)
				snippet.Active = (id == snippet.ID);
				if (id == snippet.ID){
					temp = snippet;
				}
			}
		}
		snippet.classList.add("activated");
		if (temp && temp.Header.length > 0){
			this.Frame.contentDocument.body.querySelector("#code").innerHTML = this.getHeaderText();
		}else{
			this.Frame.contentDocument.body.querySelector(".sample").innerHTML = this.getBodyText();
		}
	}

	async load(){
		
		let snippets = this.Base.getElementsByTagName("code-snippet");
		let left : Element[] = [];
		let right : Element[] = [];
		for (let i = 0; i < snippets.length; i++){
			if (snippets[i].getAttribute("data-location") == "right"){
				right.push(snippets[i]);
			}else {
				left.push(snippets[i]);
			}
		}
		if (left.length > 0){
			this.Left = document.createElement("aside");
			this.Left.append(...left);
			this.Base.append(this.Left);
		}
		this.Base.append(this.Stage);
		if (right.length > 0){
			this.Right = document.createElement("aside");
			this.Right.append(...right);
			this.Base.append(this.Right);
		}
		let iframe = document.createElement("iframe");
		this.Frame = iframe;
		iframe.src = Host + "/" + "blank.html";
		this.Stage.append(iframe);

		
		let promise = new Promise<boolean>((res)=>{
			iframe.addEventListener("load", async ()=>{
				//iframe.contentDocument.body.addEventListener("load", async ()=>{
					setTimeout(()=>{res(true);}, 20);
				//});
			});
		});
		let loaded = this.GetNewInnerText(snippets);
		await Promise.all([promise, loaded]);

		let options : {[key:string] : any[]}= {};
		iframe.contentDocument.body.querySelector("#code").innerHTML = this.getHeaderText();
		iframe.contentDocument.body.querySelector(".sample").innerHTML = this.getBodyText();
		iframe.contentDocument.addEventListener("reloaded", ()=>{
			iframe.contentDocument.body.querySelector("#code").innerHTML = this.getHeaderText();
			iframe.contentDocument.body.querySelector(".sample").innerHTML = this.getBodyText();
		});
		iframe.addEventListener("load", ()=>{
			iframe.contentDocument.body.querySelector("#code").innerHTML = this.getHeaderText();
			iframe.contentDocument.body.querySelector(".sample").innerHTML = this.getBodyText();
		});
	}
}