import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.models.js";
import { userSocketMap, io } from "../server.js";

export const getUserForSideBar = async() => {
    try{
        const userId = requestAnimationFrame.user._id;
        const filteredUser = await User.find({_id: {$ne: userId}}).select("-password");
        const unseenMessages = {}
        const promises = filteredUser.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                recieverId: userId,
                seen: false,
            })
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, user: filteredUser, unseenMessages})
    }catch(err){
        console.log(err.messages)
        res.json({success: false, messages: err.messages})
    }
}

export const getMessages = async (req, res) => {
    try{
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                {senderId: myId, recieverId: selectedUserId},
                {senderId: selectedUserId, recieverId: myId},
            ]
        })
        await Message.updateMany(
            {
                senderId: selectedUserId,
                recieverId: myId,
            },
            {
                seen: true
            }
        )
        res.json({success: true, messages})
    }catch(err){
        console.log(err.messages)
        res.json({success: false, messages: err.messages})
    }
}

export const markMessageAsSeen = async (req, res) => {
    try{
        const {id} = req.params;
        await Message.findByIdAndUpdate(
            id, 
            {
                seen: true
            }
        )
        res.json({success: true})
    }catch(err){
        console.log(err.messages)
        res.json({success: false, messages: err.messages})
    }
}

export const sendMessage = async (req, res) => {
    try{
        const {text, image} = req.body;
        const recieverId = req.params.id;
        const senderId = req.user._id;
        let imageUrl;
        if(imageUrl){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl =uploadResponse.secure_url;
        }
        const newMessage = Message.create({
            senderId,
            recieverId,
            text,
            image: imageUrl
        })
        const recieverSocketId = userSocketMap[recieverId];
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage", newMessage)
        }
        res.json({success: true, newMessage});
    }catch{
        console.log(err.message);
        res.json({success: false, message: err.message})
    }
}