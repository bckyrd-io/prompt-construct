"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HardHat, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { useAuthStore } from "@/lib/store/auth-store"

type UserRole = "client" | "admin";

export default function SignupPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState<UserRole>("client")
    const [localError, setLocalError] = useState<string | null>(null)
    
    const { signup, isLoading, error, clearError } = useAuthStore()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setLocalError(null)

        // Validation
        if (password !== confirmPassword) {
            setLocalError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters")
            return
        }

        const result = await signup(name, email, password, role)
        
        if (result.success) {
            // Redirect based on role
            const redirectTo = role === "admin" ? "/admin/reports" : "/dashboard"
            router.push(redirectTo)
        }
    }

    const displayError = localError || error

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
                             

                                {displayError && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                                        {displayError}
                                    </div>
                                )}

                               
                                <Field>
                                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        className="h-11"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="h-11"
                                        placeholder={role === "admin" ? "admin@royconstruction.com" : "john@example.com"}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        className="h-11" 
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        disabled={isLoading}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                                    <Input 
                                        id="confirmPassword" 
                                        type="password" 
                                        className="h-11" 
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                        disabled={isLoading}
                                    />
                                </Field>

                                <Field>
                                    <Button type="submit" disabled={isLoading} className="w-full h-11">
                                        {isLoading ? "Creating account..." : "Sign Up"}
                                    </Button>
                                </Field>

                                <FieldSeparator>Or</FieldSeparator>

                                <Field>
                                    <FieldDescription className="text-center">
                                        Already have an account?{" "}
                                        <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                                            Sign in
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
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
