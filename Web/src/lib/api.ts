import axios from "axios";
import { router } from "@/main.tsx";

const isDev = import.meta.env.DEV;

const api = axios.create({
    baseURL: isDev ? import.meta.env.VITE_ASPNETCORE_URLS : "https://api.zenwealth.ckdoestech.com",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 60000,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => {
        // If we get a successful response
        if (response.status === 200) {
            // Check if this is an authentication response
            if (response.config.url?.includes("/Auth/Login") ||
                response.config.url?.includes("/Auth/LoginWithMfa") ||
                response.config.url?.includes("/User")) {

                // If we're on the login page, redirect to root
                if (window.location.pathname.includes("/login")) {
                    router.navigate({ to: "/" });
                }
            }
        }
        return response;
    },
    (error) => {
        // If we get a 401 error and we're not on the login page
        if (error.response?.status === 401 &&
            !window.location.pathname.includes("/login")) {

            router.navigate({ to: "/login" });
        }

        return Promise.reject(error);
    }
);

export default api;