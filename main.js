// ===============================================
// ========= HTML Generator functions ============
// ===============================================

// ======= Helpers for the generators ============
// ===============================================

function makeIcon(type) {
    let icon = document.createElement("i");
    icon.classList.add("fas");
    icon.classList.add("fa-"+type);
    let iconColors = {
        star: 'orange',
        plus: 'blue',
        minus:'green'
    }
    icon.style.color = iconColors[type];
    return icon;
}

// ============== Generators =====================
// ===============================================

function classfiedDivGenerator(className) {
    let div = document.createElement("div");
    div.classList.add(className);
    return div;
}

function groupOptionGenerator(groupName, type = "star") {
    let element = classfiedDivGenerator("group-selector");
    let icon = makeIcon(type);
    let groupNameDiv = classfiedDivGenerator("group-name");
    groupNameDiv.innerText = groupName;
    element.appendChild(icon);
    element.appendChild(groupNameDiv);
    return element;
}

// =========================================
// ============== MVC ======================
// =========================================

// ============ Model ======================
// =========================================

var Model = {
    // There will be a groupList view
    // There will be a newGroupForm view
    views:{

    },
    // which will contain the the The group group selector view and all of the chat groups
    // All of them get accessed with a key, which is the name labeled on the group-selection
    groupViews:[], //A list of the groupNames the user is subsribed to
    messages: {}, //This will contain a list of Message Objects for every
    // groupChatView
    activeGroup: null, //The current group
    previousGroup: null, //The previous group

    __init__: function(groups) {
        this.views.groupList = groupListView;
        this.views.newGroupForm = newGroupFormView 
        groups.forEach((groupName)=>{
            this.addGroup(groupName);
        });

        // Should I update the view from here????
    },
    addGroup: function(groupName){
        this.groupViews.push(groupName);
        let newGroupChatView = Object.create(groupChatView);
        newGroupChatView.__init__();
        this.views[groupName] = newGroupChatView;
    }
};

var changeGroup = new Event("changeGroup");
var newGroup = new Event("newGroup");

document.addEventListener("changeGroup", function() {
    Model.previousGroup.toggleDisplay();
    Model.activeGroup.toggleDisplay();
})

document.addEventListener("newGroup", function() {
    Model.views.newGroupForm.toggleDisplay();
    Model.views.groupList.update();
})








// Views================================
// Abstract class (ish)
var View = {
    node: null, //Implemented in child
    toggleDisplay: function() {
        if(this.node.style.display == "block")
          this.node.style.display = "none";
        else
          this.node.style.display = "block";
    }
}


// VIEWS ========================
// Group List view definition
var groupListView = Object.create(View);

groupListView.node = document.querySelector("#group-interface");

groupListView.contentNode = document.querySelector('#group-interface .content')

groupListView.__init__ = function() {
    let defaultOption = groupOptionGenerator("Général", "star");
    this.contentNode.appendChild(defaultOption);
};

groupListView.update = function() {
    // This is what I call risky business
    // This works since the group is updated every add of group
    let newGroupName = Model.groupViews[Model.groupViews.length-1];
    let groupOption = groupOptionGenerator(newGroupName, "minus");
    // Find the default group node
    let defaultGroupNode = this.contentNode.firstElementChild;
    if (defaultGroupNode.nextElementSibling) {
        // This gets the icon and changes it from a minus to a plus
        let iconNode = defaultGroupNode.nextElementSibling.firstElementChild;
        iconNode.classList.remove("fa-minus");
        iconNode.classList.add("fa-plus");
        // Add the new class
        this.contentNode.insertBefore(groupOption, defaultGroupNode.nextElementSibling);
    }
    else {
        this.contentNode.appendChild(groupOption);
    }

    
    
}

// Group chat view defintion

var groupChatView = Object.create(View);

groupChatView.node = document.querySelector("#message-interface");

groupChatView.__init__ = function() {
    
};

groupChatView.update = function() {

}

// Group Form View definition

var newGroupFormView = Object.create(View);
newGroupFormView.node = document.querySelector("#new-group-form");
// This gets the form
newGroupFormView.node.firstElementChild.addEventListener("submit", handleAddNewGroup);

// Has to have an update function that can append a message child (of the correct type
// and format) tot the view, while updating the position of the rest
// Ideas for this
// Depending on the length of the message (in number of characters), a height is associated to it
// Messages will have absolute position position will change at the arrival of every new message

// Make a groupView for every new group that is added

// events


var Message = {

}


let plusIcon = document.querySelector("#group-interface .header .fas.fa-plus");
plusIcon.addEventListener("click", handleCreateNewGroup);

function handleCreateNewGroup(event) {
    Model.views.newGroupForm.toggleDisplay();
}

// This is a controller function
function handleAddNewGroup(event) {
    event.preventDefault();
    let form = event.target;

    let name = form[0].value;
    Model.addGroup(name);
    document.dispatchEvent(newGroup);
}

function handleGroupClick() {
    // add a hover in css
    // getName of clicked object
    // Use name to find the class
    Model.previousGroup = Model.activeGroup;
    Model.activeGroup = Model.groupViews[groupName];
    document.dispatchEvent(changeGroups);
    
}


// ================================================
// ========== initialize page =====================
// ================================================


groupListView.__init__();

Model.__init__(["Général"]);



