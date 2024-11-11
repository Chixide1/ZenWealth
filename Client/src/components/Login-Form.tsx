import {LoginInputs} from "@/components/Login-Inputs.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";

export function LoginForm() {
    return (
        <form action="" className="flex flex-col items-center w-9/12 text-sm">
            <LoginInputs/>
            <div className="flex items-center justify-between w-full mt-3">
                <div className="flex items-center space-x-2">
                    <Checkbox id="rememberMe"/>
                    <Label
                        htmlFor="rememberMe"
                        className="font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Remember Me
                    </Label>
                </div>
                <a href="#" className="text-accent font-normal">Forgot Password?</a>
            </div>
            <Button type="submit"
                    variant="accent"
                    className="mt-6 font-medium w-full hover:animate-pulse">Continue
            </Button>
            <p className="mt-8">Don't have an account? <a href="#" className="text-accent">Sign up</a></p>
        </form>
    )
}