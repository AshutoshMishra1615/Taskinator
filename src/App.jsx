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
import ToDoApp from "./components/todo";
import LoginPage from "./components/login-page";
import SignUpPage from "./components/sign-up-page";
import { RootLayout } from "./components/layout";

const App = () => {
  const [user] = useAuthState(auth);

  return (
    <RootLayout>
      <Router>
        <div>
          {user ? (
            <>
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
    </RootLayout>
  );
};

export default App;
