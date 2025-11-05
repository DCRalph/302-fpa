import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "./ui/alert-dialog";

export type DeleteDialogProps = {
    open: boolean;
    title: string;
    description: string;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

export default function DeleteDialog({ open, title, description, onOpenChange, onDelete }: DeleteDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={() => onOpenChange(false)}
                        className="text-foreground font-semibold"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/70 text-foreground font-semibold"
                        onClick={() => {
                            onDelete();
                            onOpenChange(false);
                        }}
                    >
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}