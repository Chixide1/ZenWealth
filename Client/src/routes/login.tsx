import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/Login-Page";

export const Route = createFileRoute('/login')({
    component: LoginPage,
})