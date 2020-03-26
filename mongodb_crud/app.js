const express=require('express');
const bodyParser=require('body-parser');
const app=express();
app.use(bodyParser.json());
const path=require('path');
const Joi=require('joi');
const db=require("./db");
const collection ="todo";

const Schema = Joi.object().keys({
    todo : Joi.string().required()
});



// Home Page Route

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

// READ Route
app.get('/getTodos', (req,res)=>{
    db.getDB().collection(collection).find({}).toArray((err, documents)=>{
        if(err)
            console.log(err);
        else{
            console.log(documents);
            res.json(documents);
        }
    });

});

// CREATE Route
app.put('/:id', (req, res)=>{
    const todoID= req.params.id;
    const userInput=req.body;

    db.getDB().collection(collection).findOneAndUpdate({_id: db.getPrimaryKey(todoID)}, {$set: {todo: userInput.todo}}, {returnOriginal:false}, (err, result)=>{
      if (err)
            console.log(err);
        else{
            res.json(result);
        }  
    });
});


// UPDATE Route
app.post('/', (req, res, next)=>{
    const userInput = req.body;

    Joi.validate(userInput, Schema, (err, result)=>{
        if (err){
            const error= new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput, (err, result)=>{
                if (err){
                    const error= new Error("Failed to insert Todo document");
                    error.status = 400;
                    next(error);
                }
                   
                else
                    res.json({result: result, document: result.ops[0], msg: "Successfully inserted Todo", error: null});
            });
        }
    })
   
});

// DELETE Route
app.delete('/:id', (req, res)=>{
    const todoID = req.params.id;

    db.getDB().collection(collection).findOneAndDelete({_id: db.getPrimaryKey(todoID)}, (err, result)=>{
        if (err)
            console.log(err);
        else
            res.json(result);
    });
});

app.use((err, req, res, next)=>{
    res.status(err.status).json({
        error: {
            message: err.message
        }
    });
})
// DB connection
db.connect((err)=>{
    if (err){
        console.log('unable to connect to database');
        process.exit(1);
    }
    else{
        app.listen(3000, ()=>{
            console.log('connected to database, app listening on port 3000');
        });
    }    
})