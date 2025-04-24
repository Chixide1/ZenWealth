import axios from "axios";
import { router } from "@/main.tsx";

const api = axios.create({
    baseURL: import.meta.env.VITE_ASPNETCORE_URLS,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 20000,
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