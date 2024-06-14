import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
    players: [String], 
    settings: [Number],
    coordinates: [{id: Number, x: Number, y: Number, parent: Number}]
});

const Game = mongoose.model('user', GameSchema);
export default Game;