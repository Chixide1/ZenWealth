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
    (response) => response,
    (error) => {
        if ((error.response && error.response.status === 401) ||
            error.code === "ECONNABORTED"
        ) {
            // Don't redirect if already on login page
            if (window.location.pathname !== "/login") {
                router.navigate({ to: "/login" });
            }
            return Promise.reject(error);
        } else {
            return Promise.reject(error);
        }
    }
);

export default api;