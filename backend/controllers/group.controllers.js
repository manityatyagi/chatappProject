import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

const createGroup = async(req, res) => {
    try {
        const {name, description, members, isPublic } = req.body;
        
        const group = new Group({
            name,
            description,
            admin: req.user.id,
            members: [... new Set([...members, req.user.id])],
            isPublic
        }); 

        await group.save();

        const welcomeMessage = new Message({
            sender: req.user._id,
            content: `Group ${name} was created`,
            timeStamp: Date.now()
        });

        await welcomeMessage.save();
        res.status(201).json(group);
        } catch (error) {
        res.status(500).json({message: err.message})
    }
}

const addMembers = async(req, res) => {
    try {
        const addMemGroup = await Group.findById(req.params.groupId);
        if(!addMemGroup) {
            return res.status(404).json({mesage: "Group not found"});
        }
        if(addMemGroup.admin.toString() !== req.user.id) {
            return res.status(403).json({message: "Only admin can add members"});
        }
        const newMembers = req.body.members.filter(m => !group.members.includes(m));
        if(newMembers.length === 0) {
            return res.status(400).json({message: "No new members to add"});
        }

        group.members = [...group.members, ...newMembers];
        await group.save();

        const newMembersNotification = await Notification.create(
            newMembers.map(userId => ({
                sender: req.user.id,
                recipient: userId,
                content: `You were adde to group '${group.name}'`,
                type: 'group_invite',
                relatedEntity: group._id,
                onModel: 'Group'
            })));

            res.json(group);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export { addMembers, createGroup };