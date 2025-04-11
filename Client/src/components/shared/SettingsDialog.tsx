import React, {Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {AlertTriangle, Settings, Trash2, UserRoundPen, Shield, Check, Copy } from "lucide-react";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Alert, AlertDescription, AlertTitle} from "../ui/alert";
import {userDetailsAtom} from "@/lib/atoms";
import { useAtom } from "jotai";
import api from "@/lib/api";
import {toast} from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// ==================== TYPES ====================
type SettingsSidebarItem = {
    id: string,
    label: string,
    title: string,
    Content: () => JSX.Element,
    Icon?: React.ComponentType<React.ComponentProps<"svg">>,
};

type SettingsDialogProps = {
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    isOpen: boolean,
    className?: string,
};

type MfaStatus = {
    enabled: boolean;
};

type MfaSetupData = {
    sharedKey: string;
    authenticatorUri: string;
    qrCode: string;
};

type MfaVerifyResponse = {
    success: boolean;
    message: string;
    recoveryCodes: string[];
};

// ==================== CONSTANTS ====================
const settingsSections: SettingsSidebarItem[] = [
    {
        id: "account",
        label: "Account",
        title: "Account Settings",
        Content: AccountSection,
        Icon: UserRoundPen
    },
    {
        id: "security", 
        label: "Security",
        title: "Security Settings",
        Content: SecuritySection,
        Icon: Shield
    },
    // { id: "help", label: "Help & Support" },
];

// ==================== COMPONENT ====================
export function SettingsDialog({ className, isOpen, setIsOpen }: SettingsDialogProps) {
    const [activeSection, setActiveSection] = useState<string>(settingsSections[0].id);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className={cn(
                "max-w-[90%] sm:max-w-[85%] min-h-[80%] p-0 backdrop-blur-sm border-neutral-700 bg-charcoal/90 rounded-md",
                className
            )}>
                <Tabs 
                    defaultValue={settingsSections[0].id} 
                    value={activeSection} 
                    onValueChange={setActiveSection}
                    className="flex divide-x divide-neutral-800"
                >
                    {/* Sidebar */}
                    <aside className="w-fit md:w-40 flex flex-col">
                        <div className="p-4 md:p-3 font-medium text-base border-b border-neutral-700 inline-flex gap-2 items-center justify-center md:justify-start">
                            <Settings className="h-auto w-[1em]" />
                            <h2 className="hidden md:inline">Settings</h2>
                        </div>
                        <ScrollArea className="flex-1">
                            <TabsList className="flex flex-col bg-transparent p-2 h-auto">
                                {settingsSections.map((section) => (
                                    <TabsTrigger
                                        key={section.id}
                                        value={section.id}
                                        className={"w-full md:justify-start text-left p-2 gap-2 items-center rounded-sm bg-inherit data-[state=active]:bg-background text-primary data-[state=active]:text-secondary duration-300 transition-colors"}
                                    >
                                        {section.Icon && <section.Icon className="h-auto w-[1.25em]" />}
                                        <span className="hidden md:inline">{section.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </ScrollArea>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 w-full !border-l !border-neutral-700">
                        {settingsSections.map((section) => (
                            <TabsContent key={section.id} value={section.id} className="mt-0 flex flex-col">
                                <DialogHeader className="p-3 border-b border-neutral-700">
                                    <DialogTitle className="text-base font-medium">{section.title}</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="flex-1 h-[70vh]">
                                    <section.Content />
                                </ScrollArea>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
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

    useEffect(() => {
        const refreshStatus = async () => {
            if(institutions.length === 0){
                window.location.reload();
                return;
            }
        };
        refreshStatus();
    }, [institutions.length]);

    const handleDeleteBank = async (id: number) => {
        setIsLoading(true);
        const response = await api.delete<DeleteItemResponse>(`/Link/${id}`);

        if(response.status === 200) {
            toast({title: "Disconnect Status", description: "Successfully removed the account!"});
        }
        else {
            toast({title: "Unable to remove connected account", description: response.data.error, variant: "destructive"});
        }

        queryClient.refetchQueries();
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
        <section className="p-4 space-y-6 max-w-full">
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
                                            disabled={isLoading}
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
            <div className="">
                <h3 className="text-lg font-medium mb-3 text-red-500">Danger Zone</h3>

                {showDeleteConfirm ? (
                    <Alert variant="destructive" className="bg-red-950/30 border-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning: This action cannot be undone</AlertTitle>
                        <AlertDescription className="mt-2">
                            <p className="mb-4">Deleting your account will permanently remove all your data, preferences, and connected banking institutions. Are you absolutely sure you want to proceed?</p>
                            <div className="flex gap-3 flex-wrap items-center justify-center md:justify-normal">
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteUser}
                                    disabled={isLoading}
                                >
                                    Permanently Delete Account
                                </Button>
                                <Button
                                    disabled={isLoading}
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
                        <Trash2 className="mr-2" />
                        Delete Account
                    </Button>
                )}
            </div>
        </section>
    );
}

function SecuritySection() {
    const [mfaStatus, setMfaStatus] = useState<MfaStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    
    useEffect(() => {
        fetchMfaStatus();
    }, []);
    
    const fetchMfaStatus = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<MfaStatus>("/Auth/GetMfaStatus");
            if (response.status === 200) {
                setMfaStatus(response.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch MFA status",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const setupMfa = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<MfaSetupData>("/Auth/EnableMfa");
            if (response.status === 200) {
                setSetupData(response.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to setup MFA",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const verifyMfaCode = async () => {
        if (!verificationCode) {
            toast({
                title: "Error",
                description: "Please enter a verification code",
                variant: "destructive"
            });
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await api.post<MfaVerifyResponse>("/Auth/VerifyMfaCode", {
                code: verificationCode
            });
            
            if (response.status === 200 && response.data.success) {
                toast({
                    title: "Success",
                    description: "Two-factor authentication has been enabled"
                });
                setMfaStatus({ enabled: true });
                setSetupData(null);
                setRecoveryCodes(response.data.recoveryCodes);
                setShowRecoveryCodes(true);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Invalid verification code",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const disableMfa = async () => {
        setIsLoading(true);
        try {
            const response = await api.post("/Auth/DisableMfa");
            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "Two-factor authentication has been disabled"
                });
                setMfaStatus({ enabled: false });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to disable MFA",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyRecoveryCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join("\n"))
            .then(() => {
                toast({
                    title: "Success",
                    description: "Recovery codes copied to clipboard"
                });
            })
            .catch(() => {
                toast({
                    title: "Error",
                    description: "Failed to copy recovery codes",
                    variant: "destructive"
                });
            });
    };
    
    return (
        <section className="p-4 space-y-6 max-w-full">
            <div>
                <h3 className="text-lg font-medium mb-3">Two-Factor Authentication</h3>
                
                {mfaStatus?.enabled ? (
                    <>
                        <div className="mb-4">
                            <div className="flex items-center gap-2 text-green-500 mb-3">
                                <Check className="h-5 w-5" />
                                <span className="font-medium">Two-factor authentication is enabled</span>
                            </div>
                            <p className="text-sm text-neutral-400 mb-4">
                                Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
                            </p>
                            <Button
                                variant="outline"
                                onClick={disableMfa}
                                disabled={isLoading}
                                className="border-neutral-600"
                            >
                                Disable Two-Factor Authentication
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-neutral-400 mb-4">
                            Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
                        </p>
                        
                        {!setupData ? (
                            <Button
                                onClick={setupMfa}
                                disabled={isLoading}
                            >
                                Set up two-factor authentication
                            </Button>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-base font-medium mb-2">1. Scan the QR code</h4>
                                    <p className="text-sm text-neutral-400 mb-3">
                                        Scan the QR code below with your authenticator app (like Google Authenticator, Microsoft Authenticator, or Authy).
                                    </p>
                                    <div className="flex justify-center mb-4">
                                        <img 
                                            src={`data:image/png;base64,${setupData.qrCode}`} 
                                            alt="QR Code"
                                            className="w-48 h-48" 
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-base font-medium mb-2">2. Enter verification code</h4>
                                    <p className="text-sm text-neutral-400 mb-3">
                                        Enter the 6-digit code from your authenticator app to verify setup.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            className="bg-neutral-800 border-neutral-700 w-48"
                                            placeholder="Enter 6-digit code"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            maxLength={6}
                                        />
                                        <Button 
                                            onClick={verifyMfaCode}
                                            disabled={isLoading || verificationCode.length !== 6}
                                        >
                                            Verify
                                        </Button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-base font-medium mb-2">Manual setup</h4>
                                    <p className="text-sm text-neutral-400 mb-2">
                                        If you can't scan the QR code, enter this key manually in your authenticator app:
                                    </p>
                                    <div className="bg-neutral-800 p-3 rounded-md font-mono text-sm break-all">
                                        {setupData.sharedKey}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {showRecoveryCodes && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Recovery Codes</h3>
                    <Alert className="bg-yellow-950/30 border-yellow-500 text-primary">
                        <AlertTriangle className="h-4 w-4 !text-yellow-500" />
                        <AlertTitle className="text-yellow-500">Save these recovery codes</AlertTitle>
                        <AlertDescription className="mt-2">
                            <p className="mb-4 text-sm">
                                Keep these recovery codes in a secure location. Each code can only be used once if you lose access to your authenticator device.
                            </p>
                            <div className=" p-3 rounded-md font-mono text-sm mb-3">
                                {recoveryCodes.map((code, index) => (
                                    <div key={index} className="mb-1">{code}</div>
                                ))}
                            </div>
                            <Button 
                                variant="outline" 
                                className="border-neutral-500 text-sm" 
                                size="sm"
                                onClick={copyRecoveryCodes}
                            >
                                <Copy className="h-3 w-3 mr-2" />
                                Copy Recovery Codes
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </section>
    );
}