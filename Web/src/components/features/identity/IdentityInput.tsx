import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldValues } from "react-hook-form";
import { type LucideIcon } from "lucide-react";

export type IdentityInputConfig = {
    id: string;
    label: string;
    type: string;
    placeholder?: string;
    register: ReturnType<UseFormRegister<FieldValues>>;
    icon: LucideIcon;
    autocomplete?: string;
}

export function IdentityInput({id, label, type = "text", placeholder, register, icon: Icon, autocomplete}: IdentityInputConfig) {
    return (
        <div className="relative border-b border-b-neutral-700 last:border-b-0">
            <Label
                htmlFor={id}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-neutral-100/[0.07] rounded-full"
            >
                <Icon className="h-4 w-4"/>
            </Label>
            <Label htmlFor={id} className="absolute left-14 top-2 text-xs text-neutral-500">
                {label}
            </Label>
            <Input
                className="pl-14 focus-visible:ring-0 focus-visible:bg-background/20 pb-5 bg-neutral-300/[0.07] border-0 placeholder:text-transparent rounded-none border-b-0 pt-9"
                placeholder={placeholder}
                type={type}
                id={id}
                autoComplete={autocomplete}
                {...register}
            />
        </div>
    );
}

