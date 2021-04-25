import React, { Component } from 'react';
import MessageProps from '../Types/MessageProps';

/** A single message. */
class Message extends Component<MessageProps>
{
    render()
    {
        if (this.props.message.sender === this.props.currentUser) // I use a if statement so that when the sender of a message isn't the user, they can't delete it
        {
          return (
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                      <blockquote className="blockquote mb-0">
                          <button type="button" className="removeButton btn btn-outline-warning" onClick={this.props.onClick}>
                            <em className="basicText card-title">{this.props.message.message}</em>
                          </button>
                          <footer className="blockquote-footer">Chatter #<cite title="Source Title">{this.props.message.sender}</cite></footer>
                      </blockquote>
                </div>
              </div>
            </div>
          );
        }
        else
        {
          return (
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                      <blockquote className="blockquote mb-0">
                          <button type="button" className="removeButton btn btn-outline-dark" disabled>
                            <em className="basicText card-title">{this.props.message.message}</em>
                          </button>
                          <footer className="blockquote-footer">Chatter #<cite title="Source Title">{this.props.message.sender}</cite></footer>
                      </blockquote>
                </div>
              </div>
            </div>
          );
        }
    }
}

export default Message;