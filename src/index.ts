import Snippet from "./Snippet/Snippet";

import "./index.scss";

let snippetElements = document.getElementsByTagName("code-snippet");
for (let i = 0; i < snippetElements.length; i++){
    let element = snippetElements[i];
    new Snippet(element as HTMLElement);
}

//new Snippet("Sample");