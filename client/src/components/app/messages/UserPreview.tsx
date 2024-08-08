
interface IUserPreviewProps {
    userId: number
    visibleName: string
    onClick: (userId: number) => void
}

export default function UserPreview({userId, visibleName, onClick}: Readonly<IUserPreviewProps>) {

    return (
        <button onClick={() => onClick(userId)} className="hover:bg-accent
            flex flex-col border p-2 rounded-xl w-full text-left">
            <h3 className="font-bold text-base">{visibleName}</h3>
        </button>
    );
}
