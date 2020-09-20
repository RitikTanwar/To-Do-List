const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const { isBuffer } = require('util');
const _ = require('lodash');

// const port = 1200;

const app = express();

app.use('/static', express.static('static'));
app.use(express.urlencoded({ extended: true }));


mongoose.connect('mongodb+srv://RitikTanwar:ritiktanwaradw136@cluster0.b507o.mongodb.net/toDoListDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection;

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = new mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: 'Welcome to-do List'
});

const item2 = new Item({
    name: 'Press + to add to the todo list'
});

const item3 = new Item({
    name: 'Delete your existing work'
});
let defaultItem = [item1, item2, item3];

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'template'));

// function displayTime()
let item = ['Coding', 'Eating', 'Sleeping'];
let work = [];


// Item.deleteMany({name:'Press + to add to the todo list'},(err,obj)=>{
//     if(err) console.log(err);
// })
let days;
app.get('/', (req, res) => {
    Item.find({}, (err, obj) => {
        if (obj.length === 0) {
            Item.insertMany(defaultItem, (err) => {
                if (err) console.log(err);
            });
            res.redirect('/');
        }
        if (err) console.log(err);
        else {
            const today = new Date();
            const options = {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
            days = today.toLocaleDateString("hi-IN", options)
            const params = { content: days, cont: obj }
            res.status(200).render('home', params);
        }
    });
    // const params={content:day,cont:item};
    // res.status(200).render('home.pug',params);
});

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model('List', listSchema);

app.get('/:customList', (req, res) => {
    const customListName = _.capitalize(req.params.customList);
    const params = { content: customListName, cont: work };
    // res.status(200).render('home.pug',params);
    if (List.findOne({ name: customListName }, (err, obj) => {
        if (err) console.log(err);
        else {
            if (!obj) {
                const list = new List({
                    name: customListName,
                    items: defaultItem
                });
                list.save();
                res.redirect('/'+customListName);
                // console.log('Exist');
            }
            else{
                res.status(200).render('home',{content:obj.name,cont:obj.items});
            }
            // else console.log("Don't exist");
        }
    }));
        // List.remove({name:'home'},(err)=>{
        //     if(err) console.log(err);
        // })
        // console.log(req.params.customList);
});

app.post('/', (req, res) => {
    // console.log(req.body.newWork);
    // console.log(req.body);
    const itemName = req.body.newWork;
    const listName=req.body.button;

    const item = new Item({
        name: itemName
    })
    if (itemName.length >= 3) item.save();
    // console.log(listName+' '+days);
    if(listName===days){
        res.redirect('/');
    }
    else {
        List.findOne({name:listName},(err,obj)=>{
            if(!err){
                obj.items.push(item);
                obj.save();
            }
        })
        res.redirect('/'+listName);
    }
    // if(req.body.button=='Work'){
    //     work.push(items);
    //     res.redirect('/work');
    // }
    // else{
    //     item.push(items);
    //     res.redirect('/');
    // }
    // const params={cont:item};
    // res.status(200).render('home.pug',params);
})

// app.post('/:customListName',(req,res)=>{
//     const works=req.body.newWork;
//     // work.push(works); 
//     res.redirect('/'+customListName);
// });

app.post('/delete', (req, res) => {
    // console.log(req.body);
    const item = req.body.checkbox;
    const listName=req.body.listName;

    if(listName===days){
        Item.deleteOne({ name: item }, (err) => {
            if (err) console.log(err);
        });
        // List.findOneAndUpdate({name:listName},{$pull:{items:{name:item}}},(err,obj)=>{
            // if(err) console.log(err);
            // else console.log('Deleted Succesfully');
        // })
        res.redirect('/');
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{name:item}}},(err,obj)=>{
            if(!err) res.redirect('/'+listName);
        })
        Item.deleteOne({ name: item }, (err) => {
            if (err) console.log(err);
        });
    }

})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 1200;
}
// app.listen(port);
app.listen(port, () => {
    console.log('Running at ' + port);
})