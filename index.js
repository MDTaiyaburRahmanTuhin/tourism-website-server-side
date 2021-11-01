const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z9rhw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("waterService");
        const servicesCollection = database.collection("services");
        const orderCollection = database.collection("order");
        // const orderDeletCollection = database.collection("orderDelets");


        //GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })
        //Get single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service)
        })
        //Add order proces
        app.post('/addOrder', (req, res) => {
            console.log(req.body);
            orderCollection.insertOne(req.body).then((result) => {
                res.send(result);
            })
        })
        //get my orders
        app.get('/myorder/:email', async (req, res) => {
            const result = await orderCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        })
        //Delete api
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: (id) }
            const result = await orderCollection.deleteOne(query)

            console.log('deleting user with id', result);

            res.json(result);
        })


        //Post Api
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);
            const result = await servicesCollection.insertOne(service);
            res.json(result)
        });

    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('Running water server')
});
app.listen(port, () => {
    console.log('Running water server on port', port);
})