import React, { useContext, useEffect, useState } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import cx from 'classnames';

import {
  useFirestoreCollection, useFirestoreDocument, FirebaseContext
} from './firebase';
import { navigate } from './navigation';
import { renderTime, roundDownBy } from './utils';
import FlexBox from './flexBox';


const styles = makeStyles({
  fullSize: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
  },
})

export default function ClockDisplay({clockId}){
  const classes = styles();

  const [ user ] = useContext(FirebaseContext);
  const clock = useFirestoreDocument(`users/${user.uid}/clocks/${clockId}`);
  const images = useFirestoreCollection(`users/${user.uid}/clocks/${clockId}/images`, ['deletedAt', '==', null]);

  const [currentTime, setCurrentTime] = useState((new Date).valueOf());
  useEffect(
    () => {
      const intervalId = setInterval(() => {
        setCurrentTime((new Date).valueOf());
      }, 1000);
      return () => clearInterval(intervalId)
    }, []
  );

  const date = new Date(currentTime);

  if (!clock) return null;

  const hours = clock.period === '12' ? date.getHours() % 12 : date.getHours();
  const minutes = date.getMinutes();

  const time = (date).toLocaleTimeString(undefined, { hourCycle: 'h12' });

  const slot = roundDownBy(hours * 60 + minutes, clock.frequency);

  const image = Object.values(images).find(img => img.time === slot);

  function gotoClock() {
    navigate(`/clock/${clockId}`);
  }

  return <Box
    className={classes.fullSize}
    bgcolor="common.black"
    color="common.white"
  >
    { image ? (
      <Box
        className={cx(classes.fullSize, classes.image)}
        style={{backgroundImage: `url(${image.url})`}}
      />
    ) : (
      <Box fontSize="10vw">{ time }</Box>
    ) }

    <FlexBox position="absolute" width="100%" bottom="0" row>
      <FlexBox margin={1} row alignItems="center">
        <Button style={{color: "white"}}>Home</Button>
        { <FlexBox
          row
          justifyContent="flex-end"
          flexGrow={1}
          style={{cursor: "pointer"}}
          onClick={gotoClock}
          >
            {image ? (
              <>{clock.name} - { renderTime(clock.period, slot) }</>
            ) : (
              <>Click here to add an image for { renderTime(clock.period, slot) }</>
            )}
          </FlexBox>
        }
      </FlexBox>
    </FlexBox>
  </Box>
}
