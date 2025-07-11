import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const CredentialsToast = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [copied, setCopied] = React.useState({ username: false, password: false });

  const testCredentials = {
    username: "DemoUser",
    password: "DemoUser123!"
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fixed bottom-3 sm:left-4 z-50 w-full max-w-md px-3">
      <Alert className="border-neutral-600 bg-offblack backdrop-blur-sm">
        <AlertDescription className="text-neutral-800">
          <Accordion type="single" collapsible defaultValue="credentials">
            <AccordionItem value="credentials" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2 px-0">
                <span className="font-medium text-neutral-200 text-sm">Demo User Credentials</span>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-neutral-700/70 rounded-md p-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-neutral-400 mb-1">Username</p>
                      <p className="text-sm font-mono text-primary">{testCredentials.username}</p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(testCredentials.username, 'username')}
                      className="ml-2 p-1  hover:bg-accent/20 rounded transition-colors duration-300 active:bg-accent/40"
                      title="Copy username"
                      variant="ghost"
                      size="icon"
                    >
                      {copied.username ? <Check className="h-3 w-3 text-primary" /> :<Copy className="h-3 w-3 text-primary" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between bg-neutral-700/70 text-neutral-400 rounded-md p-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-neutral-400 mb-1">Password</p>
                      <p className="text-sm font-mono text-primary">
                        {showPassword ? testCredentials.password : '•'.repeat(testCredentials.password.length)}
                      </p>
                    </div>
                    <div className="flex items-center ml-2 space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePasswordVisibility}
                        className="p-1 hover:bg-accent/20 rounded transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? 
                          <EyeOff className="h-3 w-3 text-primary" /> : 
                          <Eye className="h-3 w-3 text-primary" />
                        }
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(testCredentials.password, 'password')}
                        className="p-1 hover:bg-accent/20 rounded transition-colors duration-300 active:bg-accent/40"
                        title="Copy password"
                        variant={"ghost"}
                        size="icon"
                      >
                        {copied.password ? <Check className="h-3 w-3 text-primary" /> :<Copy className="h-3 w-3 text-primary" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center pt-1">
                    <p className="text-xs text-primary">
                      Click to copy credentials
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CredentialsToast;