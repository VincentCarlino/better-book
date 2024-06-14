import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  decks: [{ title: String, thumbnail: Number, mainDeck: [Number], extraDeck: [Number], sideDeck: [Number] }]
});

const User = mongoose.model('user', UserSchema);
export default User;