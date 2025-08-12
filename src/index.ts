import express from "express"
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import { contentModel, linkModel, UserModel } from "./db";
import {JWT_PASS} from "./config"
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import cors from "cors"

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup",async (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    try{
        await UserModel.create({
            username:username,
            password:password
        })

        res.json({
            msg:"User signed Up"
        })
    }catch(e){
        res.status(411).json({
            msg:"User already exists"
        })
    }
})

app.post("/api/v1/signin",async (req, res)=>{
    const username= req.body.username;
    const password= req.body.password;

    const existingUser =await UserModel.findOne({
        username,
        password
    })

    if(existingUser){
        const token = jwt.sign({
            id:existingUser._id
        }, JWT_PASS)

        res.json({
            token
        })
    }else{
        res.status(403).json({
            msg:"Incorrect credentials"
        })
    }
})

app.post("/api/v1/content",userMiddleware,async (req, res)=>{
    const link= req.body.link;
    const type=req.body.type;
    const title= req.body.title;
    await contentModel.create({
        link,
        type,
        title,
        //@ts-ignore
        userId : req.userId,
        tags: []
    })

    return res.json({
        msg:"Content added"
    })
})

app.get("/api/v1/content",userMiddleware,async (req, res)=>{
    //@ts-ignore
    const userId = req.userId;
    const content = await contentModel.find({
        userId:userId,
    }).populate("userId", "username");
    res.json({
        content
    })
})

app.delete("/api/v1/content",userMiddleware,async (req, res)=>{
    const contentId = req.body.contentId;

    await contentModel.deleteMany({
        _id:contentId,
        //@ts-ignore
        userId: req.userId
    })

    res.json({
        msg:"Deleted"
    })
})

app.post("/api/v1/brain/share",userMiddleware,async (req, res)=>{
    const share = req.body.share;
    if(share){
        const existingLink = await linkModel.findOne({
            //@ts-ignore
            userId:req.userId
        })

        if(existingLink){
            return res.json({
                hash:existingLink.hash,
                msg:"Link exists"
        })
        }

        const hash = random(10);
        await linkModel.create({   
            //@ts-ignore
            userId: req.userId,
            hash
        })

        res.json({
            hash,
            msg:"Updated Link"
        })
    }else{
        await linkModel.deleteOne({
            //@ts-ignore
            userId:req.userId
        })
    }

    res.json({
        msg:"Removed Link"
    })
})

app.get("/api/v1/brain/:shareLink",async (req, res)=>{
    const hash = req.params.shareLink;

    const link = await linkModel.findOne({
        hash
    })

    if(!link){
        return res.status(411).json({
            msg:"Sorry wrong url"
        })
    }
    const content = await contentModel.find({
        userId: link.userId
    })

    const user = await UserModel.findOne({
        _id: link.userId
    })

    res.json({
        username: user?.username,
        content:content
    })
})

app.listen(3000);