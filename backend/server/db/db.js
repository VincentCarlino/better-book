import mongoose from 'mongoose';
const db = 'mongodb://127.0.0.1:27017/spellbook';
 
const connectDB = async () => {
    try {
      await mongoose.connect(db, {
        authSource: "admin",
        user: "admin",
        pass: "pass",
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB is Connected...");
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  };

export default connectDB;
 