import mongoose, {model, Schema} from "mongoose";

mongoose.connect("mongodb+srv://Pranit:pSDVH57wTr4a982n@cluster0.djbflxz.mongodb.net/brainly")

const UserSchema = new Schema({
    username: {type: String, unique:true},
    password:String
})

export const UserModel = model("User", UserSchema);

const contentSchema = new Schema({
    type: String,
    link:String,
    title:String,
    tags:[{type:mongoose.Types.ObjectId, ref:'Tag'}],
    userId: {type:mongoose.Types.ObjectId, ref:'User', required:true}
})

export const contentModel = model("Content", contentSchema);

const linkSchema = new Schema({
    hash:String,
    userId: {type:mongoose.Types.ObjectId, ref:'User', required:true}
})

export const linkModel = model("Link", linkSchema);