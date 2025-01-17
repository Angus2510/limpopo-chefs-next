import { MongoClient } from "mongodb";

/**
 * @type {string}
 */
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://anguscarey1:Gooseman12!@cluster0.z8l7w.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

/**
 * @type {Promise<MongoClient>}
 */
let clientPromise;

/**
 * Handle different environments (development vs production)
 */
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Export the client promise so it can be used elsewhere
export default clientPromise;

/**
 * Test the connection by logging success or failure
 */
clientPromise
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
