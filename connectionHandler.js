let url = "ws://log2420-nginx.info.polymtl.ca/chatservice?username=" + Model.currentUser;
var ws = new WebSocket(url);
Model.setSocket(ws);

ws.onopen = function() {
    console.log("websocket is active");
}

ws.onerror = function(err) {
    console.log(err);
    console.log("here")
    // alert("%cServer is down", "color:red");
    let error = new CustomEvent("error", {detail: "Server is down"});
    document.dispatchEvent(error);
    setTimeout(function(){ location.reload(true);}, 5000);
}

ws.onclose = function() {
    let error = new CustomEvent("error", {detail: "websocket has closed;\n Page will reload in 5s"});
    document.dispatchEvent(error);
    setTimeout(function(){ location.reload(true);}, 5000);
    // Deal with stuff here
}

function handleErrors(message) {
    // alert("%c" + message, "color:red");
    let error = new CustomEvent("error", {detail: message});
    document.dispatchEvent(error);
}


function onJoinChannel(message) {
    console.log("%c Joining Channel", "color:blue"); 
    console.log(message);
}

function onLeaveChannel(message) {
    console.log("%c Leaving Channel", "color:purple"); 
    console.log(message);
}

ws.onmessage = function(msg) {

    let message = JSON.parse(msg.data);
    console.log(message.eventType);
    switch (message.eventType) {
        case "updateChannelsList": 
            console.log("Stuff");
            createInitialGroups(message.data);
            break;
        case "onGetChannel":
            console.log(message);
            Model.chatView.loadMessages(message);
            break;
        case "onJoinChannel":
            onJoinChannel(message.data);
            break;
        case "onLeaveChannel":
            onLeaveChannel(message.data);
            break;
        case "onMessage":
            // Users joining the channels will be sent here
            // Message will be received from the id
            sortMessage(message);
            console.log(message);
            break;
        case "onError":
            handleErrors(message.data);
            break;
        default:
            console.log("%cMessage cannot be handled", "color:red");
            console.log("Message Type: " +message.eventType);
            break;
    }
}

ws.onerror = function() {

}



window.addEventListener("beforeunload", function(e){
    // Do something
}, false);

