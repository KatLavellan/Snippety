import EventEmitter from "events";

export interface ReaderResult{
	ClassList : string[];
	Area : [number, number];
	Children : ReaderResult[];
	DebugText : string;
};

export default abstract class Reader extends EventEmitter {
	
	Results : ReaderResult[] = [];
	Text : string;
	Element : HTMLElement;
	Nodes : string[] = ["\n", "\t"];

	Relevants : number[] = [];

	Modifiers : {[key:string] : string[]} = {
		"brackets": ["{", "}"],
		"punctuation": [";", ",", ":"]
	};
	
	File : string;
	constructor(file : string, element : HTMLElement, value : string){
		super();
		this.Text = value;
		this.File = file;
		this.Element = element;
	}

	IsInArea(area : [number, number], area2 : [number, number]){
		//console.log(area, area2);
		let result = area[0] < area2[1] && area2[0] < area[1];
		//console.log(result);
		return result;
	}

	GetIntersection(a : [number, number], b: [number, number]){
		let min = (a[0] < b[0]  ? a : b)
		let max = (min == a ? b : a)
	
		//min ends before max starts -> no intersection
		if (min[1] < max[0])
			return "";//the ranges don't intersect
	
		return this.Text.substring(max[0], (min[1] < max[1] ? min[1] : max[1]));
	}
	IsInScope(area : [number, number]){
		if (this.Relevants.length == 0){
			return true;
		}
		let relevants = this.GetRelevants();
		for (let i = 0; i < relevants.length; i++){
			if (this.IsInArea(area, relevants[i])){
				 return true; 
			}
		}
		return false;
	}
	SetLayers(array : ReaderResult[]){
		let i = 0;
		let oldLength = array.length;
		while(i < array.length){
			let item = array[i];
			let filtered : ReaderResult[] = [];
			for (let x = 0; x < array.length; x++){
				if (x != i){
					if (item.Area[0] <= array[x].Area[0] &&
						array[x].Area[1] <= item.Area[1]){
						filtered.push(array[x]);
						array.splice(x, 1);
						x--;
					}
				}
			}
			if (filtered.length > 0){
				//console.log("adding  ", filtered," to ", item.Children)
				item.Children = item.Children ? [...item.Children, ...filtered] : filtered;
			}
			i++;
		}
		if (oldLength != array.length){
			this.SetLayers(array);
		}
		for (let i = 0; i < array.length; i++){
			this.SetLayers(array[i].Children);
		}
	}

	Splitter(value: string, items : string[]){
		let result = [];
		let last = "";
		for (let i = 0; i < value.length; i++){
			if (items.includes(value.at(i))){
				if (last.length > 0){
					result.push(last);
					last = "";
				}
				result.push(value.at(i));
			}else{
				last+= value.at(i);
			}
		}
		if (last.length > 0){
			result.push(last);
			last = "";
		}
		return result;
	}

	GetRelevants() : [number, number][]{
		let results : [number, number][] = [];
		for (let i = 0; i < this.Relevants.length; i+=2){
			results.push([this.Relevants[i], (this.Relevants.length - 1 == i) ? this.Text.length : this.Relevants[i + 1] ])
		}
		return results;
	}

	AddText(parent : HTMLElement, area : [number, number]){
		if (this.IsInScope(area)){
			let nodes = [...this.Nodes];
			for (let mod in this.Modifiers){
				nodes.push(...this.Modifiers[mod])
			}
			let relevants = this.GetRelevants();
			let text = (relevants.length > 0) ? "" : this.Text.substring(area[0], area[1]);
			for (let i = 0; i < relevants.length; i++){
				text += this.GetIntersection(relevants[i], area);
			}
			let split = this.Splitter(text, nodes);
			for (let i = 0; i < split.length; i++){
				if (nodes.includes(split[i])){
					let elem = document.createElement(split[i] == "\n" ? "br" : "span");
					let found = false;
					for (let mod in this.Modifiers){
						if (this.Modifiers[mod].includes(split[i])){
							elem.classList.add(mod);
							elem.innerText = split[i];
							found = true;
							break;
						}
					}
					if (split[i] == "\t"){
						elem.classList.add("tab");
						elem.innerHTML = "&#9;";
					}
					parent.append(elem);
				}else{
					let textNode = document.createTextNode(split[i]);
					parent.append(textNode);
				}
			}
		}
	}

	LastPos = 0;
	CreateSpan(parent : HTMLElement, result : ReaderResult) {
		if (this.IsInScope(result.Area)){
			for (let key of result.Children){
				key.DebugText = this.Text.substring(key.Area[0], key.Area[1]);
			}
			result.Children.sort((a, b)=>{return a.Area[0] - b.Area[0];});
			let elem = document.createElement("span");
			elem.classList.add(...result.ClassList);
			if (result.Children.length == 0){
				if (this.IsInScope(result.Area)){
					this.AddText(elem, result.Area);
				}
			}else{
				let startPos = result.Area[0];
				if (result.Children.length > 0){
					let lastPos = startPos;
					for (let i = 0; i < result.Children.length; i++){
						if (lastPos != result.Children[i].Area[0]){
							this.AddText(elem, [lastPos, result.Children[i].Area[0]]);
						}
						this.CreateSpan(elem, result.Children[i]);
						lastPos = result.Children[i].Area[1];
					}
					let finalElem = result.Children[result.Children.length - 1];
					if (finalElem.Area[1] < result.Area[1]){
						this.AddText(elem, [finalElem.Area[1], result.Area[1]]);
					}
					
				}
			}
			parent.append(elem);
		}
	}
	Finished = false;

	SetElements(doSetLayers = false){
		let temp : ReaderResult[] = [...this.Results];
		for (let key of temp){
			key.DebugText = this.Text.substring(key.Area[0], key.Area[1]);
		}
		temp.sort((a, b)=>{return a.Area[0] - b.Area[0];});
		//console.error("oops", temp);
		if (doSetLayers){
			this.SetLayers(temp);
		}
		let elements : HTMLElement[] = [];
		let lastPos = 0;
		
		for (let i = 0; i < temp.length; i++){
			if (lastPos != temp[i].Area[0]){
				this.AddText(this.Element, [lastPos, temp[i].Area[0]]);
			}
			this.CreateSpan(this.Element, temp[i]);
			lastPos = temp[i].Area[1];
		}
		if (lastPos != this.Text.length){
			this.AddText(this.Element, [lastPos, this.Text.length]);
		}
		
		this.Element.append(...elements);
		this.Finished = true;
		this.emit("finish");
	}
}