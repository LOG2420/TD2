function sortMessage(message) {
    // Two scenarios
    var messageChannel = Model.addMessage(message)
    // Either the message is in the active page and needs to be displayed
    if (messageChannel == Model.activeGroup.channelId){
        groupChatView.update(message);
    }
    else
        Model.newMessages++;
    // Either the message is sent to another group and the notification is incremented
}
