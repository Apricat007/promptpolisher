
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Infinity, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface PurchaseCreditsProps {
  onPurchaseComplete?: () => void;
}

const PurchaseCredits = ({ onPurchaseComplete }: PurchaseCreditsProps) => {
  const [creditAmount, setCreditAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchaseCredits = async () => {
    if (creditAmount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of credits",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          type: 'credits',
          credits: creditAmount,
          amount: creditAmount * 10 // 10 cents per credit = $0.10 per credit
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to create payment session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseForever = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          type: 'forever',
          amount: 2000 // $20.00 in cents
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to create payment session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Buy Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="1"
              value={creditAmount}
              onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
              className="bg-white/5 border-white/20 text-white"
              placeholder="Number of credits"
            />
            <span className="text-gray-300 text-sm">
              = ${(creditAmount * 0.1).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            10 credits = $1.00 USD
          </p>
          <Button
            onClick={handlePurchaseCredits}
            disabled={isLoading || creditAmount < 1}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : `Buy ${creditAmount} Credits`}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Infinity className="h-5 w-5" />
            Forever Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm">
            Get unlimited prompt polishing forever - no more credit limits!
          </p>
          <div className="text-center">
            <span className="text-2xl font-bold text-white">$20.00</span>
            <span className="text-gray-400 text-sm block">One-time payment</span>
          </div>
          <Button
            onClick={handlePurchaseForever}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Infinity className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : 'Get Forever Access'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseCredits;
