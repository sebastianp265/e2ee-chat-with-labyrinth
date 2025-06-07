import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import GenericDialogContent from './GenericDialogContent';
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

const FormSchema = z.object({
    recoveryCode: z.string().length(40, {
        message: 'Recovery code consists of 40 characters',
    }),
});

export type RecoveryCodeDialogProps = {
    onRecoveryCodeSubmit: (recoveryCode: string) => void;
    handleLogout: () => void;
};

export default function RecoveryCodeDialogContent({
    onRecoveryCodeSubmit,
    handleLogout,
}: Readonly<RecoveryCodeDialogProps>) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            recoveryCode: '',
        },
    });

    function onSubmit(values: z.infer<typeof FormSchema>) {
        onRecoveryCodeSubmit(values.recoveryCode);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <GenericDialogContent
                    title="Welcome back!"
                    description="It seems you have logged in on new device, please insert
                    your recovery code to recover message history."
                    body={
                        <FormField
                            control={form.control}
                            name="recoveryCode"
                            render={({ field }) => (
                                <FormItem className="mt-2 mb-2">
                                    <FormLabel>Recovery code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Insert recovery code"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                    footer={
                        <>
                            <Button onClick={handleLogout}>Logout</Button>
                            <Button type="submit">Submit</Button>
                        </>
                    }
                />
            </form>
        </Form>
    );
}
