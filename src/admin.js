import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useFirestoreCollection } from './firebase';
import FlexBox from './flexBox';


function Clocks ({userId}) {
  const clocks = useFirestoreCollection(`users/${userId}/clocks`);


  return JSON.stringify(clocks);
}

export default () => {
  const users = useFirestoreCollection(`users`);

  if (!users) return <CircularProgress/>;

  return Object.entries(users).map(([id, user]) => (
    <FlexBox key={id}>
      <FlexBox>{user.displayName} ({user.email})</FlexBox>
      <FlexBox>
        <Clocks userId={id}/>
      </FlexBox>
    </FlexBox>
  ));
}
