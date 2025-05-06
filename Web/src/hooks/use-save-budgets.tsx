import { Budget } from "@/types";
import { useState } from "react";
import api from "@/lib/api.ts";
import {toast} from "@/hooks/use-toast.ts";
import { useQueryClient } from "@tanstack/react-query";

export function UseSaveBudgets() {
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    const saveBudgets = async (budgets: Budget[]) => {
        try {
            setIsSaving(true);
            const response = await api.post("/Budgets", budgets);

            if (response.status === 200) {
                toast({
                    title: "Budgets updated",
                    description: "Your budget limits have been saved successfully.",
                });
            } else {
                toast({
                    title: "Error Saving Budget",
                    description: "Unable to save budget limits.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error saving budget data:", error);
            
            toast({
                title: "Error Saving Budget",
                description: "There was a problem saving your budget limits. Please try again.",
                variant: "destructive",
            });
        } finally {
            await queryClient.invalidateQueries({ queryKey: ["budgets"] });
            setIsSaving(false);
        }
    };
    
    return ({
        saveBudgets,
        isSaving,
    });
}