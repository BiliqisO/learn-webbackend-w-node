const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db("myDatabase");
  const result = await db.collection("myCollection").findOne();

  // db.collection("myCollection").updateOne(
  //   { _id: result._id },
  //   { $set: { name: "Updated Name" } }
  // );
  // console.log("Updated document with _id:", result._id);
  const updatedResult = await db
    .collection("myCollection")
    .findOne({ _id: result._id });
  console.log("Updated document:", updatedResult);

  await db.collection("myCollection").deleteMany({ name: "Updated Name" });
  console.log("Deleted documents with name 'Updated Name'");
  console.log(result);
  await client.close();
  console.log("Connection closed");
}
run();
