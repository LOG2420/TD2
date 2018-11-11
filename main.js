// ===============================================
// ========= HTML Generator functions ============
// ===============================================

// ======= Helpers for the generators ============
// ===============================================

/**
 * This function creates a classified icon element
 * It also colors the icon appropriately
 * @param {String} type: The name of the icon
 */
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

/**
 * This funciton creates a div element that has a class
 * @function
 * @param {String} className : the name of the class for the div
 */
function classfiedDivGenerator(className) {
    let div = document.createElement("div");
    div.classList.add(className);
    return div;
}

/**
 * This function creates an element that will act as a group 
 * option button in the group list function of the html
 * @function
 * @param {String} groupName : the name of the group 
 * @param {String} type : The type of icon that will be put next to the group name
 */
function groupOptionGenerator(groupName, type = "star") {
    let element = classfiedDivGenerator("group-selector");
    let icon = makeIcon(type);
    let groupNameDiv = classfiedDivGenerator("group-name");
    groupNameDiv.classList.add("clickable");
    groupNameDiv.innerText = groupName;
    element.appendChild(icon);
    element.appendChild(groupNameDiv);
    element.addEventListener("click", handleGroupClick.bind({}, groupName));
    return element;
}

function newGroupFormGenerator() {
    let newGroupForm = document.createElement("div");
    newGroupForm.id = "new-group-form";
    let form = document.createElement("form");
    let groupSelector = classfiedDivGenerator("group-selector");
    let button = document.createElement("button");
    button.appendChild(makeIcon("plus-square"));
    groupSelector.appendChild(button);
    let input = document.createElement("input");
    input.setAttribute("type", "text")
    input.setAttribute("name", "newGroup");
    groupSelector.appendChild(input);
    form.appendChild(groupSelector);
    form.addEventListener("submit", handleAddNewGroup);
    newGroupForm.appendChild(form);
    return newGroupForm;
}

/**
 * @function This function creates an element for the chat view
 * in which all the messages will be displayed
 * @param {Channel} channel : The active channel
 */
function chatViewGenerator(channel) {
    let chatRoom = classfiedDivGenerator("chat-room");
    for (msg in channel.messages){
        chatRoom.appendChild(messageGenerator(msg));
    }
    return chatRoom;
}

/**
 * @function: This function generate a messagebox element
 * @param Message message 
 */
function messageGenerator(message) {
    if (message.sender == Model.currentUser){
        let msg = classfiedDivGenerator("outbound-msg");
        let msgContent = classfiedDivGenerator("msg-box-self");
        let timeStamp = classfiedDivGenerator("outbound-time");
    }
    else {
        let msg = classfiedDivGenerator("incoming-msg");
        let userName = classfiedDivGenerator("user-name");
        let msgContent = classfiedDivGenerator("msg-box-other");
        let timeStamp = classfiedDivGenerator("incoming-time");
        msg.appendChild(userName);
    }
    msgContent.innerText(message.data);
    timeStamp.innerText(message.timeStamp);
    msg.appendChild(msgContent);
    msg.appendChild(timeStamp);
    return msg;
}

// =========================================
// ============== MVC ======================
// =========================================

// ============ Model ======================
// =========================================

/**
 * @todo: Ask if this is still considered a class
 * @class
 * 
 * @property {View} views: The different views used in the website (each having an access key)
 * @property {String} groupViews: A list of all the chat-rooms access keys (for this.views) 
 * @property {View} activeGroup : the active chat-room view object
 * @property {View} previousGroup: the previous active chat-room (used to switch rooms) 
 */
var Model = {
    views:{}, 
    /** @todo: Name with space could make application crash, verify that */
    groupViews:[], 
    /** @todo: The messages property is not currently in use, feel free to 
     * erase it, do whatever with it */
    messages: {},
    activeGroup: null, //The current group
    previousGroup: null, //The previous group
    /* Temporary */
    currentUser: "Spaghet",

    /**
     * This function will initialize the model and trigger the 
     * creation of all of the necessary views that need to present on page load
     * @todo: Ask if this counts as a constructor
     * @method
     * @constructor
     * @param {Array[Strings]} groups : The groups that are initialized on page load 
     */
    __init__: function(groups) {
        this.views.groupList = groupListView;
        //this.views.newGroupForm = newGroupFormView; 
        groups.forEach((groupName)=>{
            this.addGroup(groupName);
        });
        this.activeGroup = this.views[groups[0]];
        // All views are by default turned off
        this.activeGroup.toggleDisplay();

        // Should I update the view from here????
    },

    /**
     * This method adds a group to the Model by creating the chat view
     * and placing it in its views object property
     * @method
     * @param {String} groupName 
     */
    addGroup: function(groupName){
        this.groupViews.push(groupName);
        let newGroupChatView = Object.create(groupChatView);
        newGroupChatView.__init__(groupName);
        this.views[groupName] = newGroupChatView;
    }
};

// ============ Model  Events ======================
// =================================================

/** the following events get triggered when the controller
 * modifies the Model and the views need to be changed
 */

/** @event: This event is triggers when a user changes group */
var changeGroup = new Event("changeGroup");

/** @listens: for the changeGroup event and toggles the displays
 * of the olf view and the new view (now the current view);
 */
document.addEventListener("changeGroup", function() {
    Model.previousGroup.toggleDisplay();
    Model.activeGroup.toggleDisplay();
    Model.activeGroup.changeHeader();
})

/** @event: This event is triggers when a user creates a group*/
var newGroup = new Event("newGroup");
/** @listens: for the newGroup event and updates the groupList view */
document.addEventListener("newGroup", function() {
    
    //Model.views.newGroupForm.toggleDisplay();
    Model.views.groupList.toggleForm();
    Model.views.groupList.update();
})


//======================================================
//================= Views ==============================
//======================================================


// This is an Interface for a view, but since OOP is a lie in JS,
// We will not be creating a class for this with the class keyword.
/**
 * @class
 * @abstract
 */
var View = {
    node: null, //Implemented in child
    toggleDisplay: function() {
        if(this.node.style.display == "block")
          this.node.style.display = "none";
        else
          this.node.style.display = "block";
    }
}


/**
 * @class groupoListView
 */
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
        this.addAfterDefaultGroup(groupOption);
    }
    else {
        this.contentNode.appendChild(groupOption);
    }
}

groupListView.addAfterDefaultGroup = function(element) {
    let defaultGroupNode = this.contentNode.firstElementChild;
    this.contentNode.insertBefore(element, defaultGroupNode.nextElementSibling);
}

groupListView.toggleForm = function() {
    let node = document.querySelector("#new-group-form");
    if (node) { //If the node points to somewhere
        node.parentNode.removeChild(node) //essentially removes itself
    }
    else {
        let form = newGroupFormGenerator();
        this.addAfterDefaultGroup(form);
    }
}

/**
 * @class GroupChatView
 * @todo
 */
var groupChatView = Object.create(View);

groupChatView.node = document.querySelector("#message-interface");
groupChatView.contentNode = document.querySelector("#message-interface .content");
groupChatView.headerNode = document.querySelector("#message-interface .header");

groupChatView.__init__ = function(groupName) {
    this.groupName = groupName;
    /** @todo: this generator needs to be properly implemented */
    let newChatRoom = chatViewGenerator(groupName);

    newChatRoom.style.display = "none";
    this.contentNode.appendChild(newChatRoom);
    this.node = this.contentNode.lastElementChild;
};

groupChatView.changeHeader = function() {
    let headerTitle = this.headerNode.lastElementChild;
    headerTitle.innerText = this.groupName;
}

groupChatView.update = function() {
    // This has to do with chat functions
}


// ========== Controller Logic ===================
// ===============================================

/**
 * the following functions define how specific elements of the DOM
 * modify the Model.
 */
 

let plusIcon = document.querySelector("#group-interface .header .fas.fa-plus");
plusIcon.addEventListener("click", handleCreateNewGroup);

function handleCreateNewGroup(event) {
    Model.views.groupList.toggleForm();
}

/**
 * This is a callback function that gets called when
 * the addNewGroup form in the group-list view
 * gets submitted.
 * 
 * @function
 * @param {Event} event 
 */
function handleAddNewGroup(event) {
    event.preventDefault();
    let form = event.target;
    let name = form[1].value;
    console.log(name);
    Model.addGroup(name);
    document.dispatchEvent(newGroup);
}


/**
 * This function gets called when a group switch is toggled.
 * The event listener is added to every group selector in 
 * the group user interface
 * 
 * @function
 * @param {String} groupName 
 */
function handleGroupClick(groupName) {
    Model.previousGroup = Model.activeGroup;
    Model.activeGroup = Model.views[groupName];
    document.dispatchEvent(changeGroup);  
}


// ================================================
// ========== initialize page =====================
// ================================================


groupListView.__init__();

Model.__init__(["Général"]);



