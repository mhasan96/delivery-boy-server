const express = require("express");

const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tztyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    // console.log("connected to DB");
    const database = client.db("travelGuy");
    const servicesCollection = database.collection("services");
    const orderCollection = database.collection("orders");

    //Get All Data
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    //Get single Service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });
    //Post Api
    // app.get("/services", async (req, res) => {
    //   const cursor = orderCollection.find({});
    //   const service = await cursor.toArray();
    //   res.json(service);
    // });
    app.post("/services", async (req, res) => {
      const service = req.body;
      service.createdAt = new Date();
      console.log("hit the post api", service);
      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.json(result);
    });

    // Add Orders API
    app.get("/orders", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { email: email };
      }
      // if (req.decodedUserEmail === email) {
      // const query = { email: email };
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
      // } else {
      //   res.status(401).json({ message: "User not authorized" });
      // }
    });

    app.post("/orders", async (req, res) => {
      const order = req.body;
      order.createdAt = new Date();
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    //Delete Api
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Delivery Boy is Running");
});

app.listen(port, () => {
  console.log("Server running at port", port);
});
