import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { enUS } from "date-fns/locale";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import {
  CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  SunMoon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const categories = [
  { name: "Work", color: "bg-blue-500" },
  { name: "Personal", color: "bg-green-500" },
  { name: "Health", color: "bg-red-500" },
  { name: "Learning", color: "bg-purple-500" },
  { name: "Shopping", color: "bg-yellow-500" },
];

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState("Work");
  const [filter, setFilter] = useState("all");
  const [progress, setProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const [user] = useAuthState(auth);

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (tasks.length === 0) {
      setProgress(0);
    } else {
      const completedTasks = tasks.filter((task) => task.completed).length;
      setProgress((completedTasks / tasks.length) * 100);
    }
  }, [tasks]);

  const addTask = async () => {
    if (newTask.trim() === "") {
      toast("Task cannot be empty", {
        description: "Please enter a task description",
      });
      return;
    }

    try {
      await addDoc(collection(db, "todos"), {
        title: newTask,
        completed: false,
        createdAt: serverTimestamp(),
        userId: user.uid,
        dueDate: selectedDate ? new Date(selectedDate) : null,
        priority: selectedPriority,
        category: selectedCategory,
      });
      setNewTask("");
      setSelectedDate(null);
      toast("Task added", {
        description: "Your task has been added successfully",
      });
    } catch (error) {
      console.error("Error adding task: ", error);
      toast.error("Error", {
        description: "There was an error adding the task",
      });
    }
  };

  const toggleTaskCompletion = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "todos", id), { completed: !currentStatus });
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, "todos", id));
      toast("Task deleted", {
        description: "Your task has been deleted",
      });
    } catch (error) {
      console.error("Error deleting task: ", error);
      toast.error("Error", {
        description: "There was an error deleting the task",
        variant: "destructive",
      });
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "active") return !task.completed;
    if (filter === "high") return task.priority === "high";

    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "high":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find((c) => c.name === categoryName);
    return category ? category.color : "bg-gray-500";
  };
  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    const dateObj = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return format(dateObj, "MMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Taskinator</h1>
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <SunMoon className="h-4 w-4" />
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                      aria-label="Toggle dark mode"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle dark mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt={user?.displayName || "User"}
                />
                <AvatarFallback>
                  {user?.displayName ? user.displayName.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>

              <div className="hidden md:block">
                <p className="text-sm font-medium">
                  {user?.displayName || user?.email}
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-muted-foreground"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      {user?.displayName || user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            ;
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">
                Welcome, {user?.displayName || user?.email}
              </CardTitle>
              <CardDescription>
                Manage your tasks creatively and never miss a deadline!
              </CardDescription>
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {progress.toFixed(0)}% of tasks completed
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto]">
                  <Input
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    className="flex-1"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[180px] justify-start text-left font-normal md:w-[240px]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(new Date(selectedDate), "PPP")
                        ) : (
                          <span>Pick a due date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <div className="flex flex-col items-center">
                        <Calendar
                          mode="single"
                          selected={
                            selectedDate ? new Date(selectedDate) : undefined
                          }
                          onSelect={(date) => setSelectedDate(date)}
                          initialFocus
                          locale={enUS}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Select
                    value={selectedPriority}
                    onValueChange={(value) => setSelectedPriority(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${category.color}`}
                            ></div>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addTask} className="md:col-span-4 mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </div>
                <Tabs defaultValue="all" className="w-full">
                  <div className="flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="all" onClick={() => setFilter("all")}>
                        All
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        onClick={() => setFilter("active")}
                      >
                        Active
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        onClick={() => setFilter("completed")}
                      >
                        Completed
                      </TabsTrigger>

                      <TabsTrigger
                        value="high"
                        onClick={() => setFilter("high")}
                      >
                        High Priority
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="all" className="mt-4">
                    <AnimatePresence>
                      {filteredTasks.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center py-12 text-center"
                        >
                          <div className="rounded-full bg-primary/10 p-4 mb-4">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-medium">No tasks yet</h3>
                          <p className="text-muted-foreground mt-2">
                            Add a new task above to get started!
                          </p>
                        </motion.div>
                      ) : (
                        <ul className="space-y-2">
                          {filteredTasks.map((task) => (
                            <motion.li
                              key={task.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              layout
                            >
                              <Card
                                className={cn(
                                  "transition-all duration-200",
                                  task.completed ? "bg-muted/50" : ""
                                )}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-full p-0 mt-1"
                                        onClick={() =>
                                          toggleTaskCompletion(
                                            task.id,
                                            task.completed
                                          )
                                        }
                                      >
                                        {task.completed ? (
                                          <CheckCircle2 className="h-5 w-5 text-primary" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </Button>
                                      <div className="space-y-1">
                                        <p
                                          className={cn(
                                            "text-base font-medium transition-all",
                                            task.completed
                                              ? "line-through text-muted-foreground"
                                              : ""
                                          )}
                                        >
                                          {task.title}
                                        </p>
                                        <div className="flex flex-wrap gap-2 items-center text-xs">
                                          {task.dueDate && (
                                            <Badge
                                              variant="outline"
                                              className="flex items-center gap-1"
                                            >
                                              <Clock className="h-3 w-3" />
                                              {formatDate(task.dueDate)}
                                            </Badge>
                                          )}
                                          <Badge
                                            variant="outline"
                                            className={getPriorityColor(
                                              task.priority
                                            )}
                                          >
                                            {task.priority
                                              .charAt(0)
                                              .toUpperCase() +
                                              task.priority.slice(1)}{" "}
                                            Priority
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="flex items-center gap-1"
                                          >
                                            <div
                                              className={`w-2 h-2 rounded-full ${getCategoryColor(
                                                task.category
                                              )}`}
                                            ></div>
                                            {task.category}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() => deleteTask(task.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4 text-xs text-muted-foreground">
              <p>Taskinator - Your personal task manager</p>
              <p>{new Date().getFullYear()} © All rights reserved</p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
