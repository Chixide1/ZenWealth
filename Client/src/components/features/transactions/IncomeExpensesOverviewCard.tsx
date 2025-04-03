import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {FinancialPeriod} from "@/types.ts";
import {cn} from "@/lib/utils.ts";
import { Tabs, TabsList } from "@radix-ui/react-tabs";
import { TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faTable } from "@fortawesome/free-solid-svg-icons";
import {IncomeExpensesTable} from "@/components/features/transactions/IncomeExpensesTable.tsx";
import { IncomeExpensesBarChart } from "./IncomeExpensesBarChart";

type IncomeExpensesOverviewCardProps = {
    className?: string,
    data: FinancialPeriod[]
}

export function IncomeExpensesOverviewCard({ className, data }: IncomeExpensesOverviewCardProps) {

    return (
        <Card className={cn("bg-offblack", className)}>
            <Tabs defaultValue="BarChart">
                <CardHeader className="flex flex-col items-center justify-between space-y-2 md:space-y-0 md:flex-row pb-2">
                    <CardTitle>Income vs Expenses overview</CardTitle>
                    <TabsList className="bg-background rounded-md p-1 space-x-1">
                        <TabsTrigger value="BarChart" className="bg-transparent rounded-sm p-2">
                            <FontAwesomeIcon icon={faChartSimple} />
                        </TabsTrigger>
                        <TabsTrigger value="Table" className="bg-transparent rounded-sm p-2">
                            <FontAwesomeIcon icon={faTable} />
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent className="p-2 md:p-6">
                    <TabsContent value="BarChart">
                        <IncomeExpensesBarChart data={data} />
                    </TabsContent>
                    <TabsContent value="Table">
                        <IncomeExpensesTable data={data} />
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    );
}