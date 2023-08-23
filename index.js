import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import  _ from "lodash";
const app=express();
const port=3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

let lastDate= {
    day:new Date().getDate(),
    month:new Date().getMonth()
};

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://souradeepghosh00:OSwVF4O67HmSskOk@cluster0.syqwkg1.mongodb.net/todoDB");

const itemSchema= new mongoose.Schema ({
    name : {
        type : String,
        required : [true,  "come'on you have got better things todo!"]
    }
});

const Item = mongoose.model ("today", itemSchema);


const item1 = new Item ({
    name : "leetcode problems"
});

const item2 = new Item ({
    name : "DSA sheet"
});

const item3 = new Item ({
    name : "Web Dev"
});

const defaultitems = [item1, item2, item3];



async function addInitialItems (){

    try {
        await Item.insertMany(defaultitems);
        //console.log("successfully inserted!");
    }
    catch (err) {
        console.log(err);
    }
}


//new schema
const listSchema = new mongoose.Schema ({
    name : String,
    items : [itemSchema]
});

//model
const List = mongoose.model("List",listSchema);


let data;

app.get("/", async(req,res)=> {
    let todayDate={
        day:new Date().getDate(),
        month:new Date().getMonth(),
    };
    if(lastDate.day!=todayDate.day || lastDate.month!=todayDate.month)
    {
        lastDate.day=todayDate.day;
        lastDate.month=todayDate.month;
    }

    try {
        data=await Item.find({});
        console.log(data);

        if(data.length===0) {
            addInitialItems();
            res.redirect("/");
        }
        else {
            res.render(__dirname+"/views/index.ejs",{
                list:"today",
                items:data
            });
        }
        

    }catch(err) {
        console.log(err.message);
    }
});

app.get("/:customListName" , async(req,res) => {

    const dynRoute= _.capitalize( req.params.customListName);
    //console.log(dynRoute);

    const data1 = await List.findOne({name : dynRoute});
    if(!data1) {
        //create a new list
        const list = new List({
        name : dynRoute,
        items : defaultitems

    });
    list.save();
    res.redirect("/"+dynRoute);

    }
    else {
       //show existing list
       console.log(data1.items);
       res.render(__dirname+"/views/index.ejs", {
            list : data1.name,
            items : data1.items
       });
    }
    
    // const data= await List.findOne({name : dynRoute});
    // res.render(__dirname+"/views/index.ejs",{
    //     list:data.name,
    //     items:data.items
    // });
});

app.post("/", async(req,res)=> 
{
    let itemName=(req.body["newItem"]==="")? "":req.body["newItem"];
    let listName = req.body.list;
    // console.log(itemName);
    // console.log(listName);
    
    
    const item = new Item ({
        name : itemName
    });
    if(listName === "today")
    {
        try {
            await item.save();
            console.log("item saved!");
            res.redirect("/");
        }catch(error) {
            //console.log(error);
            res.render(__dirname+"/views/index.ejs",{
                list : "today",
                items : data,
                err : "Got anything better todo!"
            });
        }
    }
    else {
        const foundList = await List.findOne({ name : listName});
        foundList.items.push(item);
        await foundList.save();
        res.redirect("/"+listName);
    }
    
    
});

app.post("/delete", async(req,res) => {
    const id=req.body.deletedItem;
    const listName = req.body.ListName;
    // console.log(id);
    if(listName === "today") {
        await Item.findByIdAndDelete(id);
        res.redirect("/");
    }
    else {
        await List.findOneAndUpdate({ name : listName} , {
            $pull : { items : {_id : id }}
        });
        res.redirect("/" + listName);
    }
    
});

app.listen(port,()=> {
    console.log(`server running on port ${port}`);
});