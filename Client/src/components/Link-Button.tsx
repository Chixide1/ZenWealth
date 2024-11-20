import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import {Button} from "@/components/ui/button.tsx";
import axios from 'axios'

type LinkTokenResponse = {
    value: string
}

export function LinkButton(){
    const [linkToken, setLinkToken] = useState<string>("")
    const backend = import.meta.env.VITE_ASPNETCORE_URLS + "/Api"

    useEffect(() => {
        async function GetLinkToken(){
            await axios.get<LinkTokenResponse>(
                `${backend}/GetLinkToken`,
                {withCredentials: true}
            )
                .then(response => setLinkToken(response.data.value))
                .catch(error => console.log(error))
        }
        GetLinkToken();
    }, []);

    const { open } = usePlaidLink({
        token: linkToken,
        onSuccess: (publicToken: string) => {
            axios.post(
                `${backend}/ExchangePublicToken`,
                {publicToken: publicToken}, 
                {withCredentials: true}
            )
        }, 
    });

    return(
        <Button onClick={() => open()} className={"w-full"} variant={"secondary"}>Connect Your Account</Button>
    )
}