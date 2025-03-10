// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import SignOut from "./components/SignOut";
import ToDoApp from "./components/todo";

const App = () => {
  const [user] = useAuthState(auth);

  return (
    <Router>
      <div>
        {user ? (
          <>
            <SignOut />
            <ToDoApp />
          </>
        ) : (
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<Navigate to="/signin" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
