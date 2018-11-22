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

function idDivGenerator(idName) {
    let div = document.createElement("div");
    div.setAttribute("id", idName);
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
function chatViewGenerator(msgList) {
    let chatRoom = idDivGenerator("chat-room");
    for (i = 0; i < msgList.data.messages.length; i++) {
        chatRoom.appendChild(messageGenerator(msgList.data.messages[i]));
    }
    return chatRoom;
}

/**
 * @function: This function generates a messagebox element
 * @param Message message 
 */
function messageGenerator(message) {
    if (message.sender == Model.currentUser){
        var msg = idDivGenerator("outbound-msg");
        var msgContent = idDivGenerator("msg-box-self");
        var timeStamp = idDivGenerator("outbound-time");
    }
    else {
        var msg = idDivGenerator("incoming-msg");
        var userName = idDivGenerator("user-name");
        userName.innerText = message.sender;
        var msgContent = idDivGenerator("msg-box-other");
        var timeStamp = idDivGenerator("incoming-time");
        msg.appendChild(userName);
    }
    msgContent.innerText = message.data;
    timeStamp.innerText = formatTimeStamp(message.timestamp);
    msg.appendChild(msgContent);
    msg.appendChild(timeStamp);
    return msg;
}

//"2018-11-22T20:40:03.342Z"

function formatTimeStamp(timeStamp) {
    var d = new Date (timeStamp)
    switch(Model.language){
        case "French":
            let day = getWeekDayFR(d);
            let dayNum = d.getDate();
            let hours = d.getHours();
            if (parseInt(hours, 10) < 10) { hours = "0" + hours}
            let minutes = d.getMinutes();
            if (parseInt(minutes, 10) < 10) { minutes = "0" + minutes}
            return day + " " + dayNum + ", " + hours + ":" + minutes
    }
}

function getWeekDayFR(d) {
    var weekday = new Array(7);
    weekday[0] = "DIM";
    weekday[1] = "LUN";
    weekday[2] = "MAR";
    weekday[3] = "MER";
    weekday[4] = "JEU";
    weekday[5] = "VEN";
    weekday[6] = "SAM";
    var n = weekday[d.getDay()];
    return n;
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
 * @property {View} activeGroup : the active chat-room view object
 * @property {View} previousGroup: the previous active chat-room (used to switch rooms) 
 */
var Model = {
    language: "French",
    groupListView:null,
    chatView:null,
    /** @todo: The messages property is not currently in use, feel free to 
     * erase it, do whatever with it */
    channels: {},
    activeGroup: null, //The current group
    previousGroup: null, //The previous group
    /* Temporary */
    currentUser: "Spaghet",
    newMessages: 0,

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
        this.chatView = groupChatView;
        this.showUsername();

        //this.activeGroup = this.channels["dbf646dc-5006-4d9f-8815-fd37514818ee"];
    },

    /**
     * This method adds a group to the Model by creating the chat view
     * and placing it in its views object property
     * @method
     * @param {String} groupName 
     */
    addGroup: function(channel){
        this.channels[channel.id] = channel;
    },

    setSocket : function(ws) {
        this.ws = ws;
    },

    clearGroups : function() {
        this.channels = {};
    },

    showUsername: function() {
        document.getElementById("navbar-username").innerHTML = Model.currentUser;
    },

    /* addMessage: function(msg) {

        for (x in this.channels){
            if (x.id == msg.channelId)
                x.messages.push(msg);
                return x;
        }
        //If messages arent matched with a channel, maybe because the group hasent been added yet, update channels then run code again
    }
 */
}

// ============ Model  Events ======================
// =================================================

/** the following events get triggered when the controller
 * modifies the Model and the views need to be changed
 */

/** @event: This event is triggers when a user changes group */
var changeGroup = new Event("changeGroup");

/** @listens: for the changeGroup event and toggles the displays
 * of the old view and the new view (now the current view);
 */
document.addEventListener("changeGroup", function() {
    // if (Model.previousGroup != null){
    //     Model.chatView.update();
    // }
    //@Alexandre jai comment ces deux lignes pck activeGroup est apparement undefined at this point
    //Model.activeGroup.toggleDisplay();


    // This assumes that Model.activeGroup is a channel per the generator implementation
    // You might need to clear the chat room beforehand
    Model.chatView.clearView();
    Model.chatView.requestMessages();
    Model.chatView.changeHeader();
    //document.querySelector("#chat-room").appendChild(chatViewGenerator(Model.activeGroup));
})

/** @event: This event is triggers when a user creates a group*/
var updateGroups = new Event("updateGroups");
/** @listens: for the newGroup event and updates the groupList view */
document.addEventListener("updateGroups", function() {
    //PAS SUR ICI *************************************************************************************************
    /* if (Model.groupListView === null)
        return; */
    console.log("update the groups");
    Model.groupListView.clearView();
    Object.keys(Model.channels).forEach((channelId)=>{
        Model.groupListView.addNewGroup(channelId);
    });
    Model.groupListView.floatPositiveToTop()
})


var toggleForm = new Event("toggleForm");

document.addEventListener("toggleForm", function() {
    Model.groupListView.toggleForm();
})

/** @event: This event triggers a notification bubble to appear with the number of new messages */
var newMessage = new Event("newMessage");
/** @listens: for the new message event and updates the view */
document.addEventListener("newMessage", function() {
    let notif = document.getElementById("notification");
    notif.style.display = "inline";
    notif.innerText = Model.newMessages;
})

var removeNotifications = new Event("removeNotifications");

document.addEventListener("noNewMessage", function() {
    document.querySelector("#notification").style.display = "hidden";
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
    // let defaultOption = groupOptionGenerator("Général", "star");
    // this.contentNode.appendChild(defaultOption);
};

groupListView.clearView = function(){
    while (this.contentNode.firstChild) {
        this.contentNode.removeChild(this.contentNode.firstChild);
    }
}

groupListView.addEventListeners = function(groupSelectionElement,channelId) {
    let iconNode = groupSelectionElement.firstChild;
    iconNode.addEventListener('click', iconChannelToggle.bind({}, channelId));
    // This adds the group change event to the second child, so the text box
    groupSelectionElement.childNodes[1].addEventListener("click", handleGroupClick.bind({}, channelId));
    groupSelectionElement.setAttribute("_id", channelId);
}

groupListView.addNewGroup = function(channelId) {
    if(Model.channels[channelId].name == "Général") {
        let defaultGroup = groupOptionGenerator("Général", "star");
        // This adds the group change event to the second child, so the text box
        defaultGroup.childNodes[1].addEventListener("click", handleGroupClick.bind({}, channelId));
        // add default here
        let defaultTag = document.createElement("span");
        defaultTag.classList.add("default-tag");
        defaultTag.innerText = "default";
        defaultGroup.appendChild(defaultTag);
        this.contentNode.appendChild(defaultGroup);
    }
    // There should always be a General if the function gets to this point
    else {
        let iconName = Model.channels[channelId].joinStatus ? "minus" : "plus";
        let groupOption = groupOptionGenerator(Model.channels[channelId].name, iconName);
        this.addEventListeners(groupOption, channelId)
        // let defaultGroupNode = this.contentNode.firstElementChild;
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

// This needs to be called
groupListView.moveGroupToTop = function(groupId) {
    let groupList = this.contentNode.children;
    let indexOfGroupToMove = 0;
    for (let index = 0; index < groupList.length; index++) {
        if(groupId  == groupList[index].getAttribute("_id"))
            indexOfGroupToMove = index;
    }
    this.contentNode.removeChild(groupList[indexOfGroupToMove]);
    let iconName = Model.channels[groupId].joinStatus ? "minus" : "plus";
    let groupOption = groupOptionGenerator(Model.channels[groupId].name, iconName);
    this.addEventListeners(groupOption, groupId);
    this.addAfterDefaultGroup(groupOption);
}

groupListView.floatPositiveToTop = function() {
    let groupList = this.contentNode.children;
    // Lets exclude the general for now
    for (let index = 1; index < groupList.length; index++) {
        let group = groupList[index];
        let groupId = group.getAttribute("_id");
        let groupStatus = Model.channels[groupId].joinStatus;
        if(groupStatus) {
            this.moveGroupToTop(groupId)
        }
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

groupChatView.__init__ = function() {
    /** @todo: this generator needs to be properly implemented */
};

groupChatView.requestMessages = function() {
    let message = new Message("onGetChannel", Model.activeGroup.id, "", Model.currentUser, new Date() );
    let messageJson = JSON.stringify(message);
    // This is for catching an error if the ws is closed (will only work if error is thrown
    // in sync)
    try{
        Model.ws.send(messageJson);
    }
    catch(error) {
        document.dispatchEvent(new CustomEvent("error", {detail:error}))
    }

}

groupChatView.loadMessages = function(msg) {
    let newChatRoom = chatViewGenerator(msg);
    this.contentNode.appendChild(newChatRoom);
    var element = document.getElementById("chat-room");
    element.scrollTop = element.scrollHeight;
}

groupChatView.changeHeader = function() {
    let headerTitle = this.headerNode.lastElementChild;
    headerTitle.innerText = Model.activeGroup.name;
}

groupChatView.update = function(message) {
    // This has to do with chat functions
    document.querySelector("#chat-room").appendChild(messageGenerator(message));
    var scrolled = false;
    updateScroll(scrolled);
    $("#chat-room").on('scroll', function(){
        scrolled=true;
    });
}


function updateScroll(scrolled){
    if(!scrolled){
        var element = document.getElementById("chat-room");
        element.scrollTop = element.scrollHeight;
        }
    }

groupChatView.clearView = function() {
    for (i = 0; i < this.contentNode.childNodes.length; i++){
        console.log(this.contentNode.childNodes[i]);
        if (this.contentNode.childNodes[i].id == "chat-room")
            this.contentNode.removeChild(this.contentNode.childNodes[i]);
    }
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
    // This is for catching an error if the ws is closed (will only work if error is thrown
    // in sync)
    try {
        Model.ws.send(messageJson);
    }
    catch(error) {
        document.dispatchEvent(new CustomEvent("error", {detail:error}))
    }
    

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
function handleGroupClick(groupId) {
    // No longer needed
    // Model.previousGroup = Model.activeGroup;

    Model.activeGroup = Model.channels[groupId];
    document.dispatchEvent(changeGroup);  
}

// Group id will get binded to function
function iconChannelToggle(groupId, event) {
    let message;
    let icon = event.target;

    let eventType = icon.classList.contains("fa-plus") ? "onJoinChannel" : "onLeaveChannel";

    message = new Message(eventType, groupId, null, Model.currentUser, new Date());

    let jsonMessage = JSON.stringify(message);
    // This is for catching an error if the ws is closed (will only work if error is thrown
    // in sync)
    try {
        Model.ws.send(jsonMessage);
    }
    catch(error) {
        document.dispatchEvent(new CustomEvent("error", {detail:error}))
    }


}


/**
 * This function gets called when the user presses the 
 * PolyChat logo, it refreses the page
 * 
 * @function
 */
let navbarRefresh = document.querySelector("#navbar-refresh");
navbarRefresh.addEventListener("click", refreshPage)

function refreshPage() {
    location.reload(true);
}

/**
 * This function is TEMPORARY, for Testing purposes
 * Will update the number of new messages when the user presses the send button
 * 
 * @function
 */
let envoyer = document.querySelector("#send");
function sendOnEnter(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        onNewMessage();
    }
}
envoyer.addEventListener("click", onNewMessage);


function onNewMessage() {
    if (Model.activeGroup.joinStatus == false) {
        alert("Vous devez vous joindre à ce groupe pour envoyer des messages");
        return;
    }
    let messageData = document.getElementById("entry-value").value;
    let messageObj = new Message("onMessage", Model.activeGroup.id, messageData, Model.currentUser, new Date());
    let jsonMessage = JSON.stringify(messageObj);
    // This is for catching an error if the ws is closed (will only work if error is thrown
    // in sync)
    try {
        Model.ws.send(jsonMessage);
    }
    catch(error) {
        document.dispatchEvent(new CustomEvent("error", {detail:error}))
    }
    document.querySelector("#entry-value").value = "";
    //document.dispatchEvent(newMessage)
}

let notifBubble = document.querySelector("#notification");
notifBubble.addEventListener("click", removeNotif);

function removeNotif() {
    Model.newMessages = 0;
    document.dispatchEvent(removeNotifications);
}

// ================================================
// ========== Error handling ======================
// ================================================

document.addEventListener("error", function(event){
    let errorMessage = event.detail;
    toggleErrorBox(errorMessage);
})

function toggleErrorBox(errorMessage) {
    let errorBox = document.querySelector("#error-box");
    if (errorBox.style.display == "none") {
        errorBox.firstElementChild.innerText = errorMessage;
        errorBox.style.display = "block";
    } else {
        errorBox.style.display = "none";
    }
}

errorBox = document.querySelector("#error-box");
errorBox.addEventListener("click", toggleErrorBox);





// ================================================
// ========== initialize page =====================
// ================================================

Model.__init__();
groupListView.__init__();
groupChatView.__init__();

document.getElementById("entry-value").focus();
document.getElementById("entry-value").select();



