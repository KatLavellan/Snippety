
interface KatFile{
	Type : "dir" | "file";
	Path : string;
	Children: KatFile[];
}

declare const env : any;
declare const __FILES : KatFile[];