
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Infinity } from "lucide-react";
import { useCredits } from '@/hooks/useCredits';

const CreditsDisplay = () => {
  const { credits, loading } = useCredits();

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-white">
            <Coins className="h-4 w-4" />
            <span className="text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!credits) return null;

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-white">
          {credits.has_forever_access ? (
            <>
              <Infinity className="h-4 w-4 text-purple-300" />
              <span className="text-sm font-medium">Unlimited Credits</span>
            </>
          ) : (
            <>
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">
                <span className="font-medium">{credits.current_credits}</span> credits remaining
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditsDisplay;
