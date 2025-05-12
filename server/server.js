require("./config/config");
var express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
var { mongoose } = require("./db/mongoose");
var { Todo } = require("./models/todo");
var { User } = require("./models/user");
var { authenticate } = require("./middleware/authenticate");
var { ObjectID } = require("mongodb");
const { isValidObjectId } = require("mongoose");
const e = require("express");

var app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
app.post("/todos", authenticate, (req, res) => {
  console.log(req.body);
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
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
app.get("/todos", authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id,
  })
    .then((todos) => {
      res.send({ todos });
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});
app.get("/todos/:id/", authenticate, (req, res) => {
  console.log(req.params);
  var id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).send();
  }
  Todo.findOne({
    _id: id,
    _creator: req.user._id,
  }).then((todo) => {
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
app.delete("/todos/:id", authenticate, (req, res) => {
  var id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).send();
  }
  Todo.findOneAndDelete({
    _id: id,
    _creator: req.user._id,
  })
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
app.patch("/todos/:id", authenticate, (req, res) => {
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
  Todo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .then((todo) => {
      if (!todo) return res.status(404).send();
      res.send({ todo });
    })
    .catch((err) => {
      res.status(400).send();
    });
});
app.post("/users", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  var user = new User(body);
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then((token) => {
      res.header("x-auth", token).send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
});
app.post("/users/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  User.findByCredentials(body.email, body.password)
    .then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch((e) => {
      res.status(400).send();
    });
});
app.delete("/users/me/token", authenticate, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
module.exports = { app };
