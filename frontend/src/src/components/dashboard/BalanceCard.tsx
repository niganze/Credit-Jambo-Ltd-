import { useEffect, useState } from "react";
// import { supabase } from "../integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Wallet, TrendingUp } from "lucide-react";


interface BalanceCardProps {
  userId: string;
}

const BalanceCard = ({ userId }: BalanceCardProps) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("RWF");

  const fetchBalance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("accounts")
      .select("balance, currency")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching balance:", error);
    } else if (data) {
      setBalance(Number(data.balance) || 0);
      setCurrency(data.currency || "RWF");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBalance();

    // Set up realtime subscription
    const channel = supabase
      .channel("account-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accounts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-primary border-0 text-primary-foreground overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-primary-foreground">
          <Wallet className="w-5 h-5" />
          Total Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {loading ? (
          <div className="h-12 w-48 bg-white/20 rounded animate-pulse" />
        ) : (
          <div className="space-y-2">
            <div className="text-4xl font-bold">
              {formatCurrency(balance)} <span className="text-2xl">{currency}</span>
            </div>
            {balance > 0 && (
              <div className="flex items-center gap-1 text-sm text-primary-foreground/80">
                <TrendingUp className="w-4 h-4" />
                <span>Active savings account</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
