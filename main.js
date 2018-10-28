// ===============================================
// ========= HTML Generator functions ============
// ===============================================

function classfiedDivGenerator(className) {
    let div = document.createElement("div");
    div.classList.add(className);
    return div;
}

function groupOptionGenerator(groupName) {
    let element = classfiedDivGenerator("group-selector");
    let icon = classfiedDivGenerator("icon");
    let groupNameDiv = classfiedDivGenerator("group-name");
    groupNameDiv.innerText = groupName;
    element.appendChild(icon);
    element.appendChild(groupNameDiv);
    return element;
}



let groups = ["Team Charizard", "Team Squirtle", "Team Bulbasaur"];

let groupSelectorNode = document.querySelector("#group-interface .content");

groups.forEach((groupName)=>{

    groupSelectorNode.appendChild(groupOptionGenerator(groupName))
});

