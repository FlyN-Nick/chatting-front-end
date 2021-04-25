import MessageData from "./MessageData";

type MessagesProps = {
    messages: MessageData[],
    currentUser: string,
    onClick: (i: number) => Promise<void>
}

export default MessagesProps;