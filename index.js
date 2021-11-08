const express = require('express')
const app = express();

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.70s8n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      console.log('db connected')

      const database = client.db("tour-site");
      const tourscollection = database.collection("tours");
      const bookingcollection = database.collection("bookings");

      app.get('/tours', async (req, res) => {
        //   console.log('hitting server')
          const cursor = tourscollection.find({});
          const tours = await cursor.toArray();
          res.send(tours)
      })

      //get single tour API
      app.get('/tour/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id)};
        const tour = await tourscollection.findOne(query);
        res.json(tour);
      })

    // use POST to get data by keys
    app.post('/orders/bykeys', async (req, res) =>{
      const keys = req.body;
      const query = {Email: {$in: keys}}
      // console.log(keys, query);
      const orders = await bookingcollection.find(query).toArray();
      // console.log(orders);
      res.json(orders)
    })
    
    // Add Order API
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await bookingcollection.insertOne(order)
      // console.log('order', order)
      res.json(result)
    })

    //get all orders API
    app.get('/orders', async (req, res) => {
      const cursor = bookingcollection.find({});
      const orders = await cursor.toArray();
      res.send(orders)
    })

    //get single Order API
    app.get('/order/:id', async (req, res) => {
      const id = req.params.id  
      // console.log('getting specific service', id)
      const query = { _id: ObjectId(id)};
      const order = await bookingcollection.findOne(query);
      res.json(order);
      // console.log(order);

    })


    //Update Order API
    app.put('/order/:id', async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      console.log('hitting put', id,)
      const filter = { _id: ObjectId(id)};
      const options = { upsert: true }
      const updateOrder = {
          $set: {
              Name: updatedOrder.Name,
              Email: updatedOrder.Email,
              Mobile: updatedOrder.Mobile,
              Address: updatedOrder.Address
          }
      }
      const result = await bookingcollection.updateOne(filter, updateOrder, options);
      res.json(result);
    })

    //Delete Order API
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const result = await bookingcollection.deleteOne(query);
      res.json(result);
    })

    //Post new tours API
    app.post('/tours', async (req, res) => {
      const tour = req.body;  
      // console.log('hit the post api', service)  
      // res.json('post hitted')
      
        const result = await tourscollection.insertOne(tour);
        // console.log(result);
        res.json(result);
    });


    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
res.send('tour Server is running')
})


app.listen(port, () => {
console.log('listening to port', port);
})