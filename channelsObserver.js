
function createInitialGroups(channels) {
    console.log("Create Init")
    console.log(channels);
    // Only add new groups
    // I'm not assuming that the new group will be sent back at the end of the queue
    Model.clearGroups();
    channels.forEach( (channel)=>{
        Model.addGroup(channel);
    })
    if (Model.activeGroup == null){
        Model.activeGroup = Model.channels["dbf646dc-5006-4d9f-8815-fd37514818ee"];
    }
    console.log(Model);
    document.dispatchEvent(updateGroups);
}

