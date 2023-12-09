
export interface ReaderResult{
	ClassList : string[];
	Area : number[];
	Children : ReaderResult[];
};

export default abstract class Reader{
	
	Results : ReaderResult[] = [];
	Text : string;
	Element : HTMLElement;
	Nodes : string[] = ["\n", "\t"];
	abstract Brackets : string[];
	constructor(element : HTMLElement, value : string){
		this.Text = value;
		this.Element = element;
	}

	SetLayers(array : ReaderResult[]){
		let i = 0;
		let oldLength = array.length;
		while(i < array.length){
			let item = array[i];
			let filtered : ReaderResult[] = [];
			for (let x = i + 1; x < array.length; ){
				if (item.Area[0] <= array[x].Area[0] &&
					array[x].Area[1] <= item.Area[1]){
					filtered.push(array[x]);
					array.splice(x, 1);
				}else{
					x++;
				}
			}
			item.Children = item.Children ? [...item.Children, ...filtered] : filtered;
			
			i++;
		}
		if (oldLength != array.length){
			for (let i = 0; i < array.length; i++){
				this.SetLayers(array[i].Children);
			}
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
		let nodes = [...this.Nodes, ...this.Brackets];
		let split = this.Splitter(text, nodes);
		for (let i = 0; i < split.length; i++){
			if (nodes.includes(split[i])){
				let elem = document.createElement(split[i] == "\n" ? "br" : "span")
				if (this.Brackets.includes(split[i])){
					elem.classList.add("bracket");
					elem.innerText = split[i];
				}else if (split[i] == "\t"){
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

	SetElements(){
		let temp : ReaderResult[] = [...this.Results];
		this.SetLayers(temp);
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