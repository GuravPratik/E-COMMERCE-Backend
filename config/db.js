const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database is connected successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectToDB;
