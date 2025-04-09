import React, {Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {AlertTriangle, Settings, Trash2, UserRoundPen } from "lucide-react";
import {Card, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Alert, AlertDescription, AlertTitle} from "../ui/alert";
import {userDetailsAtom} from "@/lib/atoms.ts";
import { useAtom } from "jotai";
import api from "@/lib/api.ts";
import {toast} from "@/hooks/use-toast.ts";
import { useQueryClient } from "@tanstack/react-query";


// ==================== TYPES ====================
type SettingsSidebarItem = {
    id: string,
    label: string,
    title: string,
    content: React.ReactElement
    icon?: React.ReactNode,
};

type SettingsDialogProps = {
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    isOpen: boolean,
    className?: string,
};

// ==================== CONSTANTS ====================
const settingsSections: SettingsSidebarItem[] = [
    {
        id: "account",
        label: "Account",
        title: "Account Settings",
        content: <AccountSection />,
        icon: <UserRoundPen /> 
    },
    // { id: "security", label: "Security" },
    // { id: "help", label: "Help & Support" },
];

// ==================== COMPONENT ====================
export function SettingsDialog({ className, isOpen, setIsOpen }: SettingsDialogProps) {
    const [activeSection, setActiveSection] = useState<SettingsSidebarItem>(settingsSections[0]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className={cn(
                "max-w-[90%] sm:max-w-[85%] p-0 backdrop-blur-sm border-neutral-700 bg-charcoal/90 rounded-md",
                className
            )}>
                <div className="flex divide-x divide-neutral-800">
                    {/* Sidebar */}
                    <aside className="w-fit md:w-40 flex flex-col">
                        <div className="p-4 md:p-3 font-medium text-base border-b border-neutral-700 inline-flex gap-2 items-center justify-center md:justify-start">
                            <Settings className="h-auto w-[1em]" />
                            <h2 className="hidden md:inline">Settings</h2>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2">
                                {settingsSections.map((section) => (
                                    <Button
                                        key={section.id}
                                        variant="ghost"
                                        title={section.label}
                                        className={cn(
                                            "w-full md:justify-start text-left p-2 gap-2 items-center",
                                            activeSection.id === section.id
                                                ? "bg-background"
                                                : ""
                                        )}
                                        onClick={() => {
                                            setActiveSection(settingsSections.find(section => 
                                                section.id === section.id) ?? settingsSections[0]);
                                        }}
                                    >
                                        {section.icon && (
                                            <span>{section.icon}</span>
                                        )}
                                        <span className="hidden md:inline">{section.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 w-full !border-l !border-neutral-700">
                        <DialogHeader className="p-3 border-b border-neutral-700">
                            <DialogTitle className="text-base font-medium">{activeSection.title}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="flex-1 h-[70vh]">
                            {activeSection.content}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

type DeleteItemResponse = {
    success: boolean,
    error: string | null,
}

type DeleteUserResponseError = {
    code: string,
    description: string,
}

type DeleteUserResponse = {
    success: boolean,
    errors: DeleteUserResponseError[],
}

function AccountSection() {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [{data}] = useAtom(userDetailsAtom);
    const institutions = data?.institutions ?? [];
    const queryClient = useQueryClient();

    const handleDeleteBank = async (id: number) => {
        setIsLoading(true);
        const response = await api.delete<DeleteItemResponse>(`/Link/${id}`);

        if(response.status === 200) {
            toast({title: "Disconnect Status", description: "Successfully removed the account!"});
        }
        else {
            toast({title: "Unable to remove connected account", description: response.data.error, variant: "destructive"});
        }

        if(institutions.length === 1){
            window.location.reload();
            return;
        }

        await queryClient.refetchQueries();
        setIsLoading(false);
    };

    const handleDeleteUser = async () => {
        setIsLoading(true);
        const response = await api.delete<DeleteUserResponse>("/User");
        setIsLoading(false);

        if(response.status === 200) {
            toast({title: "Delete Status", description: "Your account has now been deleted"});
        }
        else {
            toast({title: "Delete Status", description: response.data.errors[0].description, variant: "destructive"});
        }

        window.location.reload();
    };
    
    return (
        <section className="p-4 space-y-6">
            {/* Connected Banking Institutions */}
            <div>
                <h3 className="text-lg font-medium mb-3">Connected Banking Institutions</h3>
                <div className="space-y-3">
                    {institutions.length > 0 ? (
                        institutions.map(bank => (
                            <Card key={bank.id} className="bg-neutral-800 border-neutral-700">
                                <CardHeader className="py-3 px-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium">{bank.name}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-red-500 hover:text-red-400 hover:bg-red-950/30"
                                            onClick={() => handleDeleteBank(bank.id)}
                                            isLoading={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span>Disconnect</span>
                                        </Button>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    ) : (
                        <p className="text-sm text-neutral-400">No banking institutions connected</p>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div>
                <h3 className="text-lg font-medium mb-3 text-red-500">Danger Zone</h3>

                {showDeleteConfirm ? (
                    <Alert variant="destructive" className="bg-red-950/30 border-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning: This action cannot be undone</AlertTitle>
                        <AlertDescription className="mt-2">
                            <p className="mb-4">Deleting your account will permanently remove all your data, preferences, and connected banking institutions. Are you absolutely sure you want to proceed?</p>
                            <div className="flex gap-3">
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteUser}
                                    isLoading={isLoading}
                                >
                                    Permanently Delete Account
                                </Button>
                                <Button
                                    isLoading={isLoading}
                                    variant="outline"
                                    className="border-neutral-600"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 />
                        Delete Account
                    </Button>
                )}
            </div>
        </section>
    );
}

// Placeholder components for other sections
function SecuritySection() {
    return (
        <>
            <DialogHeader className="p-6 pb-2">
                <DialogTitle>Security</DialogTitle>
                <DialogDescription>
                    Manage your account security and authentication methods.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 p-6 pt-2">
                <div className="space-y-6">
                    <p>Security settings will appear here.</p>
                </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-2">
                <Button type="submit">Save changes</Button>
            </DialogFooter>
        </>
    );
}

function HelpSection() {
    return (
        <>
            <DialogHeader className="p-6 pb-2">
                <DialogTitle>Help & Support</DialogTitle>
                <DialogDescription>
                    Find resources and get support for any questions you have.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 p-6 pt-2">
                <div className="space-y-6">
                    <p>Help resources will appear here.</p>
                </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-2">
                <Button>Contact Support</Button>
            </DialogFooter>
        </>
    );
}