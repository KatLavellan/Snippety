import "./blank.scss";

let toolTip = document.createElement("div");
toolTip.style.display = "none";
toolTip.classList.add("tooltip")

let tagName = document.createElement("span");
tagName.classList.add("isTag");
let idName = document.createElement("span");
idName.classList.add("isID");
let className = document.createElement("span");
className.classList.add("isClass");
toolTip.append(tagName, idName, className);
document.body.append(toolTip);

document.addEventListener("mouseout",(ev)=>{
	toolTip.style.display = "none";
	ev.preventDefault();
	ev.stopImmediatePropagation();
	return false;
});
/*
document.body.querySelector(".sample").addEventListener("mouseout",(ev)=>{
	toolTip.style.display = "none";
	ev.preventDefault();
	ev.stopImmediatePropagation();
	return false;
});*/
let clamp = (min : number, value : number, max : number)=>{
	return Math.max(Math.min(max,value),min);
}
function SetTooltip(ev : MouseEvent, element : any){
	let elem = element as HTMLElement;
	if (elem){ 
		toolTip.style.display = "block";
		let classText = "";
		for (let i = 0; i < elem.classList.length; i++){
			classText += "."+elem.classList[i];
		}
		tagName.innerText = elem.tagName.toLowerCase();
		idName.innerText = (elem.id ? ("#"+elem.id) : "");
		className.innerText = classText;
		toolTip.style.left = 10 + "px";
		toolTip.style.top = 10 + "px"; 
		let width = toolTip.getBoundingClientRect().width;
		let height = toolTip.getBoundingClientRect().height;
		toolTip.style.left = clamp(0, ev.clientX,  window.innerWidth - width) + "px";
		toolTip.style.top = clamp(height, ev.clientY, window.innerHeight) + "px"; 
	}

}  
document.dispatchEvent(new Event("reloaded"));
document.addEventListener("mousemove", (ev)=>{
	SetTooltip(ev, ev.target);
});