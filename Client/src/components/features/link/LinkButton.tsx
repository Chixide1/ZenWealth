import { useState, useEffect, useCallback } from "react"
import { type PlaidLinkError, type PlaidLinkOnExit, usePlaidLink } from "react-plaid-link"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils.ts"
import api from "@/lib/api.ts"
import { queryClient } from "@/main.tsx"
import Loading from "@/components/shared/Loading.tsx";

type LinkButtonProps = ButtonProps & {
    className?: string
    children: React.ReactNode
}

export function LinkButton({ children, className, ...props }: LinkButtonProps) {
    const [linkToken, setLinkToken] = useState<string>("")

    useEffect(() => {
        async function GetLinkToken() {
            await api("/link")
                .then((response) => setLinkToken(response.data.value))
                .catch((error) => console.error(error))
        }
        GetLinkToken()
    }, [])

    const { open } = usePlaidLink({
        token: linkToken,
        onSuccess: async (publicToken: string, metadata) => {
            await api.post("/Link", { publicToken: publicToken, institutionName: metadata.institution?.name });
            await api.get("/Transactions/Sync")
            await queryClient.refetchQueries();
            location.reload();
        },
        onExit: useCallback<PlaidLinkOnExit>(async (error: PlaidLinkError | null) => {
            console.debug(error)
        }, []),
    })

    return (
        <Button
            onClick={() => open()}
            className={cn("rounded-full flex items-center justify-center", className)}
            variant={"secondary"}
            disabled={!linkToken}
            {...props}
        >
            {!linkToken ?
                <Loading className="text-black" /> :
                children}
        </Button>
    )
}

