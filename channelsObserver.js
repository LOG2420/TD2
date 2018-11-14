
function createInitialGroups(channels) {
    console.log("Create Init")
    console.log(channels);
    // Only add new groups
    // I'm not assuming that the new group will be sent back at the end of the queue
    Model.clearGroups();
    channels.forEach( (channel)=>{
        Model.addGroup(channel);
    })
    console.log(Model);
    document.dispatchEvent(updateGroups);
}

