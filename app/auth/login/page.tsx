"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HardHat, Shield } from "lucide-react"
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
import { useAuthStore } from "@/lib/store/auth-store"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { login, isLoading, error, clearError } = useAuthStore()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        
        const result = await login(email, password)
        
        if (result.success && result.redirectTo) {
            router.push(result.redirectTo)
        }
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-dark">
                            <HardHat className="size-5" />
                        </div>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        <form onSubmit={handleSubmit}>
                            <FieldGroup>
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                                    <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
                                </div>

                                {error && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="h-11"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
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
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        className="h-11" 
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        disabled={isLoading}
                                    />
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
                                    <Button type="submit" disabled={isLoading} className="w-full h-11">
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </Field>

                                <FieldSeparator>Or</FieldSeparator>

                                <Field>
                                    <FieldDescription className="text-center">
                                        Don&apos;t have an account?{" "}
                                        <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary">
                                            Sign up
                                        </Link>
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
                    className="grayscale group-hover:grayscale-0 transition-all duration-500 absolute inset-0 h-full w-full object-cover "
                />
            </div>
        </div>
    )
}
