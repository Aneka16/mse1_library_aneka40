require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
/* ---------------- ROOT ROUTE ---------------- */
/* Check if server is running */

app.get("/", (req,res)=>{
res.status(200).send("Library Management API - Render Deployment Successful 🚀");
});

/* ---------------- MongoDB Connection ---------------- */

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));


/* ---------------- Book Schema ---------------- */

const bookSchema = new mongoose.Schema({

title:{
type:String,
required:true
},

author:{
type:String,
required:true
},

isbn:{
type:String,
required:true,
unique:true
},

genre:{
type:String,
required:true
},

publisher:{
type:String,
required:true
},

publicationYear:{
type:Number
},

totalCopies:{
type:Number,
required:true,
min:1
},

availableCopies:{
type:Number
},

shelfLocation:{
type:String
},

bookType:{
type:String,
enum:["Reference","Circulating"]
},

status:{
type:String,
enum:["Available","Checked Out"],
default:"Available"
}

},{timestamps:true});

const Book = mongoose.model("Book",bookSchema);


/* ---------------- POST /books ---------------- */
/* Add new book */

app.post("/books", async(req,res)=>{
try{

if(!req.body.availableCopies){
req.body.availableCopies = req.body.totalCopies;
}

const book = new Book(req.body);
await book.save();

res.status(201).json(book);

}catch(error){

res.status(400).json({message:error.message});

}
});


/* ---------------- GET /books ---------------- */
/* Get all books */

app.get("/books", async(req,res)=>{
try{

const books = await Book.find();
res.status(200).json(books);

}catch(error){

res.status(500).json({message:error.message});

}
});


/* ---------------- SEARCH BOOK BY TITLE ---------------- */
/* GET /books/search?title=xyz */

app.get("/books/search", async(req,res)=>{
try{

const title = req.query.title;

const books = await Book.find({
title:{$regex:title,$options:"i"}
});

res.status(200).json(books);

}catch(error){

res.status(500).json({message:error.message});

}
});


/* ---------------- GET BOOK BY ID ---------------- */
/* GET /books/:id */

app.get("/books/:id", async(req,res)=>{
try{

const book = await Book.findById(req.params.id);

if(!book){
return res.status(404).json({message:"Book not found"});
}

res.status(200).json(book);

}catch(error){

res.status(500).json({message:error.message});

}
});


/* ---------------- UPDATE BOOK ---------------- */
/* PUT /books/:id */

app.put("/books/:id", async(req,res)=>{
try{

const book = await Book.findByIdAndUpdate(
req.params.id,
req.body,
{new:true}
);

if(!book){
return res.status(404).json({message:"Book not found"});
}

res.status(200).json(book);

}catch(error){

res.status(400).json({message:error.message});

}
});


/* ---------------- DELETE BOOK ---------------- */
/* DELETE /books/:id */

app.delete("/books/:id", async(req,res)=>{
try{

const book = await Book.findByIdAndDelete(req.params.id);

if(!book){
return res.status(404).json({message:"Book not found"});
}

res.status(200).json({message:"Book deleted successfully"});

}catch(error){

res.status(500).json({message:error.message});

}
});


/* ---------------- Error Handling Middleware ---------------- */

app.use((err,req,res,next)=>{
console.error(err.stack);
res.status(500).json({message:"Server Error"});
});


/* ---------------- Server ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`);
});