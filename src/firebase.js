import { useState, useEffect, createContext } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect'

import firebase from 'firebase/app';
import firestore from 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

var firebaseConfig = {
  apiKey: "AIzaSyADFINK7BeH16DO9SYHKxuWBqeT5Cm1-9o",
  authDomain: "clock-camera.firebaseapp.com",
  databaseURL: "https://clock-camera.firebaseio.com",
  projectId: "clock-camera",
  storageBucket: "clock-camera.appspot.com",
  messagingSenderId: "428222554863",
  appId: "1:428222554863:web:2c1404c69758a6b041711a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const auth = firebase.auth;

const FirebaseContext = createContext([false, null]);

export const objectFromDocs = snapshot => {
  const hash = {};
  snapshot.docs.map(doc => hash[doc.id] = doc.data());
  return hash;
}

const listFromDocs = snapshot => snapshot.docs.map(d => d.data());

const logout = () => { auth().signOut() };


function useFirestoreCollection(path, where) {
  const [data, setData] = useState({});

  useEffect(() => {
    let collection = db.collection(path);
    if (where) collection = collection.where(...where);
    const unsub = collection.onSnapshot(snapshot => {
      setData(objectFromDocs(snapshot));
    });

    return () => { unsub() };
  }, [path]);

  return data;
}

function useFirestoreDocuments(paths) {
  const [data, setData] = useState({});

  useDeepCompareEffect(() => {
    const unsubs = paths.map(path => {
      return db.doc(path).onSnapshot(snapshot => {
        setData(oldData => ({...oldData, [path]: snapshot.data()}));
      });
    })

    return () => {
      unsubs.forEach(unsub => unsub())
    };
  }, [paths]);

  return data;
}

function useFirestoreDocument(path) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const unsub = db.doc(path).onSnapshot(snapshot => {
      setData(snapshot.data());
    });

    return () => { unsub() };
  }, [path]);

  return data;
}

function useAuthChanged(func) {
  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async function(user) {
      func(user);
    });
    return unsub;
  }, []);
}

export {
  storage, db, auth, logout, useAuthChanged, useFirestoreCollection,
  useFirestoreDocument, useFirestoreDocuments, FirebaseContext
};
