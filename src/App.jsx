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
import SignOut from "./components/SignOut";
import ToDoApp from "./components/todo";
import LoginPage from "./components/login-page";
import SignUpPage from "./components/sign-up-page";

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
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/signin" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
