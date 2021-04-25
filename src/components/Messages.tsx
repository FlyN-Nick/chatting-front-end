import React, { Component } from 'react';
import Message from './Message';
import MessageData from '../Types/MessageData';

type MessagesProps = {
  messages: MessageData[],
  currentUser: string,
  onClick: (i: number) => Promise<void>
}

/**
 * Array of messages.
 */
 class Messages extends Component<MessagesProps>
 {
   render()
   {
     let arrayMessages: JSX.Element[] = [];
     for (let i = 0; i < this.props.messages.length; i++)
     {
       arrayMessages.push(<Message message={this.props.messages[i]} currentUser={this.props.currentUser} onClick={() => this.props.onClick(i)}/>);
     }
     return (
       <div id="todos" className="row">
         {arrayMessages}
       </div>
     );
   }
 }

 export default Messages;