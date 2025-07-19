
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Sparkles, Wand2, Lock, AlertCircle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [polishedPrompt, setPolishedPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const platforms = [
    'ChatGPT',
    'Claude',
    'Midjourney',
    'DALL·E',
    'Stable Diffusion',
    'GitHub Copilot',
    'Other'
  ];

  const goals = [
    'Informative',
    'Persuasive', 
    'Creative/Storytelling',
    'Coding',
    'Visual/Descriptive',
    'Technical Documentation'
  ];

  const handlePolish = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the prompt polishing feature",
        variant: "destructive"
      });
      return;
    }

    if (!originalPrompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Add your original prompt to get started",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPlatform || !selectedGoal) {
      toast({
        title: "Missing information",
        description: "Please select both platform and goal",
        variant: "destructive"
      });
      return;
    }

    setIsPolishing(true);
    
    try {
      console.log('Calling polish-prompt function with:', {
        originalPrompt,
        platform: selectedPlatform,
        goal: selectedGoal
      });

      const { data, error } = await supabase.functions.invoke('polish-prompt', {
        body: {
          originalPrompt,
          platform: selectedPlatform,
          goal: selectedGoal
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data || !data.polishedPrompt) {
        throw new Error('No polished prompt received from API');
      }

      setPolishedPrompt(data.polishedPrompt);
      toast({
        title: "Prompt polished! ✨",
        description: "Your enhanced prompt is ready to use"
      });
    } catch (error: any) {
      console.error('Error polishing prompt:', error);
      
      let errorMessage = "Failed to polish prompt. Please try again.";
      let errorDescription = "";
      
      if (error.message.includes('API key')) {
        errorMessage = "API Configuration Issue";  
        errorDescription = "Please check your Groq API key configuration.";
      } else if (error.message) {
        errorDescription = error.message;
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive"
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try selecting the text manually",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Wand2 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-300" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              PromptPolish
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-2">
            Transform your rough AI prompts into polished, effective masterpieces that get better results
          </p>
        </div>

        {/* Premium Links */}
        {user && (
          <div className="max-w-2xl mx-auto mb-6 px-4">
            <div className="bg-white/10 backdrop-blur-lg border-white/20 rounded-lg p-4">
              <h3 className="text-white font-semibold text-center mb-3">🚀 Boost Your Prompts</h3>
              <div className="flex gap-3">
                <a 
                  href="https://promptpolish.gumroad.com/l/300-prompts" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-center text-sm"
                >
                  🎁 FREE Pack
                </a>
                
                <a 
                  href="https://promptpolish.gumroad.com/l/3000-prompts" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-center text-sm"
                >
                  ⭐ Premium $5
                </a>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-center">
                  <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-purple-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Sign in to Polish Your Prompts</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                    Create an account or sign in to access our AI-powered prompt enhancement feature powered by ChatGPT-level AI.
                  </p>
                  <Link to="/auth">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Input Section */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  Original Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Textarea
                  placeholder="Paste your rough prompt here... (e.g., 'make me a logo for my coffee shop')"
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                  className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none text-sm sm:text-base"
                  disabled={!user}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300 mb-2 block">AI Platform</label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform} disabled={!user}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm sm:text-base">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300 mb-2 block">Goal/Tone</label>
                    <Select value={selectedGoal} onValueChange={setSelectedGoal} disabled={!user}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm sm:text-base">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map((goal) => (
                          <SelectItem key={goal} value={goal}>
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handlePolish}
                  disabled={isPolishing || !user}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  {isPolishing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="hidden sm:inline">Polishing with ChatGPT-level AI...</span>
                      <span className="sm:hidden">Polishing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      {!user ? 'Sign in to Polish' : 'Polish It!'}
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 justify-between text-base sm:text-lg lg:text-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    Polished Prompt
                  </div>
                  {polishedPrompt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(polishedPrompt)}
                      className="text-purple-300 hover:text-white hover:bg-white/10 p-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {polishedPrompt ? (
                  <div className="bg-white/5 border border-white/20 rounded-lg p-3 sm:p-4 min-h-[100px] sm:min-h-[120px] lg:min-h-[140px]">
                    <p className="text-gray-200 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{polishedPrompt}</p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/20 rounded-lg p-3 sm:p-4 min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex items-center justify-center">
                    <p className="text-gray-400 text-center text-sm sm:text-base">
                      {user ? 'Your polished prompt will appear here...' : 'Sign in to see polished prompts'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-white mb-4 sm:mb-6 lg:mb-8">
              Why PromptPolish Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-white/5 backdrop-blur-lg border-white/20 text-center">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2">ChatGPT-Powered</h3>
                  <p className="text-gray-300 text-xs sm:text-sm lg:text-base">
                    Powered by advanced AI to understand prompt engineering best practices and apply them automatically
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-lg border-white/20 text-center">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2">Platform Optimized</h3>
                  <p className="text-gray-300 text-xs sm:text-sm lg:text-base">
                    Tailored enhancements for ChatGPT, Midjourney, DALL·E, and more
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-lg border-white/20 text-center sm:col-span-2 lg:col-span-1">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Copy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2">Instant Results</h3>
                  <p className="text-gray-300 text-xs sm:text-sm lg:text-base">
                    Get your enhanced prompt in seconds, ready to copy and use
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
