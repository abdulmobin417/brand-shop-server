const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hixyzlt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const brandsCollection = client.db("brandShop").collection("brands");
    const carCollection = client.db("brandShop").collection("cars");
    const usersCollection = client.db("brandShop").collection("users");
    const cartCollection = client.db("brandShop").collection("carts");

    // filter cars by brand name
    app.get("/car/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand };
      const result = await carCollection.find(query).toArray();
      // console.log(brand);
      res.send(result);
    });

    //brand apis
    app.get("/brands", async (req, res) => {
      const result = await brandsCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/brandDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await brandsCollection.findOne(query);
      res.send(result);
    });

    app.get("/carDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carCollection.findOne(query);
      res.send(result);
    });

    app.post("/car", async (req, res) => {
      const newCar = req.body;
      console.log(newCar);
      const result = await carCollection.insertOne(newCar);
      res.send(result);
    });

    app.put("/car/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCar = req.body;

      const car = {
        $set: {
          name: updatedCar.name,
          brand: updatedCar.brand,
          category: updatedCar.category,
          description: updatedCar.description,
          price: updatedCar.price,
          ratings: updatedCar.ratings,
          photo: updatedCar.photo,
        },
      };

      const result = await carCollection.updateOne(filter, car, options);
      res.send(result);
    });

    //user apis
    app.post("/users", async (req, res) => {
      const data = req.body;
      const result = await usersCollection.insertOne(data);
      console.log(data);
      res.send(result);
    });

    //cart apis
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const result = await cartCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const data = req.body;
      const existingProduct = await cartCollection.findOne({
        productId: data.productId,
        userEmail: data.userEmail,
      });

      if (existingProduct) {
        existingProduct.quantity = existingProduct.quantity + 1;
        await cartCollection.updateOne(
          { _id: new ObjectId(existingProduct._id) },
          { $set: { quantity: existingProduct.quantity } }
        );
        res.send(existingProduct);
      } else {
        const insertResult = await cartCollection.insertOne(data);
        res.send(insertResult);
      }
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Brand Shop server is running");
});

app.listen(port, () => {
  console.log(`Brand Shop Server is running on port: ${port}`);
});
