const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;

app.use(cors());
app.use(express.json());

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
    const reviewCollection = reviewDB.collection("reviews");
    const favoritesCollection = reviewDB.collection("favorites");


    app.get("/reviews/top-rated", async (req, res) => {
      const reviews = await reviewCollection
        .find()
        .sort({ rating: -1 })
        .limit(6)
        .toArray();
      res.send(reviews);
    });



    app.get("/reviews/my-reviews", async (req, res) => {
      const email = req.query.email;
      const reviews = await reviewCollection
        .find({ reviewerEmail: email })
        .sort({ date: -1 })
        .toArray();
      res.send(reviews);
    });

 
    app.get("/reviews", async (req, res) => {
      const search = req.query.search || "";
      const query = search
        ? { foodName: { $regex: search, $options: "i" } }
        : {};
      const reviews = await reviewCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(reviews);
    });


    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const review = await reviewCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(review);
    });


    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });


    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const updatedReview = req.body;
      const result = await reviewCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            foodName: updatedReview.foodName,
            foodImage: updatedReview.foodImage,
            restaurantName: updatedReview.restaurantName,
            location: updatedReview.location,
            rating: updatedReview.rating,
            reviewText: updatedReview.reviewText,
          },
        },
      );
      res.send(result);
    });


    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });


    app.get("/favorites", async (req, res) => {
      const email = req.query.email;
      const favorites = await favoritesCollection
        .find({ userEmail: email })
        .toArray();
      res.send(favorites);
    });


    app.post("/favorites", async (req, res) => {
      const favorite = req.body;
      const existing = await favoritesCollection.findOne({
        reviewId: favorite.reviewId,
        userEmail: favorite.userEmail,
      });
      if (existing) {
        return res.send({ alreadyExists: true });
      }
      const result = await favoritesCollection.insertOne(favorite);
      res.send(result);
    });

    app.delete("/favorites/:id", async (req, res) => {
      const id = req.params.id;
      const result = await favoritesCollection.deleteOne({
        _id: new ObjectId(id),
      });
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
