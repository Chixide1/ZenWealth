import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Treemap, ResponsiveContainer, Tooltip, Label } from 'recharts';

const data = [
    { name: 'Current Account', amount: 400 },
    { name: 'Savings Account', amount: 300 },
    { name: 'Loan Account', amount: 200 },
]

export function TotalBalanceCard({className}: { className?: string }) {
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
                        dataKey="amount"
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