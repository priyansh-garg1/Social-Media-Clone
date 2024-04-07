import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    postedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        maxLength:500,
    },
    img:{
        type:String
    },
    likes:{
        type:[Schema.Types.ObjectId],
        ref:"User",
        default:[]
    },
    replies:[
        {
            userId:{
                type:Schema.Types.ObjectId,
                ref:"User",
                required:true    
            },
            text:{
                type:String,
                required:true
            },
            userProfilePic:{
                type:String,
            },
            username:{
                type:String,
            }
        }
    ]
},{timestamps:true})

const Post = mongoose.model("Post",postSchema);
export default Post;