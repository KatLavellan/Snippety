let source = "http://localhost:8080";

export default class Ocular{
	static GetPath(){
		let path = window.location.href.substring(window.location.href.indexOf(source) + source.length + 1);
		return path.split("/");
	}

	static Nav : HTMLElement;
	static GetFilesInPath(files : KatFile[], path : string){
		let result : KatFile[];
		for (let i = 0; i < files.length; i++){
			if (files[i].Path.indexOf(path) != -1){
				if (files[i].Type == "dir"){
					result.push(...this.GetFilesInPath(files[i].Children, path));
				}else{
					result.push(files[i]);
				}
			}
		}
		return result;
	}
	static a = 4.27;
	static k = 0.44;

	static GetSpiralAtRotation(rotation : number){
		return this.a * Math.pow(Math.E, this.k * rotation / 180 * Math.PI);
	}
	static GetSpiralRotationAtRadius(radius : number){
		return (Math.log(radius  / this.a) / Math.log(Math.E)) / this.k * 180 / Math.PI;
	}
	static Range = 211.61;
	static VerticalModifier = 0.7;

	static GetStartRotation(){
		
		return this.GetSpiralRotationAtRadius(this.Range);
	}

	static Slider<K extends keyof typeof Ocular>(property : K, min : number, max : number){
		let elem = document.createElement("div");
		elem.innerText = property;
		let aSlider = document.createElement("input");
		aSlider.type="range";
		aSlider.min =""+min;
		aSlider.max = ""+max;
		aSlider.valueAsNumber = (this[property] as number);
		console.log("setting ", property, "to", this[property]);
		aSlider.style.width="500px";
		aSlider.step="0.01" 
		aSlider.addEventListener("mousedown",()=>{
			
			let mouseMove = ()=>{
				(this[property] as any) = aSlider.valueAsNumber; 
				console.log(aSlider.valueAsNumber);
				this.Update();
				this.Draw();
			}
			mouseMove();
			document.body.addEventListener("mousemove", mouseMove);
			document.body.addEventListener("mouseup", ()=>{
				document.body.removeEventListener("mousemove", mouseMove)
			}, {once: true});
		});
		elem.append(aSlider);
		return elem;
	}

	static getGradientColor(start_color : string, end_color : string, percent : number) {
		// strip the leading # if it's there
		start_color = start_color.replace(/^\s*#|\s*$/g, '');
		end_color = end_color.replace(/^\s*#|\s*$/g, '');
	  
		// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
		if (start_color.length == 3) {
		  start_color = start_color.replace(/(.)/g, '$1$1');
		}
	  
		if (end_color.length == 3) {
		  end_color = end_color.replace(/(.)/g, '$1$1');
		}
		//console.log(start_color, end_color, percent);
		// get colors
		let start_red = parseInt(start_color.substring(0, 2), 16),
		  start_green = parseInt(start_color.substring(2, 4), 16),
		  start_blue = parseInt(start_color.substring(4, 6), 16);
	  
		let end_red = parseInt(end_color.substring(0, 2), 16),
		  end_green = parseInt(end_color.substring(2, 4), 16),
		  end_blue = parseInt(end_color.substring(4, 6), 16);
	  
		// calculate new color
		let diff_red = end_red - start_red;
		let diff_green = end_green - start_green;
		let diff_blue = end_blue - start_blue;
	  
		let n_diff_red = ((diff_red * percent) + start_red).toString(16).split('.')[0];
		let n_diff_green = ((diff_green * percent) + start_green).toString(16).split('.')[0];
		let n_diff_blue = ((diff_blue * percent) + start_blue).toString(16).split('.')[0];
	  
		// ensure 2 digits by color
		if (n_diff_red.length == 1) n_diff_red = '0' + n_diff_red
		if (n_diff_green.length == 1) n_diff_green = '0' + n_diff_green
		if (n_diff_blue.length == 1) n_diff_blue = '0' + n_diff_blue
	  
		return '#' + n_diff_red + n_diff_green + n_diff_blue;
	  };

	static Canvas : HTMLCanvasElement;
	static CanvasContext : CanvasRenderingContext2D;
	static RotationScale = 0;
	static Count = 0;
	static Initialise(){
		let path = this.GetPath();
		this.Nav = document.createElement("nav");
		let planet = document.createElement("div");
		planet.classList.add("planet");
		let center = document.createElement("div");
		center.classList.add("center");
		document.body.append(this.Nav);
		this.Nav.append(center, planet);
		this.Canvas = document.createElement("canvas");
		let observer = new ResizeObserver(()=>{
			this.Canvas.height = this.Nav.clientHeight;
			this.Canvas.width = this.Nav.clientWidth;
			this.Draw();
		})
		this.CanvasContext = this.Canvas.getContext("2d");
		observer.observe(this.Nav);
		this.Canvas.height = this.Nav.clientHeight;
		this.Canvas.width = this.Nav.clientWidth;
		this.Nav.append(this.Canvas);

		let header = document.createElement("header");
		let main = document.createElement("main");
		document.body.append(main);
		main.append(header, document.querySelector("article"))

		header.addEventListener("mousedown", (ev)=>{
			this.Nav.classList.toggle("active");
		});

		let result = __FILES;
		let categories : KatFile[] = [];
		for (let i = 0; i < result.length; i++){
			let item = result[i];
			if (item.Type == "dir"){
				categories.push(item);
			}
		}
		//console.log("startRotation:", startRotation);
		this.Count = categories.length;
		for (let i = 0; i < categories.length; i++){
			let baseRotation = 360 / categories.length * i - 27;
			this.RotationScale = 360 / categories.length;
			let elem = document.createElement("div");
			elem.classList.add("category");
			
			let found = false;
			for (let x = 0; x < categories[i].Children.length; x++){
				let child = categories[i].Children[x];
				if (child.Path.split("/")[1] == "index.html"){
					found = true;
				}
			}
			if (found){
				elem.classList.add("clickable");
				elem.addEventListener("click", ()=>{
					window.location.href = source + "/"+ categories[i].Path+ ".html";
				});
			}
			
			elem.innerText = categories[i].Path;
			elem.setAttribute("data-baseRotation", ""+baseRotation);
			this.Nav.append(elem);
			for (let x = 0; x < categories[i].Children.length; x++){
				let subCategory = categories[i].Children[x];
				if (!subCategory.Path.includes("index")){
					let temp = document.createElement("div");
					temp.classList.add("sub", "category", "clickable");
					let path = subCategory.Path.split("/");
					let cut = path[path.length - 1];
					let val = cut.split(".");
					temp.innerText = val[0];
					temp.setAttribute("data-baseRotation", ""+baseRotation);
					temp.setAttribute("data-baseX", ""+x);
					temp.addEventListener("click", ()=>{
						window.location.href = source  + "/" + subCategory.Path;
						
					});

					//console.log(this.a, this.k, newRotation, newScale);
					this.Nav.append(temp);
				}
			}
		}
		//this.Nav.classList.toggle("active");
		
		/*
		this.Nav.append(this.Slider("a", 0, 10));
		this.Nav.append(this.Slider("k", 0, 2));
		this.Nav.append(this.Slider("Range", 100, 500));
		this.Nav.append(this.Slider("VerticalModifier", 0, 2));*/
		this.Update();
	} 
	static Draw(){
		this.CanvasContext.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
		for (let i = 0; i < this.Count; i++){
			let baseRotation = this.RotationScale * i + this.GetStartRotation();
			let oldX = this.Canvas.width / 2;
			let oldY = this.Canvas.height / 2;
			//this.CanvasContext.moveTo(this.Canvas.width / 2, this.Canvas.height / 2);
			for (let c = 0; c < 1000; c++){
				this.CanvasContext.beginPath();
				let modifier =  c * 2;
				let newScale = this.GetSpiralAtRotation(modifier);
				let x = -Math.sin((modifier + baseRotation) / 180.0 * Math.PI) * (newScale) + this.Canvas.width / 2;
				let y = Math.cos((modifier + baseRotation) / 180.0 * Math.PI) * (newScale) * this.VerticalModifier + this.Canvas.height / 2;
				//console.log(x, y)
				let mult = (min : number, max: number, percent : number)=>{
					return min * (1.0 - percent) + max * percent;
				}
				
				this.CanvasContext.moveTo(mult(oldX, x, -0.2), mult(oldY, y, - 0.2));
				this.CanvasContext.lineTo(mult(oldX, x, 1.2), mult(oldY, y, 1.2));
				oldX = x; oldY = y;
				let colour = this.getGradientColor("#CDEFFB", "#5B5F6B", c / 340);
				let p = (100 - 99 * (c/340));
				if (p < 1){
					break;
				}
				this.CanvasContext.lineWidth = p;
				
				this.CanvasContext.strokeStyle = colour;
				this.CanvasContext.stroke();
				this.CanvasContext.closePath();
				
			}
			//return;
		}
	}
	static Update(){
		let startRotation = this.GetStartRotation();
		let elements = this.Nav.querySelectorAll<HTMLElement>(".category");
		for (let i = 0; i < elements.length; i++){
			let elem = elements[i];
			let baseRotation = parseFloat(elem.getAttribute("data-baseRotation"))
			if (elem.classList.contains("sub")){
				let x = parseInt(elem.getAttribute("data-baseX"));
				let newRotation = startRotation + 36 + 18 * x;
				let newScale = this.GetSpiralAtRotation(newRotation);
				elem.style.top = "calc(50% + " + Math.sin((newRotation + baseRotation) / 180.0 * Math.PI) + " * " + (newScale * this.VerticalModifier) + "px";
				elem.style.left = "calc(50% + " + Math.cos((newRotation + baseRotation) / 180.0 * Math.PI) + " * " + (newScale) + "px";
				
			}else{
				let rotation =  (baseRotation + startRotation);
				elem.style.top = "calc(50% + " + Math.sin(rotation / 180.0 * Math.PI) + " * " + (this.Range * this.VerticalModifier) + "px";
				elem.style.left = "calc(50% + " + Math.cos(rotation / 180.0 * Math.PI) + " * " + this.Range + "px";
				 
			}
		}
		this.Draw();
	}

}
