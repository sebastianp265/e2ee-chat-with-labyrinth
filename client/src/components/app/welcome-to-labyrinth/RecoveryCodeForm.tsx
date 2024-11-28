import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";

const FormSchema = z.object({
    recoveryCode: z.string()
        .length(40, {
            message: "Recovery code consists of 40 characters"
        })
})

interface RecoveryCodeFormProps {
    onRecoveryCodeSubmit: (recoveryCode: string) => void
}


export default function RecoveryCodeForm({onRecoveryCodeSubmit}: Readonly<RecoveryCodeFormProps>) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            recoveryCode: ""
        },
    })

    function onSubmit(values: z.infer<typeof FormSchema>) {
        onRecoveryCodeSubmit(values.recoveryCode)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="recoveryCode"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Recovery code</FormLabel>
                            <FormControl>
                                <Input placeholder="Insert recovery code" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}