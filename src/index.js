import React from 'react';
import ReactDOM from 'react-dom';
import ls from 'local-storage';
import './bootstrap/css/bootstrap.min.css';
import './index.css';
import * as firebase from "firebase/app"; // firebase is used to validate users 
import 'firebase/auth';
import 'firebase/firestore';
let fetchFrequency = 1000; // how often the user is going to fetch, in milliseconds 
let initialized = false; // if firebase has been authenticated 
let currentlySigningIn = false;  // if the user is in the middle of autheenticating
let successfullySignedIn = false; // if the user successfully signed in
let oneDelay = true; // a boolean that is supposed to delay the callAPI once before authentication (to allow the rest of the website to load)

function Message(props) // makes a message item, which is just a message + a remove button + the message sender
{
  if (props.message.sender === props.currentUser) // I use a if statement so that when the sender of a message isn't the user, they can't delete it
  {
    return (
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card">
          <div className="card-body">
                <blockquote className="blockquote mb-0">
                    <button type="button" className="removeButton btn btn-outline-warning" onClick={props.onClick}>
                      <em className="basicText card-title">{props.message.message}</em>
                    </button>
                    <footer className="blockquote-footer">Chatter #<cite title="Source Title">{props.message.sender}</cite></footer>
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
                      <em className="basicText card-title">{props.message.message}</em>
                    </button>
                    <footer className="blockquote-footer">Chatter #<cite title="Source Title">{props.message.sender}</cite></footer>
                </blockquote>
          </div>
        </div>
      </div>
    );
  }
}

class Messages extends React.Component // this component is a list of all the message items (look above)
{
  render()
  {
    let arrayMessages = [];
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

class EndorsementLevelText extends React.Component // shows user's endorsement level
{
  render()
  {
    return (
      <span id="endorsementText">
        <button type="button" className="btn btn-primary">
          <em>Endorsement Level: <strong>{this.props.level}</strong></em>
        </button>
      </span>
    );
  }
}

class Main extends React.Component // This is the componenet I put in the ReactDOM.render
{
  constructor()
  {
    super();
    if (!initialized) // initialize firebase if not already
    { 
      const firebaseConfig = {
      apiKey: "AIzaSyClTbaU2az8dn8SDkQtuPsWq5j_zM-_uQI",
      authDomain: "chat-n-5b27d.firebaseapp.com",
      databaseURL: "https://chat-n-5b27d.firebaseio.com",
      projectId: "chat-n-5b27d",
      storageBucket: "chat-n-5b27d.appspot.com",
      messagingSenderId: "950111768511",
      appId: "1:950111768511:web:93a3f1bf32e586348f9b0a"
    };
      firebase.initializeApp(firebaseConfig); 
      initialized = true;
    }
    if (firebase.auth().currentUser) { firebase.auth().signOut() } // make sure they are signed out 
    this.state = 
    {
      chatRoomID: '', // id of the chatroom the user is in
      messages: [], // array of message objects
      text: '', // text of the input field for sending a message
      currentUserID: '', // the current user id
      level: 0, // endorsement "level" of the user (# of times someone has endorsed the user)
      chattingWithUserID: '', // the id of the user is chatting with
    };
    // I do all this binding so that the handlers have access to this.state
    this.handleRemoveAll = this.handleRemoveAll.bind(this);
    this.handleRemoveButton = this.handleRemoveButton.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleLeave = this.handleLeave.bind(this);
    this.handleEndorse = this.handleEndorse.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
  }
  render()
  {
    return (
      <div>
        <div className="jumbotron">
          <div className="container">
            <h1 id="ttl" className="display-2">|\Chat'n/|</h1>
            <p id="description">A simple way to connect amid a crisis.</p>
          </div>
        </div>
        <div className="container">
          <Messages messages={this.state.messages} currentUser={this.state.currentUserID} onClick={this.handleRemoveButton}/>
          <div className="form-inline text-input">
            <input type="text" id="addButtonField" className="form-control" placeholder="Type here" onKeyDown={this.handleTextChange} value={this.state.text}></input>
            <button className="clearButton btn btn-danger" id="remove-all" onClick={this.handleRemoveAll}>
              <em>Clear <strong>ALL</strong></em>
            </button>
            <button className="leaveButton btn btn-danger" onClick={this.handleLeave}>
              <em><strong>Leave</strong></em>
            </button>
            <button className="endorseButton btn btn-success" onClick={this.handleEndorse}>
              <em><strong>Endorse</strong></em>
            </button>
            <EndorsementLevelText level={this.state.level}></EndorsementLevelText>
          </div>
          <footer>
            <div className="container">
              <h5 id="copyright" className="infoText copyright">© Liege LLC. All rights reserved. I'm FlyN outta here, byeee!®</h5>
              </div>
          </footer>
        </div>
      </div>
    );
  }
  callAPI() // fetch the backend
  {
    if (currentlySigningIn) // do nothing if it is in the middle of authenticating
    {
      console.log("Middle of signing in...");
    } 
    else if (this.state.currentUserID === '') // if the user hasn't started auth yet and needs to
    { 
      if (!oneDelay)
      {
        currentlySigningIn = true;
        firebase.auth().signOut()
        this.handleAuth();
      }
      else { oneDelay = false }
    }
    else if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // if the user isn't in a chatroom
    {
      fetch('https://flyn-chattin.herokuapp.com/find', { // key note that the user is navigating to /find, this fetch will find a chatroom for the user
        method: 'put', // method is put so that it can fetch with an additional json
        body: JSON.stringify(
        {
            'find' : this.state.currentUserID, 
        }),
        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
      })
        .then(res => 
        {
          let temp = res.text();
          return temp;
        })
        .then(res => 
        {
          let temp = JSON.parse(res);
          return temp;
        })
        .then(res => 
        {
          let initialRes = res;
          fetch('https://flyn-chattin.herokuapp.com/getEndorsementLevel', { // fetch for the endorsement level of the user
            method: 'put', // method is put so that it can fetch with an additional json
            body: JSON.stringify(
            {
              'userID' : this.state.currentUserID
            }),
            headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
          })
            .then(res =>
            {
              let temp = res.text();
              return temp;
            })
            .then(res =>
            {
              let temp = JSON.parse(res);
              return temp;
            })
            .then(res =>
            {
              if (initialRes[0].userOneID === this.state.currentUserID) // figure out who the user is chatting with
              {
                this.setState({ // set the new state 
                  chatRoomID: initialRes[0].chatRoomID,
                  messages: initialRes[0].messages,
                  level: res.level,
                  chattingWithUserID: initialRes[0].userTwoID
                });
              }
              else
              {
                this.setState({ // set the new state 
                  chatRoomID: initialRes[0].chatRoomID,
                  messages: initialRes[0].messages,
                  level: res.level,
                  chattingWithUserID: initialRes[0].userOneID
                });
              }
            })
            .catch(err => err)
        })
          .catch(err => err)
    }
    else
    {
      fetch('https://flyn-chattin.herokuapp.com/get', { // just a regular /get request, this gets called every second (look at fetchFrequency var)
          method: 'put', // method is put so that it can fetch with an additional json
          body: JSON.stringify(
          {
              'chatRoomID' : this.state.chatRoomID,
          }),
          headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        })
          .then(res => 
          {
            let temp = res.text();
            return temp;
          })
          .then(res => 
          {
            let temp = JSON.parse(res);
            return temp;
          })
          .then(res => 
          {
            let initialRes = res;
            fetch('https://flyn-chattin.herokuapp.com/getEndorsementLevel', { // fetch for the endorsement level of the user
              method: 'put', // method is put so that it can fetch with an additional json
              body: JSON.stringify(
              {
                'userID' : this.state.currentUserID
              }),
              headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            })
              .then(res => 
              {
                let temp = res.text();
                return temp;
              })
              .then(res => 
              {
                let temp = JSON.parse(res);
                return temp;
              })
              .then(res => 
              {
                if (initialRes[0].userOneID === this.state.currentUserID) // figure out who the user is chatting with
                {
                  this.setState({ // set the new state 
                    chatRoomID: initialRes[0].chatRoomID,
                    messages: initialRes[0].messages,
                    level: res.level,
                    chattingWithUserID: initialRes[0].userTwoID
                  });
                }
                else
                {
                  this.setState({ // set the new state 
                    chatRoomID: initialRes[0].chatRoomID,
                    messages: initialRes[0].messages,
                    level: res.level,
                    chattingWithUserID: initialRes[0].userOneID
                  });
                }
              })
              .catch(err => err)
            })
            .catch(err => err)
      }
  }
  componentDidMount() 
  {
    this.interval = setInterval(() => this.callAPI(), fetchFrequency); // makes a timer that fetches the backend every fetchFrequency
    this.callAPI();
  }
  componentWillUnmount() 
  {
    clearInterval(this.interval);
  }
  handleAuth()
  {
    let userName = ls.get('ChatN_User_ID') || ""; // if the local storage has the user's id, set userName to that, else set it to an empty string
    let signUp = false; // if the user is signing up or logging in
    let idLength = 8; // length of the userID's 
    let characters = '0123456789'; // characters that can be used in the user id
    if (userName === "") { signUp = true } // if the local storage didn't have the user's id, the user is signing up
    console.log("handleAuth called.")
    if (firebase.auth().currentUser || successfullySignedIn) // if the user is already signed in
    {
      currentlySigningIn = false; 
      return; 
    }
    if (signUp) // if the local storage doesn't have the user's id (first time user), it will generate an user id
    {
      let random_id = '';
      for (let i = 0; i < idLength; i++ ) 
      {
        random_id += characters.charAt(Math.floor(Math.random() * characters.length)); // not the best method of random generation
      }
      userName = random_id;
      let password = prompt("Please sign up with a password.")
      if (password == null) 
      { 
        window.location.href = 'http://www.google.com/'; // the user pressed cancel and this is the alternative to essentially closing the web page
        return;
      }
      firebase.auth().createUserWithEmailAndPassword((userName+"@gmail.com"), password) // sign up with firebase, uses userID like email 
        .then(user => 
        {
          console.log("Signup done. User:");
          console.dir(user);
          currentlySigningIn = false;
          successfullySignedIn = true;
          ls.set('ChatN_User_ID', userName);
          this.setState({ currentUserID: userName });
        })
        .catch(err => 
        {
          var errorCode = err.code;
          var errorMessage = err.message;
          if (errorCode === 'auth/weak-password') { alert('Please enter a better password...') } 
          else { alert(errorMessage) }
          console.log(err);
          this.handleAuth();
        });
    }
    else
    {
      let password = prompt("Please sign in with your password.")
      if (password == null) 
      { 
        window.location.href = 'http://www.google.com/';
        return;
      }
      firebase.auth().signInWithEmailAndPassword((userName+"@gmail.com"), password)
        .then(user => 
        {
          console.log("Signin done. User:");
          console.dir(user);
          currentlySigningIn = false;
          successfullySignedIn = true;
          this.setState({ currentUserID: userName });
        })
        .catch(err => 
        {
            var errorCode = err.code;
            var errorMessage = err.message;
            if (errorCode === 'auth/wrong-password') { alert('Wrong password...') } 
            else if (errorCode === 'auth/user-not-found') 
            { 
              alert(errorMessage);
              ls.remove('ChatN_User_ID')
            }
            else { alert(errorMessage) }
            console.log(err);
            this.handleAuth();
        });   
    }
  }
  handleRemoveAll() // a handler that clears (deletes) all of your messages (will not delete other people's messages)
  {
    if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // fail-safe
    {
      console.error("Error: you're not even in a chatroom...");
      return;
    }
    let newMessages = [];
    for (let message of this.state.messages)
    {
      if (message.sender !== this.state.currentUserID)
      {
        newMessages.push(message);
      }
    }
    fetch('https://flyn-chattin.herokuapp.com/delete',  // fetch to the backend witfch /delete
    {
      method: 'put',
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify(
      {
          'chatRoomID' : this.state.chatRoomID,
          'messages' : newMessages,
      }),
    })
    .then(res => this.callAPI())
  }
  handleLeave() // handler that allows user to leave chatroom upon button press
  {
    if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // fail-safe
    {
      console.error("Error: you're not even in a chatroom...");
      return;
    }
    fetch('https://flyn-chattin.herokuapp.com/leave', // fetch to the backend with /leave 
    {
      method: 'put',
      body: JSON.stringify(
      {
          'chatRoomID' : this.state.chatRoomID,
          'remove' : this.state.currentUserID,
      }),
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
    })
      .then(res =>  
      {
        clearInterval(this.interval); // if the timer isn't stopped the user will automatically join another chatroom
        window.close(); // this should close the tab, but unfortunately doesn't work in many browsers for security reasons 
        window.location.href = 'http://www.google.com/'; // just navigates the user to google instead because ^
      })
      .catch(err => 
      {
        console.error(err);
        clearInterval(this.interval);
        window.close();
        window.location.href = 'http://www.google.com/';
      })
  }
  handleTextChange(e) // a handler that adds a new message when enter is pressed
  {
    if (e.key === 'Enter' && this.state.text !== '') // if the user isn't sending an empty message
    {
      if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // fail-safe
      {
        console.error("Error: you're not even in a chatroom...");
        return;
      }
      this.setState({text: '', })
      fetch('https://flyn-chattin.herokuapp.com/send', // post new message to the backend with /send
      {
        method: 'post',
        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(
        {
          'chatRoomID' : this.state.chatRoomID,
          'message' : e.target.value,
          'sender' : this.state.currentUserID,
        }),
      })
      .then(res => this.callAPI())
    }
    else if (e.key === 'Backspace')
    {
      let temp = this.state.text;
      this.setState({text: temp.substring(0, temp.length-1)});
    }
    else if (!(e.key === 'Tab'       || e.key === 'CapsLock' 
            || e.key === 'Shift'     || e.key === "Meta" 
            || e.key === "Alt"       || e.key === "Control" 
            || e.key === "Escape"    || e.key === "ArrowLeft" 
            || e.key === "ArrowRight"|| e.key === "ArrowUp" 
            || e.key === "ArrowDown" || e.key ==="Enter")) // if key is an actual letter/symbol/number, alternatively I could store all of these keys in an array and check if the array contains e.key
    {   
      let temp = this.state.text;
      temp += e.key;
      this.setState({text: temp});
    }
  }
  handleRemoveButton(i) // a handler that removes a message at a specified index
  {
    if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // fail-safe
    {
      console.error("Error: you're not even in a chatroom...");
      return;
    }
    let newMessages = this.state.messages;
    newMessages.splice(i, 1); // remove message from message arr
    fetch('https://flyn-chattin.herokuapp.com/delete', // post to the backend
    {
      method: 'put',
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify(
      {
          'chatRoomID' : this.state.chatRoomID,
          'messages' : newMessages,
      }),
    })
    .then(res => this.callAPI())
  }
  handleEndorse() // a handler that endorses the person the user is chatting with
  {
    if (this.state.chattingWithUserID === '' || this.state.chattingWithUserID == null) { return } // if the user isn't talking to anybody (most likely because the person they were talking to left)
    fetch('https://flyn-chattin.herokuapp.com/endorse', { // fetch with /endorse
      method: 'put',
      body: JSON.stringify(
      {
          'userID' : this.state.chattingWithUserID,
      }),
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
    })
      .then(res => 
      {
        let temp = res.text();
        return temp;
      })
      .then(res => 
      {
        let temp = JSON.parse(res);
        return temp;
      })
      .then(res => 
      {
      })
      .catch(err => err)     
  }
}

// ========================================

ReactDOM.render(
  <div>
    <Main />
  </div>,
  document.getElementById('root')
);
