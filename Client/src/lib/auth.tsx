import { redirect} from '@tanstack/react-router';
import axios, { AxiosResponse } from 'axios'

export async function Auth(){
    const response = await axios.get("http://localhost:5093/Api/Auth", { withCredentials: true })
        .then((response: AxiosResponse) => {
            if(response.status === 200){
                console.debug("%cSuccessfully authenticated", "color: #bada55");
            }
            return 200;
        })
        .catch((error: AxiosResponse) => {
            console.error("Error occurred", error)
           return 401;
        })
    
    if(response === 401){
        throw redirect({to: "/login"})
    }
}