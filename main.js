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
 * This funciton creates a div element that has an id
 * @function
 * @param {String} idName : the name of the id for the div
 */
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
 * @param {Message} msgList : an onGetChannel type message, containing the messages to be displayed in the chatbox
 */
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
    // Applying the right css id to each message
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

/**
 * @function: This function formats the date to be displayed under each message
 * @param timeStamp contains the timestamp information to be formatted
 */
function formatTimeStamp(timeStamp) {
    var d = new Date (timeStamp)
    //This allows for future language changing, but is only setup in french for now
    switch(Model.language){
        case "French":
            //We then build a string with the right format, using built in Date functions
            let day = getWeekDayFR(d);
            let dayNum = d.getDate();
            let hours = d.getHours();
            //Add a 0 for hours between 0 and 9 (09:05 instead of 9:5)
            if (parseInt(hours, 10) < 10) { hours = "0" + hours}
            let minutes = d.getMinutes();
            if (parseInt(minutes, 10) < 10) { minutes = "0" + minutes}
            return day + " " + dayNum + ", " + hours + ":" + minutes
    }
}

/**
 * @function: This function returns the string associated with the weekday number
 * @param {Date} d contains the Date of the message
 */
function getWeekDayFR(d) {
    var weekday = new Array(7);
    weekday[0] = "DIM";
    weekday[1] = "LUN";
    weekday[2] = "MAR";
    weekday[3] = "MER";
    weekday[4] = "JEU";
    weekday[5] = "VEN";
    weekday[6] = "SAM";
    var w = weekday[d.getDay()];
    return w;
}
// =========================================
// ============== MVC ======================
// =========================================

// ============ Model ======================
// =========================================

/**
 * @class
 * 
 * @property {String} language: The default language used is french
 * @property {View} views: The different views used in the website (each having an access key)
 * @property {Channel} activeGroup : the active chat-room (channel) view object
 * @property {Array<Channel>} channels: The list of channels
 * @property {String} currentUser: The default username of the user
 * @property {Message} newMessagesPerChannel: A dictionary containing the number of new messages for each channel key
 * @property {Number} newMessagesTotal: The total number of new messages to be displayed in the notification bubble
 */
var Model = {
    language: "French",
    groupListView:null,
    chatView:null,
    channels: {},
    activeGroup: null,
    //previousGroup: null, //The previous group 
    currentUser: "Username",
    newMessagesPerChannel: {},
    newMessagesTotal: 0,

    /**
     * This function will initialize the model and trigger the 
     * creation of all of the necessary views that need to be present on page load
     * @todo: Ask if this counts as a constructor
     * @method
     * @constructor
     */
    __init__: function() {
        this.groupListView = groupListView;
        this.chatView = groupChatView;
    },

    /**
     * This method adds a group to the Model by creating the chat view
     * and placing it in its views object property
     * @method
     * @param {Channel} channel 
     */
    addGroup: function(channel){
        this.channels[channel.id] = channel;
        //New messages for each channel are also initialized here
        this.newMessagesPerChannel[channel.id] = 0;
    },

    setSocket : function(ws) {
        this.ws = ws;
    },

    clearGroups : function() {
        this.channels = {};
    },
}

// ============ Model  Events ======================
// =================================================

/** the following events get triggered when the controller
 * modifies the Model and the views need to be changed
 */

/** @event: This event is triggered when a user changes channels */
var changeGroup = new Event("changeGroup");

/** @listens: for the changeGroup event and toggles the displays
 * of the old view and the new view (now the current view);
 */
document.addEventListener("changeGroup", function() {
    // Clear the chatView
    Model.chatView.clearView();
    // Load the active channels messages
    Model.chatView.requestMessages();
    // Change the chatroom's channel name in the header
    Model.chatView.changeHeader();
    // Remove the correct number of new messages from the notification bubble
    Model.chatView.removeNotif();
})

/** @event: This event is triggered when a user creates a group*/
var updateGroups = new Event("updateGroups");

/** @listens: for the newGroup event and updates the groupList view */
document.addEventListener("updateGroups", function() {
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

/** @event: This event is triggered when a new message is received */
var newMessage = new Event("newMessage");

/** @listens: for the new message event and updates the view */
document.addEventListener("newMessage", function() {
    let notif = document.getElementById("notification");
    notif.style.display = "inline";
    notif.innerText = Model.newMessagesTotal;
})

/** @event: This event is triggered when the number of new messages is decreased to 0 */
var removeNotifications = new Event("removeNotifications");

/** @listens: for the remove notifications event and hides the bubble*/
document.addEventListener("removeNotifications", function() {
    document.querySelector("#notification").style.display = "none";
})



//======================================================
//================= Views ==============================
//======================================================


// This is an Interface for a view, but w e will not be creating a class for this with the class keyword.
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
 * @class groupListView
 */
var groupListView = Object.create(View);

groupListView.node = document.querySelector("#group-interface");

groupListView.contentNode = document.querySelector('#group-interface .content')

/**
 * @method clearView
 * 
 */
groupListView.clearView = function(){
    while (this.contentNode.firstChild) {
        this.contentNode.removeChild(this.contentNode.firstChild);
    }
}

/**
 * @function addEventListeners
 * Adds custom event listener to a group selection html element
 * 
 * @param {HTMLelement} groupSelectionElement
 * @param {String} channelId
 * 
 */
groupListView.addEventListeners = function(groupSelectionElement,channelId) {
    let iconNode = groupSelectionElement.firstChild;
    iconNode.addEventListener('click', iconChannelToggle.bind({}, channelId));
    // This adds the group change event to the second child, so the text box
    groupSelectionElement.childNodes[1].addEventListener("click", handleGroupClick.bind({}, channelId));
    groupSelectionElement.setAttribute("_id", channelId);
}

/**
 * @function addNewGroup
 * 
 * @param {String} channelId
 */
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

/**
 * @function addAfterDefaultGroup
 * 
 * @param {HTMLelement} element - element to be added after default group in right part of view 
 */
groupListView.addAfterDefaultGroup = function(element) {
    let defaultGroupNode = this.contentNode.firstElementChild;
    this.contentNode.insertBefore(element, defaultGroupNode.nextElementSibling);
}

/**
 * @function toggleForm
 * Toggles the display of the new group form
 * 
 */
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
 * @function moveGroupToTop
 * Moves group html element for corresponding group id to the top of the list
 * @param {String} groupId - 
 */
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


/**
 * @function floatPositiveToTop
 * Brings all of the groups that have a joinStatus of true to the top of the list
 */
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
 */
var groupChatView = Object.create(View);

groupChatView.node = document.querySelector("#message-interface");
groupChatView.contentNode = document.querySelector("#message-interface .content");
groupChatView.headerNode = document.querySelector("#message-interface .header");

groupChatView.__init__ = function() {
    //This simply adds the current username to the navbar display:
    this.showUsername();
};

/**
 * This method shows the user's username in the navbar
 * @method
 */
groupChatView.showUsername = function() {
    document.getElementById("navbar-username").innerHTML = Model.currentUser;
},

/**
 * This method retrieves the list of messages from the server
 * @method
 */
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

/**
 * This method loads the channels messages into the chat view
 * @method
 * @param {Message} msg 
 */
groupChatView.loadMessages = function(msg) {
    let newChatRoom = chatViewGenerator(msg);
    this.contentNode.appendChild(newChatRoom);
    var element = document.getElementById("chat-room");
    // By default, we scroll to the bottom of the chat view
    element.scrollTop = element.scrollHeight;
}

/**
 * This method changes the channel name in the header
 * @method
 */
groupChatView.changeHeader = function() {
    let headerTitle = this.headerNode.lastElementChild;
    headerTitle.innerText = Model.activeGroup.name;
}

/**
 * This method adds new messages to the chat view as they are received
 * @method
 * @param {Message} msg 
 */
groupChatView.update = function(message) {
    document.querySelector("#chat-room").appendChild(messageGenerator(message));
    // If the user has not scrolled up in the chat view, we scroll to show the new message
    var scrolled = false;
    updateScroll(scrolled);
    $("#chat-room").on('scroll', function(){
        scrolled=true;
    });
}

// Used with the update method to scroll to the bottom of the chat view
function updateScroll(scrolled){
    if(!scrolled){
        var element = document.getElementById("chat-room");
        element.scrollTop = element.scrollHeight;
        }
    }

/**
 * This method clears the previous chatview to make room for the new one
 * @method
 */
groupChatView.clearView = function() {
    // Removes all chatrooms (children of the contentNode)
    // Even though there should only be one, this ensures there is never more than one
    for (i = 0; i < this.contentNode.childNodes.length; i++){
        if (this.contentNode.childNodes[i].id == "chat-room")
            this.contentNode.removeChild(this.contentNode.childNodes[i]);
    }
}

/**
 * This method handles the number of new messages
 * @method
 */
groupChatView.removeNotif = function() {
    // Subtract the number of new messages that have been seen from the total
    Model.newMessagesTotal -= Model.newMessagesPerChannel[Model.activeGroup.id];
    // Update the number of messages to be displayed in the bubble
    document.querySelector("#notifications").innerText = Model.newMessagesTotal;
    // Current channel's number of new messages is now 0
    Model.newMessagesPerChannel[Model.activeGroup.id] = 0;
    // If the total falls to 0, the notification bubble is hidden
    if (Model.newMessagesTotal <= 0)
        document.dispatchEvent(removeNotifications);
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
 * This function is called when the user presses enter to send a message
 * 
 * @function
 */
let envoyer = document.querySelector("#send");
function sendOnEnter(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    // If the keyboard key was #13 (enter), we send the message
    if (code == 13) {
        // We dont want to do a carriage return, just send the message
        e.preventDefault();
        onNewMessage();
    }
}

/**
 * This function is called when the user clicks envoyer to send a message
 * 
 * @function
 */
envoyer.addEventListener("click", onNewMessage);
function onNewMessage() {
    // The user cannot send a message if they are not part of the channel
    if (Model.activeGroup.joinStatus == false) {
        alert("Vous devez vous joindre à ce groupe pour envoyer des messages");
        return;
    }
    // The user cannot send an empty message
    let messageData = document.getElementById("entry-value").value;
    if (messageData == "" || messageData == "\n"){
        alert("Vous ne pouvez pas envoyer un message vide!");
        return;
    }
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
    //Once the message has been sent, they text area is emptied
    document.querySelector("#entry-value").value = "";
}

// ================================================
// ========== Error handling ======================
// ================================================

document.addEventListener("error", function(event){
    let errorMessage = event.detail;
    toggleErrorBox(errorMessage);
})


/**
 * @function
 * Displays an error box with the given error message
 * @param {errorMessage} errorMessage 
 */
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



