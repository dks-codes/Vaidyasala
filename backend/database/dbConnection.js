import mongoose from "mongoose";

export const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        dbName: 'HOSPITAL_MANAGEMENT_SYSTEM'
    })
    .then( ()=>{
        console.log('Database Connected');
    })
    .catch( (err)=>{
        console.log("Error while connectig to Database:", err);
    });
}