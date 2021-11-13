const express = require ('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.98ro8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
 try{
    await client.connect();
    const database = client.db('buyCars');
    const servicesCollection = database.collection('services');
    const usersCollection = database.collection('users');

    //Get API
    app.get('/services', async(req,res)=>{
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.send(services);

    })

    //Get a Single Services
    app.get('/services/:id', async(req,res)=>{
        const id = req.params.id;
        console.log('getting specific Service', id);
        const query = { _id: ObjectId(id) };
        const service =await servicesCollection.findOne(query);
        res.json(service);
    });

    app.get('/users/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role=== 'admin'){
            isAdmin = true;
        }
        res.json({admin: isAdmin})
    })


    // POST API
    app.post('/services', async(req, res)=>{
        const service = req.body;
        const result = await servicesCollection.insertOne(service);
        res.json(result);
    });

    // POST API FOR USERS
    app.post('/users', async(req,res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
    });

    // PUT USER AND ADMIN
    app.put('/users', async(req,res)=>{
        const user = req.body;
        const filter = {email: user.email};
        const options = {upsert: true};
        const updateDoc = {$set: user};
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    app.put('/users/admin', async(req,res)=>{
        const user = req.body;
        const filter= {email: user.email};
        const updateDoc = {$set: {role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
    });


    //Delete API
    app.delete('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query ={_id:ObjectId(id)};
        const result = await servicesCollection.deleteOne(query);
        res.json(result);
    });

 }
 finally{
    //  await client.close();
 }
}

run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('Running Buy Cars');
});

app.listen(port, ()=>{
    console.log('Buy cars on Port', port);
})