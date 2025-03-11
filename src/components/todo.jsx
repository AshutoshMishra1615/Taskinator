import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import {
  doc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ToDoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [user] = useAuthState(auth);

  const addToDo = async (taskText) => {
    if (!user || !taskText.trim()) return;
    try {
      await addDoc(collection(db, "todos"), {
        text: taskText,
        completed: false,
        createdAt: serverTimestamp(),
        userId: user.uid,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const deleteToDo = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const toggleTask = async (id, checked) => {
    try {
      await updateDoc(doc(db, "todos", id), { completed: checked });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const q = query(
      collection(db, "todos"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setTasks(todosArray);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      addToDo(newTask);
      setNewTask("");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Taskinator</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          maxLength={100}
        />
        <Button type="submit">
          <Plus className="w-5 h-5" />
        </Button>
      </form>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">
            No tasks yet. Add one above!
          </p>
        ) : (
          tasks.map((task) => (
            <Card
              key={task.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => toggleTask(task.id, checked)}
                  aria-label="Toggle task completion"
                />
                <span
                  className={`
flex-1 ${task.completed ? "line-through text-gray-500" : ""}
`}
                >
                  {task.text}
                </span>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteToDo(task.id)}
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
