import { Input } from "@/components/ui/input"
import { Lock, Mail } from "lucide-react"
export function InputGroup() {
  return (
        <div className="overflow-hidden rounded-md w-full text-secondary">
          <div className="relative">
            <div
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-neutral-100/[0.07] rounded-full">
              <Mail className="h-4 w-4"/>
            </div>
            <label className="absolute left-14 top-2 text-xs text-neutral-500">Email</label>
            <Input
                className="pl-14 pb-5 bg-neutral-500/[0.07] border-0 placeholder:text-transparent rounded-none border-b-0 pt-12"
                placeholder="Email"
                type="email"
            />
          </div>
          <div className="relative">
            <div
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-neutral-100/[0.07] rounded-full">
              <Lock className="h-4 w-4"/>
            </div>
            <label className="absolute left-14 top-2 text-xs text-neutral-500">Password</label>
            <Input
                className="pl-14 pb-5 bg-neutral-500/[0.07] placeholder:text-transparent rounded-none pt-12 border-0 border-t border-neutral-700"
                placeholder="Password"
                type="password"
            />
          </div>
        </div>
  )
}