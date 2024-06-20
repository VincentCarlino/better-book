// routes/api/books.js

import express from "express";
import User from "../models/User.js";
import Deck from "../models/Deck.js";

const router = express.Router();

router.post('/create', (req, res) => {
    Deck.create({mainDeck: req.body.deck.mainDeck, extraDeck: req.body.deck.extraDeck, sideDeck: req.body.deck.sideDeck, title: req.body.deck.title, ownerId: req.body.token})
    .then((deck) => {
        res.status(200).json(deck)
    })
    .catch(err => res.status(404).json({ nousersfound: `Error encountered: ${err}` }));
});

router.post('/get', (req, res) => {
    Deck.find({ ownerId: req.body.token })
    .then((decks) => {
        return res.json(decks);
    })
    .catch(err => res.status(404).json({ nousersfound: `Error encountered: ${err}` }));
    
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