import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form.tsx';

import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { LoginRequestDTO } from '@/api/authService.ts';
import { LoadingSpinner } from '@/components/ui/loading-spinner.tsx';

const formSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: 'Username must be at least 2 characters.',
        })
        .max(32, {
            message: 'Password must be at most 32 characters',
        }),
    password: z
        .string()
        .min(6, {
            message: 'Password must be at least 6 characters',
        })
        .max(32, {
            message: 'Password must be at most 32 characters',
        }),
});

interface LoginFormProps {
    handleSubmit: (loginRequest: LoginRequestDTO) => void;
    loginError: string | null;
    isPending: boolean;
}

export function LoginForm({
    handleSubmit,
    loginError,
    isPending,
}: Readonly<LoginFormProps>) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        handleSubmit(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {loginError && (
                    <div className="text-red-500 p-3 bg-red-100 border border-red-400 rounded-md">
                        {loginError}
                    </div>
                )}
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Your username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Your password"
                                    type="password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending && <LoadingSpinner size={20} className="mr-2" />}
                    Submit
                </Button>
            </form>
        </Form>
    );
}
