import {Labyrinth} from "@/lib/labyrinth/Labyrinth.ts";
import React, {useState} from "react";
import {AlertDialog, AlertDialogContent} from "@/components/ui/alert-dialog.tsx";
import WelcomeToLabyrinthAlertDialogContentChildren
    from "@/pages/messages/WelcomeToLabyrinthAlertDialogContentChildren.tsx";

export type WelcomeToLabyrinthProps = {
    forceClosed: boolean,
    loggedUserID: string,
    setLabyrinth: React.Dispatch<React.SetStateAction<Labyrinth | null>>
}

export default function WelcomeToLabyrinthAlertDialog({
                                                          forceClosed,
                                                          loggedUserID,
                                                          setLabyrinth,
                                                      }: Readonly<WelcomeToLabyrinthProps>) {
    const [open, setOpen] = useState(true);

    return (
        <AlertDialog open={!forceClosed && open} onOpenChange={(o) => setOpen(o)}>
            <AlertDialogContent>
                <WelcomeToLabyrinthAlertDialogContentChildren
                    loggedUserID={loggedUserID}
                    setLabyrinth={setLabyrinth}
                />
            </AlertDialogContent>
        </AlertDialog>
    )

}