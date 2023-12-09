
export function allIndexesOf(value : string, searchString : string) : number[]{
    let result : number[] = [];
    let temp = undefined;
    while ((temp = value.indexOf(searchString, temp + 1)) != -1){
	    result.push(temp);
    }
    return result;
}