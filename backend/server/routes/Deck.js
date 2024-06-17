// routes/api/books.js

import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post('/create', (req, res) => {
    res.status(200).json({deck: req.body.deck, deckName: req.body.deckName});
});

router.get('/get', (req, res) => {
    // Get all decks for user
    // Should just get the ids and names of decks
    // More data can be loaded in the following route
    
});

router.get('/get/id', (req, res) => {
    // Get defined deck for user
  
});

router.post('/update/id', (req, res) => {
  });

  router.post('/delete/id', (req, res) => {
});


const DeckRouter = router;
export default DeckRouter;