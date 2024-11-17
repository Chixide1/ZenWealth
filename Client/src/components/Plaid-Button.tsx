import { useState, useEffect } from 'react';
import {
    usePlaidLink,
    //PlaidLinkOptions,
    //PlaidLinkOnSuccess,
  } from 'react-plaid-link';
import {Button} from "@/components/ui/button.tsx";

// The usePlaidLink hook manages Plaid Link creation
// It does not return a destroy function;
// instead, on unmount it automatically destroys the Link instance
// const config: PlaidLinkOptions = {
//     onSuccess: (public_token, metadata) => {},
//     onExit: (err, metadata) => {},
//     onEvent: (eventName, metadata) => {},
//     token: null,
// };

type LinkTokenResponse = {
    value: string
}

export function PlaidButton(){
    const [linkToken, setLinkToken] = useState<string>("")

    useEffect(() => {
        async function GetLinkToken(){
            const response = await fetch(`${import.meta.env.VITE_ASPNETCORE_URLS}/api/getlinktoken`)
            const data: LinkTokenResponse = await response.json();
            setLinkToken(data.value)
            console.log(linkToken)
        }
        GetLinkToken();
    }, []);

    const { open } = usePlaidLink({
        token: linkToken,
        onSuccess: (publicToken: string) => {console.log(publicToken)}, 
    });

    return(
        <Button onClick={() => open()} className={""}>Initialise Link</Button>
    )
}