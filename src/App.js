import "./styles.css";
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  collection,
  addDoc,
  getDocs,
  CACHE_SIZE_UNLIMITED,
  getDocsFromCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3Gg_m6W-HMayZkyNpDQ8b35WMEpoXiPs",
  authDomain: "test-todo-2951d.firebaseapp.com",
  projectId: "test-todo-2951d",
  storageBucket: "test-todo-2951d.appspot.com",
  messagingSenderId: "779904143890",
  appId: "1:779904143890:web:9cd2deed80b8e458333ecb",
  measurementId: "G-S8CS5GGH7Q"
};

const app = initializeApp(firebaseConfig);

let db;

try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
  });
} catch (error) {
  if (error.code === "failed-precondition") {
    // The app is likely already initialized. Retrieve the existing instance.
    db = getFirestore(app);
  } else {
    // Handle other errors.
    console.error("Firestore initialization error:", error);
  }
}
const taskCollecRef = collection(db, "tasks");

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const fetchAllTasks = async () => {
      let taskSnapshot;
      try {
        taskSnapshot = await getDocsFromCache(taskCollecRef);
        console.log("cache success");
        // If cache is empty, fall back to network
        if (taskSnapshot.empty) {
          throw new Error("Cache is empty, fetching from network...");
        }
      } catch (error) {
        // If fetching from cache fails, attempt to fetch from network
        console.error("Error fetching tasks from cache: ", error);
        taskSnapshot = await getDocs(taskCollecRef);
      }

      const fetchedTasks = taskSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(fetchedTasks);
      setTasks(fetchedTasks); // set tasks
    };

    fetchAllTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault(); // Add this line to prevent form from submitting traditionally

    const newTaskValue = e.target[0].value; // Retrieve the value from the input field

    try {
      const docRef = await addDoc(taskCollecRef, { text: newTaskValue });
      //set the state to the newly added task.
      setTasks((prevState) => [
        { id: docRef.id, text: newTaskValue },
        ...prevState
      ]);
      setInputText("");

      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="App">
      <h1>TODO app</h1>
      <form onSubmit={handleAddTask}>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="addtask"
        />
      </form>
      <div>
        <ul>
          {tasks &&
            tasks.map((task) => {
              return <li key={task.id}>{task.text}</li>;
            })}
        </ul>
      </div>
    </div>
  );
}

const useTasks = () => {
  return {};
};
