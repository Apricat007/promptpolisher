import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const LogoutSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 w-full max-w-md text-center">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Successfully Logged Out</h1>
        <p className="text-white/80 mb-6">You have been safely signed out of your account.</p>
        
        <div className="space-y-3">
          <Link to="/auth">
            <Button className="w-full">
              Sign In Again
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogoutSuccess;