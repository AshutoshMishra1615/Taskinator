import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

const SignOut = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Sign-out successful!");
    } catch (error) {
      console.error("Error signing out:", error);
      alert(error.message);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="border-gray-300 hover:border-gray-500 transition-colors"
    >
      Sign Out
    </Button>
  );
};

export default SignOut;
