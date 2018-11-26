function sortMessage(message) {
    // The new message is either added to the chat room if the channel is active
    if (message.channelId == Model.activeGroup.id){
        playSound(message);
        Model.chatView.update(message);
    }
    // Or the message is counted as a new message in another channel
    else if (Model.channels[message.channelId].joinStatus){
        playSound(message)
        Model.newMessagesPerChannel[message.channelId]++;
        Model.newMessagesTotal++;
        document.dispatchEvent(newMessage);
    }
}

function playSound(message) {
    // We don't play the sound if the message comes from the active user
    if (message.sender != Model.currentUser)
        document.getElementById("ping").play();
}
