import MessageData from './MessageData';

type MessageProps = {
    currentUser: string,
    message: MessageData,
    onClick: React.MouseEventHandler<HTMLButtonElement>
}

export default MessageProps;