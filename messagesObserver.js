function sortMessage(message) {
    // Two scenarios
    //var messageChannel = Model.addMessage(message)
    // Either the message is in the active page and needs to be displayed

 
    if (message.channelId == Model.activeGroup.id){
        playSound(message);
        Model.chatView.update(message);
    }
    else if (Model.channels[message.channelId].joinStatus){
        playSound(message)
        Model.newMessagesPerChannel[message.channelId]++;
        Model.newMessagesTotal++;
        document.dispatchEvent(newMessage);
    }
    // Either the message is sent to another group and the notification is incremented
}

function playSound(message) {
    if (message.sender != Model.currentUser)
        document.getElementById("ping").play();
}
