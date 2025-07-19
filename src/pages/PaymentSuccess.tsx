
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        setIsProcessing(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId }
        });

        if (error) {
          console.error('Payment verification error:', error);
        } else {
          setPaymentDetails(data);
        }
      } catch (error) {
        console.error('Payment processing error:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [sessionId]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4"></div>
            <p className="text-white">Processing your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md w-full">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <CardTitle className="text-white text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">
            Thank you for your purchase! Your account has been updated.
          </p>
          
          {paymentDetails && (
            <div className="bg-white/5 rounded-lg p-4 text-left">
              <h3 className="text-white font-semibold mb-2">Purchase Details:</h3>
              {paymentDetails.type === 'credits' ? (
                <p className="text-gray-300">
                  ✨ {paymentDetails.credits} credits added to your account
                </p>
              ) : (
                <p className="text-gray-300">
                  🚀 Forever access activated - unlimited prompts!
                </p>
              )}
            </div>
          )}

          <Link to="/">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Home className="h-4 w-4 mr-2" />
              Return to PromptPolish
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
