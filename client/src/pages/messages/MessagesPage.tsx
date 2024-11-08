import {ISessionProps} from "@/SessionCheckWrapper.tsx";
import {useEffect, useState} from "react";
import {usePrivateRouteContext} from "@/main.tsx";
import WelcomeToLabyrinthAlertDialog from "@/pages/messages/WelcomeToLabyrinthAlertDialog.tsx";
import {Labyrinth} from "@/lib/labyrinth/Labyrinth.ts";
import ChatContent from "@/pages/messages/ChatContent.tsx";

export default function MessagesPage({sessionExpired, inactivateSession}: Readonly<ISessionProps>) {
    const {loggedUserID, inboxID} = usePrivateRouteContext()
    const [labyrinth, setLabyrinth] = useState<Labyrinth | null>(null)

    return (
        <div className="flex h-full">
            <WelcomeToLabyrinthAlertDialog
                forceClosed={sessionExpired!}
                loggedUserID={loggedUserID}
                setLabyrinth={setLabyrinth}
            />
            <ChatContent
                inboxID={inboxID}
                loggedUserID={loggedUserID}
                labyrinth={labyrinth}
            />
        </div>
    )
}