import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Account } from '@/types';
import { Treemap, ResponsiveContainer, Tooltip, Label } from 'recharts';

type TotalBalanceCardProps = {
    className?: string 
    accounts: Account[]
}

export function TotalBalanceCard({className, accounts}: TotalBalanceCardProps) {
    const data = accounts.filter((account) => account.type !== "Credit" && account.type !== "Loan")
    // console.log(accounts)
    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle>Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer className="w-full" height={250}>
                    <Treemap
                        data={data}
                        nameKey="name"
                        dataKey="currentBalance"
                        stroke="black"
                        fill="hsl(var(--accent))"
                        className="text-black"
                    >
                        <Label className="text-black" />
                        <Tooltip />
                    </Treemap>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default TotalBalanceCard;