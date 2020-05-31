import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
// import Dialog from '@material-ui/core/Dialog';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useUploadState } from './upload';
import FlexBox from './flexBox';



function UploadRecord({record}) {
  const { key, bytesTransferred, totalBytes, state } = record;
  return JSON.stringify(record)
}

export function UploadControl() {
  const uploadState = useUploadState();

  const finished = Object.values(uploadState).every(record => record.state === 'complete')

  return !finished && <FlexBox row alignItems="center" color="common.white" flexGrow={0}>
    <Box mr={1}>Uploading...</Box><CircularProgress color="inherit" size={20}/>
  </FlexBox>
  // const empty = Object.keys(uploadState).length === 0;
  //
  // const records = Object.entries(uploadState).map(([key, record]) => {
  //   const { bytesTransferred, totalBytes, state } = record;
  //   return { key, bytesTransferred, totalBytes, state };
  // })
  //
  // const [showUploads, setShowUploads] = useState(false);
  //
  // return <>
  //   <Dialog open={showUploads} onClose={() => setShowUploads(false)}>
  //     { empty ? 'no uploads to show' : (
  //       records.map(record => <Box key={record.key}><UploadRecord record={record}/></Box>)
  //     )}
  //   </Dialog>
  //   <Button onClick={() => setShowUploads(true)}>Uploads</Button>
  // </>
}
