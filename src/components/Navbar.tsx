
import React from 'react';
import { Button } from "@/components/ui/button";
import { Wand2, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-purple-300" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            PromptPolish
          </span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-white">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 text-xs md:text-sm px-2 md:px-3"
              >
                <LogOut className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden xs:inline">Sign Out</span>
                <span className="xs:hidden">Out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 text-xs md:text-sm px-2 md:px-3">
                <User className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden xs:inline">Sign In</span>
                <span className="xs:hidden">In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
