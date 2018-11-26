let url = "ws://log2420-nginx.info.polymtl.ca/chatservice?username=" + Model.currentUser;
var ws = new WebSocket(url);
Model.setSocket(ws);

ws.onopen = function() {
    console.log("websocket is active");
}

ws.onerror = function(err) {
    console.log(err);
    let error = new CustomEvent("error", {detail: "Server is down"});
    document.dispatchEvent(error);
    setTimeout(function(){ location.reload(true);}, 5000);
}

ws.onclose = function() {
    let error = new CustomEvent("error", {detail: "websocket has closed;\n Page will reload in 5s"});
    document.dispatchEvent(error);
    setTimeout(function(){ location.reload(true);}, 5000);
}

function handleErrors(message) {
    let error = new CustomEvent("error", {detail: message});
    document.dispatchEvent(error);
}

ws.onmessage = function(msg) {
    let message = JSON.parse(msg.data);
    console.log(message.eventType);
    switch (message.eventType) {
        case "updateChannelsList": 
            createInitialGroups(message.data);
            break;
        case "onGetChannel":
            console.log(message);
            Model.chatView.loadMessages(message);
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


window.addEventListener("beforeunload", function(e){
    ws.close()
}, false);
