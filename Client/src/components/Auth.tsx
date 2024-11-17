import { redirect} from '@tanstack/react-router';
import axios, { AxiosResponse } from 'axios'

export async function Auth(){
    const backend = import.meta.env.VITE_ASPNETCORE_URLS
    const response = await axios.get(`${backend}/Api/Auth`, { withCredentials: true })
        .then((response: AxiosResponse) => {
            if(response.status === 200){
                console.debug("%cSuccessfully authenticated", "color: #bada55");
            }
            return 200;
        })
        .catch((error: AxiosResponse) => {
            console.error("Error occurred", error)
            return error.status
        })
    
    if(response === 401){
        throw redirect({to: "/login"})
    }
}