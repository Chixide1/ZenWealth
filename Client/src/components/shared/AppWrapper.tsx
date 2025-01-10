import {
    SidebarProvider
} from "@/components/ui/sidebar.tsx";
import AppTopbar from "@/components/shared/AppTopbar.tsx";
import {AppSidebar} from "@/components/shared/AppSidebar.tsx";

type DualNavbarProps = {
    children?: React.ReactNode;
    username?: string;
}

export default function AppWrapper({children, username}: DualNavbarProps) {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <main className="bg-background w-full h-screen flex flex-col overflow-hidden">
                <AppTopbar username={username}/>
                <section className="flex-grow overflow-auto scrollbar-thin px-4 md:ps-0 pb-10">
                    {children}
                </section>
            </main>
        </SidebarProvider>
    )
}

