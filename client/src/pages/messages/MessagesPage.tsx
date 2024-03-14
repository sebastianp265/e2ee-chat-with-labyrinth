import {Button} from "@/components/ui/button.tsx";
import {ISessionProps} from "@/SessionCheckWrapper.tsx";

export default function MessagesPage({inactivateSession}: Readonly<ISessionProps>) {



    return (
        <>
        <h1>Messages placeholder</h1>
        <Button onClick={() => inactivateSession?.()}>Inactivate session test</Button>
        </>
    )
}