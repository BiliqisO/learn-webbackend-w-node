const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const { Todo } = require("../../models/todo");
const { User } = require("../../models/user");
const userOneID = new ObjectId();
const userTwoID = new ObjectId();
const users = [
  {
    _id: userOneID,
    email: "userone@gmail.com",
    password: "useronepassword",
    tokens: [
      {
        access: "auth",
        token: jwt
          .sign({ _id: userOneID, access: "auth" }, process.env.JWT_SECRET)
          .toString(),
      },
    ],
  },
  {
    _id: userTwoID,
    email: "usertwo@gmail.com",
    password: "usertwopassword",
    tokens: [
      {
        access: "auth",
        token: jwt
          .sign({ _id: userTwoID, access: "auth" }, process.env.JWT_SECRET)
          .toString(),
      },
    ],
  },
];
const todos = [
  {
    _id: new ObjectId(),
    text: "First test todo",
    _creator: userOneID,
  },
  {
    _id: new ObjectId(),
    text: "Second test todo",
    _creator: userTwoID,
  },
  {
    _id: new ObjectId(),
    text: "Third test todo",
    _creator: userTwoID,
  },
];
var populateTodos = (done) => {
  Todo.deleteMany({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};
var populateUsers = (done) => {
  User.deleteMany({})
    .then(() => {
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();
      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};
module.exports = { todos, populateTodos, populateUsers, users };
