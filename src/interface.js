import React, { useRef, useState, useContext, searchFieldRef } from 'react';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Link from '@material-ui/core/Link';
import Fab from '@material-ui/core/Fab';
import FavouriteIcon from '@material-ui/icons/Favorite';
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

function feedbackText() {
  return <>ClockCamera is a personal project of <Link
  href="http://simonhildebrandt.com">Simon Hildebrandt</Link> -
  created originally to share with his son and daughter, and friends.
  <br/><br/>
  If you find it useful, or have useful thoughts to share, he'd love to hear
  from you at <Link href="mailto:simonhildebrandt@gmail.com">
  simonhildebrandt@gmail.com</Link> - and if you *really* liked it he'd greatly
  appreciate any <Link href="https://paypal.me/SimonHildebrandt">
  donation</Link> towards the cost of keeping it running.
  </>;
}

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
  const [showingFeedback, setShowingFeedback] = useState(false);

  const navHash = useContext(NavigationContext);
  const { clockId, display, admin } = navHash;

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

  function closeFeedback() {
    setShowingFeedback(false);
  }
  function showFeedback() {
    setShowingFeedback(true);
  }

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
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />
        </div>
      }


      <UploadControl/>
    </FlexBox>

    { loggedIn ? (<FlexBox className={classes.expanded}>

      { appView() }

      <Dialog open={showingFeedback} onClose={closeFeedback}>
        <DialogTitle>About</DialogTitle>
        <DialogContent>
          <DialogContentText>{ feedbackText() }</DialogContentText>
        </DialogContent>
        <DialogActions><Button onClick={closeFeedback}>Close</Button></DialogActions>
      </Dialog>

      <Box position="absolute" left={16} bottom={16}>
        <Fab color="secondary" aria-label="feedback" onClick={showFeedback}>
          <FavouriteIcon />
        </Fab>
      </Box>

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
