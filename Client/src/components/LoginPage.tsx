import {Button} from "@/components/ui/button.tsx";
import {InputGroup} from "@/components/input-group.tsx";

export function LoginPage() {
    
    return (
        <main className="h-screen w-full flex flex-col items-center justify-center">
            <div className="text-secondary bg-neutral-500/[0.06] rounded-2xl w-[30rem] p-8 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-3">Login</h2>
                <p className="text-neutral-400 text-sm mb-6">Welcome back, please login</p>
                <form action="" className="flex flex-col items-center w-9/12">
                    <InputGroup />
                    <Button type="submit"
                            className="mt-6 bg-accent text-black rounded-lg py-2 w-full font-medium text-sm">Continue
                    </Button>
                </form>
            </div>
        </main>
    );
}
