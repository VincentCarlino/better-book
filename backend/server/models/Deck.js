import mongoose from "mongoose";

const DeckSchema = new mongoose.Schema(
    {   
        title: String, 
        ownerId: String,
        mainDeck: [Number], 
        extraDeck: [Number], 
        sideDeck: [Number] 
    }
);

const Deck = mongoose.model('deck', DeckSchema);
export default Deck;