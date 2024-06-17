// routes/api/books.js

import express from "express";
import User from "../models/User.js";

const router = express.Router();

// @route   GET api/books/test
// @desc    Tests books route
// @access  Public
router.get('/test', (req, res) => res.send('user route testing!'));

router.post('/login', (req, res) => {
  User.findOne({ username: req.body.username, password: req.body.password }).select('username')
    .then((user) => {
        if (user === null) {
          return res.status(404).json({ nousersfound: 'No Users found' });
        }
        else {
          return res.json(user);

        }
      })
      .catch(err => res.status(404).json({ nousersfound: `Error encountered: ${err}` }));
});

router.post('/signup', (req, res) => {
    User.create(req.body)
      .then(user => res.json({ msg: 'User added successfully' }))
      .catch(err => res.status(400).json({ error: 'Unable to add this user', detail: err }));
  });


const UserRouter = router;
export default UserRouter;