import React, { useState, useRef } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Science from './Science'; 
import Math from './Math';
import English from './English';
import Internship from './Internship';

firebase.initializeApp({
  apiKey: "AIzaSyDRZ1-Er6mJ6oeqYhVbIf66Co-PNwPEhdw",
  authDomain: "connect-fb36e.firebaseapp.com",
  projectId: "connect-fb36e",
  storageBucket: "connect-fb36e.appspot.com",
  messagingSenderId: "624486494620",
  appId: "1:624486494620:web:829134856010f3fe8bd859",
  measurementId: "G-VREH19MBK0"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

const channels = [
  { name: 'Home', link: '/' },
  { name: 'Science', link: '/Science' },
  { name: 'Math', link: '/Math' },
  { name: 'English', link: '/English' }, 
  {name: 'Internship', link: '/Internship'},
];

function App() {
  const [user] = useAuthState(auth);
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="App">
      <Router>
        <header>
          <div className="dropdown">
          <img className="dropdown-button" onClick={toggleDropdown} src="/menu.png" alt="menu" />
            {showDropdown && (
              <ul className="dropdown-list">
                {channels.map((channel, index) => (
                  <li key={index} onClick={() => handleChannelChange(channel)}>
                    <Link to={channel.link}>{channel.name}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <img className="connect-logo" src="/FINAL%20LOGO%20copy.png" alt="Connect Logo" />
          <SignOut />
        </header>

        <section>
          <Routes>
            <Route path="/" element={user ? <ChatRoom /> : <SignIn />} />
            <Route path="/Science" element={<Science />} />
            <Route path="/Math" element={<Math />} />
            <Route path="/English" element={<English />} />
            <Route path="/Internship" element={<Internship />} />
          </Routes>
        </section>
      </Router>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p className='Rules'>Do not violate the community guidelines.</p>
    </>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {

    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="ConnectIn" />
        <button type="submit" disabled={!formValue}>⬆</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img className="user-avatar" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Avatar" />
      <p>{text}</p>
    </div>
  );
}

export default App;
