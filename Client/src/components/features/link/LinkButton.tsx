import { useState, useEffect, useCallback, Fragment } from "react"
import { type PlaidLinkError, type PlaidLinkOnExit, usePlaidLink } from "react-plaid-link"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils.ts"
import api from "@/lib/api.ts"
import { queryClient } from "@/main.tsx"
import Loading from "@/components/shared/Loading.tsx";
import { AxiosResponse } from "axios"

type LinkButtonProps = ButtonProps & {
    className?: string
    children: React.ReactNode
}

export function LinkButton({ children, className, ...props }: LinkButtonProps) {
    const [linkToken, setLinkToken] = useState<string>("")
    // const [response, setResponse] = useState<AxiosResponse | null>(null)

    useEffect(() => {
        async function GetLinkToken() {
            await api("/link")
                .then((response) => setLinkToken(response.data.value))
                .catch((error) => console.error(error))
        }
        GetLinkToken()
    }, [])

    const { open,  } = usePlaidLink({
        token: linkToken,
        onSuccess: async (publicToken: string, metadata) => {
            const response = await api.post("/Link", { publicToken: publicToken, institutionName: metadata.institution?.name })
            console.log(response)
            const syncRes = await fetch("http://localhost:5093/Transactions/Sync", {
                credentials: 'include'
            })
            console.log(syncRes)
            await queryClient.refetchQueries();
            // location.reload();
        },
        onExit: useCallback<PlaidLinkOnExit>(async (error: PlaidLinkError | null) => {
            if(error){
                console.error(error)
            }
        }, []),
    })

    // useEffect(() => {
    //     async function fetchData() {
    //         if(response) {
    //             console.log(response)
    //             await queryClient.refetchQueries();
    //             location.reload();
    //         }
    //     }
    //     fetchData()
    // }, [response]);
    
    return (
        <Button
            onClick={() => open()}
            className={cn("rounded-full flex items-center justify-center", className)}
            variant={"secondary"}
            disabled={!linkToken}
            {...props}
        >
            {!linkToken ?
                <Fragment>
                    <Loading className="text-black" />
                    <span className="mr-0.5">Fetching</span>
                </Fragment> :
                children}
        </Button>
    )
}

