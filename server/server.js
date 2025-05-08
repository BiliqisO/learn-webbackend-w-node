var env = process.env.NODE_ENV || "development";
console.log("env", env);
if (env === "development") {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = "mongodb://localhost:27017/TodoApp";
} else if (env === "test") {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = "mongodb://localhost:27017/TodoTest";
}
var express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
var { mongoose } = require("./db/mongoose");
var { Todo } = require("./models/todo");
var { User } = require("./models/user");
var { ObjectID } = require("mongodb");
const { isValidObjectId } = require("mongoose");

var app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
app.post("/todos", (req, res) => {
  console.log(req.body);
  var todo = new Todo({
    text: req.body.text,
  });
  console.log(todo);
  todo.save().then(
    (doc) => {
      console.log("Saved todo:", doc);
      res.send(doc);
    },
    (e) => {
      res.status(400).send(e);
    }
  );
});
app.get("/todos", (req, res) => {
  Todo.find()
    .then((todos) => {
      res.send({ todos });
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});
app.get("/todos/:id/", (req, res) => {
  console.log(req.params);
  var id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).send();
  }
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send(todo);
  });
});
app.delete("/todos", (req, res) => {
  Todo.remove({}).then((result) => {
    res.send(result);
  });
});
app.delete("/todos/:id", (req, res) => {
  var id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).send();
  }
  Todo.findByIdAndDelete(id)
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send(todo);
    })
    .catch((e) => {
      console.error("Error deleting todo:", e);
      res.status(400).send(e);
    });
});
app.patch("/todos/:id", (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ["text", "completed"]);
  if (!isValidObjectId(id)) {
    return res.status(400).send({ error: "Something went wrong" });
  }
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then((todo) => {
      if (!todo) return res.status(404).send();
      res.send({ todo });
    })
    .catch((err) => {
      res.status(400).send();
    });
});
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
module.exports = { app };
