


var ws = new WebSocket("http://log2420-nginx.info.polymtl.ca/chatservice?username={ nom }");
//let initMessage = new Message("onJoinChannel", )
ws.updateChannelsList = function(event){
    console.log(event.data);
}

// How to create a channel

ws.onerror = function() {

}

ws.onJoinChannel = function() {

}

ws.onLeaveChannel = function() {

}


window.addEventListener("beforeunload", function(e){
    // Do something
}, false);

