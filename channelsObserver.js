/**
 * @function createInitialGroups
 * This function resets the state of the available group in the groupListView
 * @param {channels} channels 
 */
function createInitialGroups(channels) {
    console.log("Create Init")
    console.log(channels);
    // Only add new groups
    // I'm not assuming that the new group will be sent back at the end of the queue
    Model.clearGroups();
    channels.forEach( (channel)=>{
        Model.addGroup(channel);
    })
    // On the first page load, General is assigned as the current channel and messages are loaded to the chat view
    if (Model.activeGroup == null){
        Model.activeGroup = Model.channels["dbf646dc-5006-4d9f-8815-fd37514818ee"];
        Model.chatView.requestMessages();
    }

    console.log(Model);
    document.dispatchEvent(updateGroups);
}

