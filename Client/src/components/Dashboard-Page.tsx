import {PlaidButton} from "@/components/Plaid-Button.tsx";


export function DashboardPage() {
    return (
        <main className={"h-screen w-full"}>
            <h1 className={'text-5xl text-secondary'}>Dashboard</h1>
            <PlaidButton />
        </main>
    )
}