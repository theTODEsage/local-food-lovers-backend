const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = 3000;

app.use(cors());
app.use(express.json());

//fPaMRwK5XIm3T4Av assignmentDB

const uri =
  "mongodb+srv://assignmentDB:fPaMRwK5XIm3T4Av@cluster0.2hdxpbz.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const reviewDB = client.db("reviewDB");
    const reviewCollectoin = reviewDB.collection("reviews");

    app.get("/reviews/top-rated", async (req, res) => {
      const reviews = await reviewCollectoin
        .find()
        .sort({ rating: -1 })
        .limit(6)
        .toArray();
      res.send(reviews);
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollectoin.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollectoin.insertOne(review);
      res.send(result);
    });












    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
