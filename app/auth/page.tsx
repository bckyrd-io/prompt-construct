"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HardHat, Shield } from "lucide-react" // Changed to HardHat
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [authMode, setAuthMode] = useState<"client" | "admin">("client")
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            router.push(authMode === "admin" ? "/admin/reports" : "/dashboard")
        }, 1500)
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <HardHat className="size-5" /> {/* Updated Icon */}
                        </div>
                     
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        <form onSubmit={handleSubmit}>
                            <FieldGroup>
                                

                                

                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="h-11" // Force middle height
                                        placeholder={authMode === "admin" ? "admin@royconstruction.com" : "m@example.com"}
                                        required
                                    />
                                </Field>

                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <a
                                            href="#"
                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input id="password" type="password" className="h-11" required /> {/* Force middle height */}
                                </Field>

                                <Field>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="remember" />
                                        <label htmlFor="remember" className="text-sm text-muted-foreground">
                                            Remember me
                                        </label>
                                    </div>
                                </Field>

                                <Field>
                                    <Button type="submit" disabled={isLoading} className="w-full h-11"> {/* Force middle height */}
                                        {isLoading
                                            ? authMode === "admin" ? "Accessing..." : "Signing in..."
                                            : authMode === "admin" ? "Access Dashboard" : "Sign In"}
                                    </Button>
                                </Field>

                                <FieldSeparator>Or continue with</FieldSeparator>

                                <Field>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="w-full h-11" // Force middle height
                                        onClick={() => setAuthMode(authMode === "admin" ? "client" : "admin")}
                                    >
                                        {authMode === "admin" ? "Switch to Client Login" : "Admin Access"}
                                    </Button>
                                    <FieldDescription className="text-center">
                                        Don&apos;t have an account?{" "}
                                        <a href="#" className="underline underline-offset-4">
                                            Sign up
                                        </a>
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </form>
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                    alt="Authentication background"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}