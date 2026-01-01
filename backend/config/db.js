import mongoose from "mongoose"
 const connectDb = async () =>{
    try {
        await mongoose.connect(`mongodb://localhost:27017/foodview`)
        console.log("db connected")
    } 
    catch (err){
        console.log(err)
    }
 }
 export default connectDb;