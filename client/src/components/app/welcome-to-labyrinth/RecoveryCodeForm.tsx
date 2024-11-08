import {z} from "zod";
import {Form, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

const formSchema = z.object({
    recoveryCode: z.string()
        .length(40, {
            message: "Recovery code consists of 40 characters"
        })
})

interface RecoveryCodeFormProps {
    onRecoveryCodeSubmit: (recoveryCode: string) => void
}


export default function RecoveryCodeForm({onRecoveryCodeSubmit}: Readonly<RecoveryCodeFormProps>) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            recoveryCode: ""
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        onRecoveryCodeSubmit(values.recoveryCode)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name = "recoveryCode"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Recovery code</FormLabel>
                            <FormControl>
                                <Input placeholder="Insert recovery code" {...field}/>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}