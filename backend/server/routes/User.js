// routes/api/books.js

import express from "express";
import User from "../models/User.js";

const router = express.Router();

// @route   GET api/books/test
// @desc    Tests books route
// @access  Public
router.get('/test', (req, res) => res.send('user route testing!'));

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get('/', (req, res) => {
  User.find()
    .then(user => res.json(user))
    .catch(err => res.status(404).json({ nousersfound: 'No Users found' }));
});

router.post('/', (req, res) => {
    User.create(req.body)
      .then(user => res.json({ msg: 'User added successfully' }))
      .catch(err => res.status(400).json({ error: 'Unable to add this user', detail: err }));
  });


const UserRouter = router;
export default UserRouter;