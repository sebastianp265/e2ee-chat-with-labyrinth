import React from 'react';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog.tsx';

export type GenericDialogContentProps = {
    title?: string;
    description?: string | React.ReactNode;
    body?: React.ReactNode;
    footer?: React.ReactNode;
};

export default function GenericDialogContent({
    title,
    description,
    body,
    footer,
}: Readonly<GenericDialogContentProps>) {
    return (
        <>
            <DialogHeader>
                {title && <DialogTitle>{title}</DialogTitle>}
                {description && (
                    <DialogDescription>{description}</DialogDescription>
                )}
            </DialogHeader>
            {body}
            {footer && <DialogFooter>{footer}</DialogFooter>}
        </>
    );
}
