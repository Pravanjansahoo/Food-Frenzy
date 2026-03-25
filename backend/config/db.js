import mongoose from 'mongoose';

export const connectDB = async () => {
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      console.error("MONGODB_URI is not set in .env");
      process.exit(1);
    }

    await mongoose
      .connect(dbUri)
      .then(() => {
        console.log("MongoDB connected successfully");
      });
}
