function sortMessage(message) {
    // Two scenarios
    //var messageChannel = Model.addMessage(message)
    // Either the message is in the active page and needs to be displayed
    if (message.channelId == Model.activeGroup.id){
        Model.chatView.update(message);
    }
    else
        Model.newMessages++;
    // Either the message is sent to another group and the notification is incremented
}
