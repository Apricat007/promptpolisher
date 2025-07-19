import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, Gift } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface WatchAdForCreditsProps {
  onCreditsEarned?: () => void;
}

const WatchAdForCredits = ({ onCreditsEarned }: WatchAdForCreditsProps) => {
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const watchAd = async () => {
    setIsWatching(true);
    setCountdown(30); // 30 second ad simulation

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeAdWatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeAdWatch = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('watch-ad-reward', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Credits Earned!",
        description: `You earned ${data.creditsAdded} credits for watching the ad!`,
      });

      onCreditsEarned?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to earn credits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWatching(false);
      setCountdown(0);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Gift className="h-5 w-5 text-yellow-400" />
          Earn Free Credits
        </CardTitle>
        <CardDescription className="text-white/70">
          Watch a short ad to earn 3 free credits instantly!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isWatching ? (
          <Button 
            onClick={watchAd}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Play className="h-4 w-4 mr-2" />
            Watch Ad for 3 Credits
          </Button>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-white">
              <Clock className="h-4 w-4" />
              <span>Ad playing... {countdown}s remaining</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((30 - countdown) / 30) * 100}%` }}
              />
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-6 text-center text-white border-2 border-blue-400 shadow-xl">
              <div className="animate-pulse space-y-3">
                <div className="text-4xl">🎬</div>
                <h3 className="text-xl font-bold text-blue-200">Sample Advertisement</h3>
                <p className="text-sm">This would be a real video ad in production</p>
                <div className="bg-gray-800/50 rounded p-3 text-xs">
                  🚀 Boost your productivity with AI tools!
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WatchAdForCredits;