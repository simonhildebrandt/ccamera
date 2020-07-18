import React, { useRef, useState, useContext, searchFieldRef } from 'react';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import FlexBox from './flexBox';

import { auth, logout, useAuthChanged, db, FirebaseContext } from './firebase';
import { navigate, NavigationContext } from './navigation';

import { UploadControl } from './uploadControl';

import Clock from './clock';
import Clocks from './clocks';
import ClockDisplay from './clockDisplay';
import Admin from './admin';

import Logo from './logo';


const uiConfig = {
  //signInSuccessUrl: location.href,
  signInFlow: 'popup',
  signInOptions: [
    auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false
  }
};


const styles = makeStyles({
  fullSize: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  expanded: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden auto'
  },
  centered: {
    width: 200,
    margin: 'auto',
    marginTop: '30vh'
  }
});


const Interface = () => {
  const classes = styles();

  const [user, loggedIn] = useContext(FirebaseContext);
  const [showLogin, setShowLogin] = useState(false);

  const navHash = useContext(NavigationContext);
  const { clockId, display, admin } = navHash;

  // Still need?!
  const uiRef = useRef();
  const handleUICallback = ui => uiRef.current = ui;

  useAuthChanged(newUser => {
    setShowLogin(false);
  });

  if (user === false) {
    return <FlexBox className={classes.fullSize}>
      <FlexBox className={classes.centered}><Logo/></FlexBox>
    </FlexBox>
  }

  const handleLogout = () => {
    logout();
  };

  if (clockId && display) return <ClockDisplay clockId={clockId}/>

  function appView() {
    if (admin) return <Admin/>;

    return clockId ? <Clock/> : <Clocks/>;
  }

  return <FlexBox className={classes.fullSize}>
    <FlexBox row flexGrow={0} bgcolor="grey.600" px={1}>
      <FlexBox row>
        <Button style={{color: "white"}} onClick={() => navigate('/')}>Home</Button>
      </FlexBox>

      { loggedIn && <Button style={{color: "white"}} onClick={handleLogout}>Logout</Button> }
      { !loggedIn && <Button style={{color: "white"}} onClick={() => setShowLogin(true)}>Login</Button> }

      { showLogin && <div>
          <StyledFirebaseAuth uiCallback={handleUICallback} uiConfig={uiConfig} firebaseAuth={auth()} />
        </div>
      }


      <UploadControl/>
    </FlexBox>

    { loggedIn ? (<FlexBox className={classes.expanded}>
      { appView() }
      </FlexBox>) : (
        <WelcomeMessage/>
      )
    }
  </FlexBox>
};

function WelcomeMessage() {
  return <Box p={1} maxWidth={400} marginLeft="auto" marginRight="auto">
    <Box fontSize="h4.fontSize" p={1} textAlign="center" mb={1}>Welcome to Clock Camera.</Box>
    <Box mb={1}><img src="./clock-10-20.jpg"/></Box>
    <Box mb={1}>
      Clock Camera is a fun craft project - create a custom clock you can
      display anywhere, using your own photos.
    </Box>
    <Box mb={1}>
      Think of a fun theme - time displayed through kitchen items, say, or
      things you found at the park - and when you're ready, click 'login' above
      to create an account.
    </Box>
  </Box>
}

export default Interface;
