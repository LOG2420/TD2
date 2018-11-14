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
    groupNameDiv.addEventListener("click", handleGroupClick.bind({}, groupName));
    element.appendChild(icon);
    element.appendChild(groupNameDiv);
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
// function chatViewGenerator(groupName, messageList) {
//     console.log("chatViewGenerator needs to be built");
//     let box = document.createElement("div");
//     box.innerText = groupName;
//     for(msg in messageList) {
//         chatRoom.appendChild(messageGenerator(msg));
//     }
//     return box;
// }
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
    groupViews:{}, 
    groupListView:null,
    /** @todo: The messages property is not currently in use, feel free to 
     * erase it, do whatever with it */
    channels: {},
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
    __init__: function() {
        this.groupListView = groupListView;
        //this.views.newGroupForm = newGroupFormView; 
        // this.activeGroup = this.views[groups[0]];
        // All views are by default turned off
        // this.activeGroup.toggleDisplay();

        // Should I update the view from here????
    },

    /**
     * This method adds a group to the Model by creating the chat view
     * and placing it in its views object property
     * @method
     * @param {String} groupName 
     */
    addGroup: function(channel){
        // This is where the change would take place
        let newGroupChatView = Object.create(groupChatView);
        newGroupChatView.__init__(channel.name, channel.id);
        this.groupViews[channel.id] = newGroupChatView;
        this.channels[channel.id] = channel;
    },

    setSocket : function(ws) {
        this.ws = ws;
    },

    clearGroups : function() {
        this.groupViews = {};
        this.channels = {};
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
var updateGroups = new Event("updateGroups");
/** @listens: for the newGroup event and updates the groupList view */
document.addEventListener("updateGroups", function() {
    Model.groupListView.clearView();
    Object.keys(Model.groupViews).forEach((groupId)=>{
        Model.groupListView.addNewGroup(groupId);
    });
    // Model.groupViews.forEach((groupId)=>{
    //     if(!(groupId in Model.groupListView.displayedGroupIds))
    //         Model.groupListView.addNewGroup(groupId);
    // })  
})

var toggleForm = new Event("toggleForm");

document.addEventListener("toggleForm", function() {
    Model.groupListView.toggleForm();
})

// var initialGroups =  new Event("initialGroups");

// document.addEventListener("initialGroups", function(){
//     Model.groupViews.forEach((groupId)=>{
//         Model.groupListView.addNewGroup(groupId);
//     });
// })


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
    // let defaultOption = groupOptionGenerator("Général", "star");
    // this.contentNode.appendChild(defaultOption);
};

groupListView.clearView = function(){
    while (this.contentNode.firstChild) {
        this.contentNode.removeChild(this.contentNode.firstChild);
    }
}

groupListView.addNewGroup = function(channelId) {
    if(Model.channels[channelId].name == "Général") {
        let defaultGroup = groupOptionGenerator("Général", "star");
        this.contentNode.appendChild(defaultGroup);
    }
    // There should always be a General if the function gets to this point
    else {
        let iconName = Model.channels[channelId].joinStatus ? "minus" : "plus";
        let groupOption = groupOptionGenerator(Model.channels[channelId].name, iconName);

        // let defaultGroupNode = this.contentNode.firstElementChild;
        let iconNode = groupOption.firstChild;
        iconNode.addEventListener('click', iconChannelToggle.bind({}, channelId));
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

groupChatView.__init__ = function(groupName, groupId) {
    this.groupName = groupName;
    this.groupId = groupId;
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
    document.dispatchEvent(toggleForm);
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
    // Needs to be fixed after this
    event.preventDefault();
    let form = event.target;
    let name = form[1].value;
    console.log(name);
    //proper id needs to be found
    // let id = Math.floor(Math.random()*1000000).toString();
    let message = new Message("onCreateChannel", null, name, Model.currentUser, new Date() );
    let messageJson = JSON.stringify(message);
    Model.ws.send(messageJson);

    // document.dispatchEvent(newGroup);
    // document.dispatchEvent(toggleForm);
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
    Model.activeGroup = Model.groupViews[groupName];
    document.dispatchEvent(changeGroup);  
}

// Group id will get binded to function
function iconChannelToggle(groupId, event) {
    let message;
    let icon = event.target;

    let eventType = icon.classList.contains("fa-plus") ? "onJoinChannel" : "onLeaveChannel";

    message = new Message(eventType, groupId, null, Model.currentUser, new Date());

    let jsonMessage = JSON.stringify(message);
    Model.ws.send(jsonMessage);

}


// ================================================
// ========== initialize page =====================
// ================================================


groupListView.__init__();
Model.__init__();
