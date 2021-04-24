import React, { Component } from 'react';

import EndorsementLevelText from './EndorsementLevelText';
import Messages from './Messages';

import ls from 'local-storage';

import '../bootstrap/css/bootstrap.min.css';
import '../index.css';
//import * as firebase from "firebase/app"; // firebase is used to validate users 
import firebase from "firebase/app"; // firebase is used to validate users 
import 'firebase/auth';
import 'firebase/firestore';

let fetchFrequency = 1000; // how often the user is going to fetch, in milliseconds 
let initialized = false; // if firebase has been authenticated 
let currentlySigningIn = false;  // if the user is in the middle of autheenticating
let successfullySignedIn = false; // if the user successfully signed in
let oneDelay = true; // a boolean that is supposed to delay the callAPI once before authentication (to allow the rest of the website to load)

/** Parent component for everything, contains all the auth and fetching logic. */
 class Main extends Component 
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
               <h5 id="copyright" className="copyright">
                 <a href={"https://github.com/FlyN-Nick/chatting-front-end"} className="link">
                   Made with <span role="img" aria-label="heart">❤️ </span>
                 </a>
                 <a href={"https://github.com/FlyN-Nick"} className="link"> by FlyN-Nick</a>.
               </h5>
             </div>
           </footer>
         </div>
       </div>
     );
   }
 
   async callAPI() // fetch the backend
   {
     try 
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
           firebase.auth().signOut();
           this.handleAuth();
         }
         else { oneDelay = false }
       }
       else 
       {
         let awaitedPromise;
   
         if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // if the user isn't in a chatroom
         {
           awaitedPromise = await fetch('https://flyn-chattin.herokuapp.com/find', { // key note that the user is navigating to /find, this fetch will find a chatroom for the user
             method: 'put', // method is put so that it can fetch with an additional json
             body: JSON.stringify(
             {
                 'find' : this.state.currentUserID, 
             }),
             headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
           });
         }
         else
         {
           awaitedPromise = await fetch('https://flyn-chattin.herokuapp.com/get', { // just a regular /get request, this gets called every second (look at fetchFrequency var)
             method: 'put', // method is put so that it can fetch with an additional json
             body: JSON.stringify(
             {
                 'chatRoomID' : this.state.chatRoomID,
             }),
             headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
           });
         }
   
         let initialRes = await JSON.parse(await awaitedPromise.text());
   
         let secondAwaitedPromise = await fetch('https://flyn-chattin.herokuapp.com/getEndorsementLevel', { // fetch for the endorsement level of the user
           method: 'put', // method is put so that it can fetch with an additional json
           body: JSON.stringify(
           {
             'userID' : this.state.currentUserID
           }),
           headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
         });
   
         let res = await JSON.parse(await secondAwaitedPromise.text());
         
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
       }
     }
     catch (err) { console.error(`Caught error: ${err}`) }
   }
 
   async componentDidMount() 
   {
     this.interval = setInterval(() => this.callAPI(), fetchFrequency); // makes a timer that fetches the backend every fetchFrequency
     await this.callAPI();
   }
 
   componentWillUnmount() { clearInterval(this.interval); }
 
   /** Handles authentication (signin/signup). */
   handleAuth()
   {
     let userName = ls.get('ChatN_User_ID') || ""; // if the local storage has the user's id, set userName to that, else set it to an empty string
     let signUp = false; // if the user is signing up or logging in
     let idLength = 8; // length of the userID's 
     let characters = '0123456789'; // characters that can be used in the user id
     if (userName === "") { signUp = true } // if the local storage didn't have the user's id, the user is signing up
     console.log("handleAuth called.");
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
       let password = prompt("Please sign up with a password.");
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
       let password = prompt("Please sign in with your password.");
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
               ls.remove('ChatN_User_ID');
             }
             else { alert(errorMessage) }
             console.log(err);
             this.handleAuth();
         });   
     }
   }
 
   async handleRemoveAll() // a handler that clears (deletes) all of your messages (will not delete other people's messages)
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
     try
     {
       await fetch('https://flyn-chattin.herokuapp.com/delete',  // fetch to the backend witfch /delete
       {
         method: 'put',
         headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
         body: JSON.stringify(
         {
             'chatRoomID' : this.state.chatRoomID,
             'messages' : newMessages,
         }),
       });
       await this.callAPI();
     }
     catch(err) { console.error(`Caught error: ${err}`) }
   }
 
   async handleLeave() // handler that allows user to leave chatroom upon button press
   {
     if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // fail-safe
     {
       console.error("Error: you're not even in a chatroom...");
       return;
     }
     try 
     {
       await fetch('https://flyn-chattin.herokuapp.com/leave', // fetch to the backend with /leave 
       {
         method: 'put',
         body: JSON.stringify(
         {
             'chatRoomID' : this.state.chatRoomID,
             'remove' : this.state.currentUserID,
         }),
         headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
       });
     }
     catch (err) { console.error(`Caught error: ${err}`) }
     clearInterval(this.interval); // if the timer isn't stopped the user will automatically join another chatroom
     window.close(); // this should close the tab, but unfortunately doesn't work in many browsers for security reasons 
     window.location.href = 'http://www.google.com/'; // just navigates the user to google instead because ^
   }
   async handleTextChange(e) // a handler that adds a new message when enter is pressed
   {
     if (e.key === 'Enter' && this.state.text !== '') // if the user isn't sending an empty message
     {
       if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // fail-safe
       {
         console.error("Error: you're not even in a chatroom...");
         return;
       }
       this.setState({ text: '' });
       try
       {
         await fetch('https://flyn-chattin.herokuapp.com/send', // post new message to the backend with /send
         {
           method: 'post',
           headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
           body: JSON.stringify(
           {
             'chatRoomID' : this.state.chatRoomID,
             'message' : e.target.value,
             'sender' : this.state.currentUserID,
           }),
         });
         await this.callAPI();
       }
       catch(err) { console.error(`Caught error: ${err}`) }
     }
     else if (e.key === 'Backspace')
     {
       let temp = this.state.text;
       this.setState({ text: temp.substring(0, temp.length-1) });
     }
     else if (!(e.key === 'Tab'       || e.key === 'CapsLock' 
             || e.key === 'Shift'     || e.key === "Meta" 
             || e.key === "Alt"       || e.key === "Control" 
             || e.key === "Escape"    || e.key === "ArrowLeft" 
             || e.key === "ArrowRight"|| e.key === "ArrowUp" 
             || e.key === "ArrowDown" || e.key === "Enter")) // if key is an actual letter/symbol/number, alternatively I could store all of these keys in an array and check if the array contains e.key
     {   
       let temp = this.state.text;
       temp += e.key;
       this.setState({text: temp});
     }
   }
 
   async handleRemoveButton(i) // a handler that removes a message at a specified index
   {
     if (this.state.chatRoomID == null || this.state.chatRoomID === undefined || this.state.chatRoomID === "") // fail-safe
     {
       console.error("Error: you're not even in a chatroom...");
       return;
     }
     let newMessages = this.state.messages;
     newMessages.splice(i, 1); // remove message from message arr
     try
     {
       await fetch('https://flyn-chattin.herokuapp.com/delete', // post to the backend
       {
         method: 'put',
         headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
         body: JSON.stringify(
         {
             'chatRoomID' : this.state.chatRoomID,
             'messages' : newMessages,
         }),
       });
       await this.callAPI();
     }
     catch (err) { console.error(`Caught error: ${err}`) }
   }
   async handleEndorse() // a handler that endorses the person the user is chatting with
   {
     if (this.state.chattingWithUserID === '' || this.state.chattingWithUserID == null) { return } // if the user isn't talking to anybody (most likely because the person they were talking to left)
     try
     {
       await fetch('https://flyn-chattin.herokuapp.com/endorse', { // fetch with /endorse
         method: 'put',
         body: JSON.stringify(
         {
             'userID' : this.state.chattingWithUserID,
         }),
         headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
       });
     }
     catch(err) { console.error(`Caught error: ${err}`) }
   }
 }

 export default Main;