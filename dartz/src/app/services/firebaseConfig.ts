import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "ToDo in env",
  authDomain: "ToDo in env",
  databaseURL: "ToDo in env",
  projectId: "ToDo in env",
  storageBucket: "ToDo in env",
  messagingSenderId: "ToDo in env",
  appId: "ToDo in env",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
