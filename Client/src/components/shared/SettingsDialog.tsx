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
import { Settings, UserRoundPen } from "lucide-react";


// ==================== TYPES ====================
type SettingsSidebarItem = {
    id: string,
    label: string,
    title: string,
    content: React.ReactElement
    icon?: React.ReactNode,
};

type SettingsDialogProps = {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    isOpen: boolean;
    className?: string;
};

// ==================== CONSTANTS ====================
const settingsSections: SettingsSidebarItem[] = [
    // { id: "profile", label: "Profile" },
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
    const [activeSection, setActiveSection] = useState<string>("account");

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
                                            activeSection === section.id
                                                ? "bg-background"
                                                : ""
                                        )}
                                        onClick={() => setActiveSection(section.id)}
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
                            <DialogTitle className="text-base font-medium">Account Settings</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="flex-1 h-[70vh]">
                            {settingsSections.find(section => section.id === activeSection)?.content ??
                                settingsSections[0].content
                            }
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AccountSection() {
    return (
        <section>
            <div className="p-4">
            </div>
            <DialogFooter className="p-4">
                <Button type="submit" className="bg-red-500 text-primary">Delete Account</Button>
            </DialogFooter>
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