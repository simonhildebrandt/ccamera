import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import { useFirestoreCollection } from './firebase';
import FlexBox from './flexBox';


const styles = makeStyles(() => ({
  image: {
    width: 100,
    height: 100,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
  }
}));

function Images({userId, clockId}) {
  const classes = styles();

  const images = useFirestoreCollection(`users/${userId}/clocks/${clockId}/images`);

  return Object.entries(images).map(([imageId, image]) =>
    <FlexBox key={imageId}>
      <FlexBox className={classes.image} style={{backgroundImage: `url(${image.url})`}}/>
    </FlexBox>
  );
}

function Clocks ({userId}) {
  const clocks = useFirestoreCollection(`users/${userId}/clocks`);


  return Object.entries(clocks).map(([clockId, clock]) =>
    <FlexBox key={clockId}>
      <FlexBox>{clock.name}</FlexBox>
      <FlexBox row flexWrap="wrap" justifyContent="flex-start">
        <Images userId={userId} clockId={clockId} />
      </FlexBox>
    </FlexBox>
  );
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
