import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import { zodResolver } from "@hookform/resolvers/zod"
import {Controller, useForm } from "react-hook-form"
import { z } from "zod"
import {Input} from "@/components/ui/input.tsx";
import { Mail, Lock } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password cannot be empty"),
    rememberMe: z.boolean().default(false)
})

export function LoginForm() {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    })
    
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("Form validation errors:", errors)
        }
    }, [errors])
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center w-9/12 text-sm">
            <div className="overflow-hidden rounded-md w-full text-secondary">
                <div className="relative">
                    <Label
                        htmlFor="loginEmail"
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-neutral-100/[0.07] rounded-full">
                        <Mail className="h-4 w-4"/>
                    </Label>
                    <Label htmlFor="loginEmail"
                           className="absolute left-14 top-2 text-xs text-neutral-500">Email</Label>
                    <Input
                        // defaultValue={""}
                        className="pl-14 pb-5 bg-neutral-300/[0.07] border-0 placeholder:text-transparent rounded-none border-b-0 pt-9"
                        placeholder="Email"
                        type="email"
                        id="loginEmail"
                        {...register("email")}
                    />
                </div>
                <div className="relative">
                    <Label
                        htmlFor="loginPass"
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-neutral-100/[0.07] rounded-full">
                        <Lock className="h-4 w-4"/>
                    </Label>
                    <Label htmlFor="loginPass"
                           className="absolute left-14 top-2 text-xs text-neutral-500">Password</Label>
                    <Input
                        // defaultValue={""}
                        className="pl-14 pb-5 bg-neutral-300/[0.07] placeholder:text-transparent rounded-none pt-9 border-0 border-t border-neutral-700 focus-visible:ring-0"
                        placeholder="Password"
                        type="password"
                        id="loginPass"
                        {...register("password")}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between w-full mt-3">
                <div className="flex items-center space-x-2">
                    <Controller
                        name={"rememberMe"}
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="rememberMe"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label
                        htmlFor="rememberMe"
                        className="font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Remember Me
                    </Label>
                </div>
                <a href="#" className="text-accent font-normal">Forgot Password?</a>
            </div>
            {errors.email && <span className="text-red-500">{errors.email.message}</span>}
            {errors.password && <span className="text-red-500">{errors.password.message}</span>}
            <Button type="submit"
                    variant="accent"
                    className="mt-6 font-medium w-full hover:bg-accent/80">Continue
            </Button>
        </form>
    )
}