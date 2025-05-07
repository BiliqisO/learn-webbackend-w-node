var mongoose = require("mongoose");
mongoose.mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/TodoApp", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
module.exports = { mongoose };
