export interface IUserPreviewProps {
    userID: string,
    visibleName: string
    onClick: (userID: string) => void
}

export default function UserPreview({userID, visibleName, onClick}: Readonly<IUserPreviewProps>) {

    return (
        <button onClick={() => onClick(userID)} className="hover:bg-accent
            flex flex-col border p-2 rounded-xl w-full text-left">
            <h3 className="font-bold text-base">{visibleName}</h3>
        </button>
    );
}
