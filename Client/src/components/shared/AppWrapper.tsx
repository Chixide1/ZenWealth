// import {
//     SidebarProvider
// } from "@/components/ui/sidebar.tsx";
import AppTopbar from "@/components/shared/AppTopbar.tsx";
// import {AppSidebar} from "@/components/shared/AppSidebar.tsx";

type DualNavbarProps = {
    children?: React.ReactNode;
    username?: string;
}

export default function AppWrapper({children, username}: DualNavbarProps) {
    return (
        // <SidebarProvider>
        //     <AppSidebar/>
        //     <main className="w-full h-screen flex flex-col overflow-hidden">
        <>
                <AppTopbar username={username}/>
                <main className="">
                    {children}
                </main>
        </>
    )
        {/*    </main>*/}
        {/*</SidebarProvider>*/}
}

