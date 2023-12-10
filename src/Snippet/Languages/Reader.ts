
export interface ReaderResult{
	ClassList : string[];
	Area : number[];
	Children : ReaderResult[];
	DebugText : string;
};

export default abstract class Reader{
	
	Results : ReaderResult[] = [];
	Text : string;
	Element : HTMLElement;
	Nodes : string[] = ["\n", "\t"];

	Modifiers : {[key:string] : string[]} = {
		"brackets": ["{", "}"],
		"punctuation": [";", ",", ":"]
	};
	abstract Brackets : string[];
	File : string;
	constructor(file : string, element : HTMLElement, value : string){
		this.Text = value;
		this.File = file;
		this.Element = element;
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

	AddText(parent : HTMLElement, text : string){

		let nodes = [...this.Nodes];
		for (let mod in this.Modifiers){
			nodes.push(...this.Modifiers[mod])
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

	LastPos = 0;
	CreateSpan(parent : HTMLElement, result : ReaderResult) {
		for (let key of result.Children){
			key.DebugText = this.Text.substring(key.Area[0], key.Area[1]);
		}
		result.Children.sort((a, b)=>{return a.Area[0] - b.Area[0];});
		let elem = document.createElement("span");
		elem.classList.add(...result.ClassList);
		if (result.Children.length == 0){
			this.AddText(elem, this.Text.substring(result.Area[0], result.Area[1]));
		}else{
			let startPos = result.Area[0];
			if (result.Children.length > 0){
				let lastPos = startPos;
				for (let i = 0; i < result.Children.length; i++){
					if (lastPos != result.Children[i].Area[0]){
						this.AddText(elem, this.Text.substring(lastPos, result.Children[i].Area[0]));
					}
					this.CreateSpan(elem, result.Children[i]);
					lastPos = result.Children[i].Area[1];
				}
				let finalElem = result.Children[result.Children.length - 1];
				if (finalElem.Area[1] < result.Area[1]){
					this.AddText(elem, this.Text.substring(finalElem.Area[1], result.Area[1]));
				}
				
			}
		}
		parent.append(elem);
	}

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
				let value = this.Text.substring(lastPos, temp[i].Area[0]);
				this.AddText(this.Element, value);
			}
			this.CreateSpan(this.Element, temp[i]);
			lastPos = temp[i].Area[1];
		}
		if (lastPos != this.Text.length){
			this.AddText(this.Element, this.Text.substring(lastPos));
		}
		
		this.Element.append(...elements);
	}
}