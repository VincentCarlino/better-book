import mongoose from "mongoose";

const DeckSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mainDeckCardIds: {
        type: Array,
        required: true
    },
    extraDeckCardIds: {
        type: Array,
        required: true
    }
});

export default DeckSchema;