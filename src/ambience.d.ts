
interface KatFile{
	Type : "dir" | "file";
	Path : string;
	Children: KatFile[];
}

declare const __FILES : KatFile[];