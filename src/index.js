import "@babel/polyfill";

import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';


import { db, auth, FirebaseContext } from './firebase';
import { router, NavigationContext } from './navigation';
// import { uploader, UploadContext } from './upload';

import Interface from './interface';


const App = () => {
  const [user, setUser] = useState(false);

  auth().onAuthStateChanged(async function(newUser) {
    if (newUser) {
      const { displayName, email } = newUser;

      const userRec = await db.collection('users').doc(newUser.uid).get();
      if (!userRec.exists) {
        await db.collection('users').doc(newUser.uid).set({});
      }

      db.collection('users').doc(newUser.uid).update({ displayName, email });
    }

    setUser(newUser);
  });

  const loggedIn = !!user;

  const [navHash, setNavHash] = useState({});
  useEffect(() => {
    router.
    on('/', function() {
      setNavHash({})
    }).
    on('/clock/:clockId/display', function({clockId}) {
      setNavHash({clockId, display: true})
    }).
    on('/clock/:clockId', function({clockId}) {
      setNavHash({clockId})
    }).
    resolve();
  }, [])

  return <FirebaseContext.Provider value={[user, loggedIn]}>
    <NavigationContext.Provider value={navHash}>
      <Interface />
    </NavigationContext.Provider>
  </FirebaseContext.Provider>
};



ReactDOM.render(<App/>, document.getElementById('app'));
