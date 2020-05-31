import React, { useContext, useState, useEffect }  from 'react';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TimeIcon from '@material-ui/icons/AccessTime';
import HelpIcon from '@material-ui/icons/Help';

import FlexBox from './flexBox';

import {
  db, objectFromDocs, useFirestoreCollection, useFirestoreDocument, FirebaseContext
} from './firebase';
import { navigate } from './navigation';


export default function Clocks() {
  const [ user ] = useContext(FirebaseContext);

  const [clocks, setClocks] = useState(null);
  const [showingHelp, setShowingHelp] = useState(!localStorage.getItem('ShownClocksHelp'));
  const showHelp = () => setShowingHelp(true);
  const closeHelp = () => {
    localStorage.setItem('ShownClocksHelp', true);
    setShowingHelp(false);
  };

  useEffect(() => {
    let collection = db.collection(`users/${user.uid}/clocks`).where('deletedAt', '==', null);
    const unsub = collection.onSnapshot(snapshot => {
      setClocks(objectFromDocs(snapshot));

      if (snapshot.empty) {
        buildClock("My First Clock");
      };
    });

    return () => { unsub() };
  }, []);

  const buildClock = (name) => db.collection(`users/${user.uid}/clocks`).add({ name, period: '12', frequency: 1, deletedAt: null });

  const createClock = () => {
    buildClock('[new clock]').then(doc => showClock(doc.id));
  }

  function showClock(clockId) {
    navigate(`/clock/${clockId}`);
  }

  function displayClock(clockId) {
    navigate(`/clock/${clockId}/display`);
  }

  const [confirmingDeleteClock, setConfirmingDeleteClock] = useState(false);
  function closeConfirmDeleteClock() {
    setConfirmingDeleteClock(null);
  }
  function confirmDeleteClock() {
    closeConfirmDeleteClock();
    db.doc(`users/${user.uid}/clocks/${confirmingDeleteClock}`).update({ deletedAt: new Date()});
  }
    function deleteClock(clockId) {
    setConfirmingDeleteClock(clockId);
  }

  if (!clocks) return null;

  return <FlexBox flexShrink={0} bgcolor="grey.200">
    <Dialog open={!!confirmingDeleteClock} onClose={closeConfirmDeleteClock}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        <DialogContentText>Deleted clocks can't be restored.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeConfirmDeleteClock}>Cancel</Button>
        <Button onClick={confirmDeleteClock}>Delete clock</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={showingHelp} onClose={closeHelp} PaperProps={{style: {marginTop: 120, marginBottom: 80, height: "calc(100% - 200px)"}}}>
      <DialogTitle>Using Clock Camera</DialogTitle>
      <DialogContent>
        <Box mb={1}>
          Clock Camera is a fun craft project - create clocks you can display in
          any browser, by taking photos that tell the time (maybe a clock, or
          something you made yourself - get creative!)
        </Box>
        <Box mb={1}>
          We've created a default clock for you called 'My First Clock' - when
          you're ready to get started click on it and follow the instructions
          from there.
        </Box>
        <Box mb={1}>
          (You can create as many different clocks as you like - think of a
          theme and click the blue '+' at the bottom to get started.)
        </Box>
        <Box>
          When your clock is done you can click this
          icon: <TimeIcon fontSize="inherit"/> to actually see it in action.
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeHelp}>Close</Button>
      </DialogActions>
    </Dialog>

    <FlexBox flexGrow={0} row justifyContent="flex-end">
      <IconButton onClick={showHelp}><HelpIcon/></IconButton>
    </FlexBox>

    { Object.entries(clocks).map(([clockId, clock]) => (
      <ClockItem
        key={clockId.toString()}
        clockId={clockId}
        showClock={showClock}
        deleteClock={deleteClock}
        displayClock={displayClock}
      />
    ) ) }
    <Box position="absolute" right={16} bottom={16}>
      <Fab color="primary" aria-label="add" onClick={createClock}>
        <AddIcon />
      </Fab>
    </Box>
  </FlexBox>;
}

function ClockItem({clockId, showClock, deleteClock, displayClock}) {
  const [ user ] = useContext(FirebaseContext);
  const clock = useFirestoreDocument(`users/${user.uid}/clocks/${clockId}`);
  const images = useFirestoreCollection(`users/${user.uid}/clocks/${clockId}/images`, ['deletedAt', '==', null]);

  if (!clock) return null;

  return <FlexBox
    component={Card}
    height={100}
    fontSize={["h5.fontSize", "h4.fontSize"]}
    m={1}
    row
    alignItems="stretch"
    flexGrow={0}
    position="relative"
    overflow="hidden"
    style={{cursor: "pointer"}}
  >
    <Box
      position="absolute"
      height="100%"
      width="100%"
      onClick={() => showClock(clockId)}
      pl={4}
      display="flex"
      alignItems="center"
      style={{background: "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 250px, rgba(255,255,255,0) 400px, rgba(255,255,255,0) 100%)"}}
    >{clock.name}</Box>

    <FlexBox
      row
      flexShrink={1}
      overflow="hidden"
    >
      <FlexBox
        row
        flexShrink={0}
      >
        { Object.entries(images).map(([imageId, image]) => (
          <Box
            key={imageId.toString()}
            style={{backgroundImage: `url(${image.url})`}}
            width={100}
            height={100}
          />
        ))}
      </FlexBox>
    </FlexBox>

    <FlexBox
      bgcolor="grey.800"
      flexDirection="column"
      flexGrow={0}
      flexShrink={0}
      justifyContent="flex-end"
    >
      <IconButton onClick={event => displayClock(clockId)}><TimeIcon style={{color: "white"}}/></IconButton>
      <IconButton onClick={event => deleteClock(clockId)}><DeleteIcon style={{color: "white"}}/></IconButton>
    </FlexBox>
  </FlexBox>
}
