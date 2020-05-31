import React, { createContext, useCallback, useState, useEffect } from 'react';

import Emitter from 'emmett';
const uploadEvents = new Emitter();

import { db, storage } from './firebase';

export function useUploadState() {
  const [uploadState, setUploadState] = useState({});

  useEffect(() => {
    uploadEvents.on('update', ({data}) => {
      const {imageId, update} = data;

      setUploadState(oldState => {
        const oldData = oldState[imageId] || {};
        const newData = {...oldData, ...update};
        return {...oldState, [imageId]: newData};
      });
    });
    return () => uploadEvents.off('update');
  }, []);

  return uploadState;
}

export function deleteImage(imageId) {
  const storageRef = storage.ref();
  const imageRef = storageRef.child(imageId);
  imageRef.delete();
}

function update(imageId, update) {
  uploadEvents.emit('update', {imageId, update});
}

export function uploadImage(userId, clockId, imageId, file) {
  console.log('uploading', {userId, clockId, imageId, file});

  const storageRef = storage.ref();

  const imageRef = storageRef.child(imageId);
  const task = imageRef.put(file, { ...file, contentType: file.type });

  task.on('state_changed',
    function(snapshot){
      update(imageId, snapshot);
    },
    function(error) {
      update(imageId, {error});
    },
    function() {
      update(imageId, { state: 'complete' });
      task.snapshot.ref.getDownloadURL().then(downloadUrl => {
        db.doc(`users/${userId}/clocks/${clockId}/images/${imageId}`).update({url: downloadUrl})
      })
    },
  );
}
