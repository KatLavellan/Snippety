import {Host} from "./Constants";

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
	constructor(element : HTMLElement){
		this.Base = element;
		this.Stage = document.querySelector("code-stage");
		if (this.Stage){
			this.load();
		}

	}

	async GetNewInnerText(snippets : HTMLCollectionOf<Element>){
		let baseFile = "SampleBase.snippet.css";
		let innerHTMLText = "";//"<style>"+((await import(`../Snippets/${baseFile}`)).default)+"</style>";
		console.log("testing ", baseFile, " receiving ", innerHTMLText);
		for (let i = 0; i < snippets.length; i++){
			let type = snippets[i].getAttribute("data-type");
			let file = snippets[i].getAttribute("data-url")
			let fileData = (await import(`../Snippets/${file}`)).default;
			//console.log("adding ", type, fileData)
			if (type == "html"){
				innerHTMLText += fileData;
			}else if (type == "css"){
				innerHTMLText += "<style>"+ (fileData)+"</style>";
			}else{
				console.error("adding unknown type ", type)
			}
			//console.log(iframe.contentDocument.body.innerHTML);
		}
		return innerHTMLText;
	}

	async load(){
		
		let snippets = document.getElementsByTagName("code-snippet");
		let side = document.createElement("aside");
		this.Base.appendChild(side);
		side.append(...snippets);
		this.Base.append(this.Stage);
		let iframe = document.createElement("iframe");
		iframe.src = Host + "/" + "blank.html";
		this.Stage.append(iframe);
		let identical = this.AreSnippetsIdentical(snippets);
		if (identical){
			
		}else{
			let promise = new Promise<boolean>((res)=>{
				iframe.addEventListener("load", async ()=>{
					//iframe.contentDocument.body.addEventListener("load", async ()=>{
						setTimeout(()=>{res(true);}, 20);
					//});
				});
			});
			let loaded = this.GetNewInnerText(snippets);
			await Promise.all([promise, loaded]);

			iframe.contentDocument.body.querySelector(".sample").innerHTML += (await loaded);
			iframe.contentDocument.addEventListener("reloaded", async ()=>{
				iframe.contentDocument.body.querySelector(".sample").innerHTML = (await loaded);
			});
			iframe.addEventListener("load", async ()=>{
				iframe.contentDocument.body.querySelector(".sample").innerHTML = (await loaded);
			});
		}
	}
}