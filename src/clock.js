import React, { useContext, useCallback, useState }  from 'react';

import { useDropzone } from 'react-dropzone'

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import DuplicateIcon from '@material-ui/icons/FilterNone';
import HelpIcon from '@material-ui/icons/Help';
import UnknownIcon from '@material-ui/icons/HelpOutline';
import InvalidIcon from '@material-ui/icons/HighlightOff';
import TimeIcon from '@material-ui/icons/AccessTime';
import ErrorIcon from '@material-ui/icons/Error';
import MissingIcon from '@material-ui/icons/FullScreen';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import { makeStyles } from '@material-ui/core/styles';

import cx from 'classnames';

import FlexBox from './flexBox';

import { db, useFirestoreDocument, useFirestoreCollection, FirebaseContext } from './firebase';
import { NavigationContext } from './navigation';

import useImageCache from './imageCache';
import { uploadImage } from './upload';
import { renderTime } from './utils';

const styles = makeStyles({
  image: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    display: 'flex',
    flexGrow: 1,
  },
  imagePanel: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    overflowX: 'hidden',
    overflowY: 'scroll'
  },
  fab: {
  },
  imageError: {
    borderWidth: 0,
    borderLeftWidth: 2,
    borderColor: 'yellow',
    borderStyle: 'solid'
  }
})

const frequencyOptions = [1, 5, 10, 15, 30, 60];

export default function() {
  const classes = styles();

  const [ user ] = useContext(FirebaseContext);

  const navHash = useContext(NavigationContext);
  const { clockId } = navHash;

  const [imageCache, cacheImage] = useImageCache();

  const clock = useFirestoreDocument(`users/${user.uid}/clocks/${clockId}`);
  const images = useFirestoreCollection(`users/${user.uid}/clocks/${clockId}/images`, ['deletedAt', '==', null]);

  const [confirmingDeleteImage, setConfirmingDeleteImage] = useState(false);
  const [showingHelp, setShowingHelp] = useState(!localStorage.getItem('ShownClockHelp'));
  const showHelp = () => setShowingHelp(true);
  const closeHelp = () => {
    localStorage.setItem('ShownClockHelp', true);
    setShowingHelp(false);
  };

  function queueUpload(clockId, imageId, file) {
    cacheImage(imageId, file);
    uploadImage(user.uid, clockId, imageId, file);
  }

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      db.collection(`users/${user.uid}/clocks/${clockId}/images`).add({createdAt: new Date(), deletedAt: null})
      .then(doc => {
        queueUpload(clockId, doc.id, file);
      });
    });
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({onDrop, noClick: true})

  const [displaySettings, setDisplaySettings] = useState('all');

  function updateDisplaySettings(e, settings) {
    if (settings) {
      setDisplaySettings(settings);
    }
  }

  function updateClock(data) {
    db.doc(`users/${user.uid}/clocks/${clockId}`).update(data);
  }

  function updateImage(imageId, data) {
    db.doc(`users/${user.uid}/clocks/${clockId}/images/${imageId}`).update(data);
  }

  function updateClockName(event) {
    updateClock({name: event.target.value});
  }

  function updateClockPeriod(_, period) {
    updateClock({period});
  }

  function updateClockFrequency(frequency) {
    updateClock({frequency});
  }

  function updateImageTime(imageId, time) {
    updateImage(imageId, {time});
  }

  function askConfirmDeleteImage(imageId) {
    setConfirmingDeleteImage(imageId);
  }
  function closeConfirmDeleteImage() {
    setConfirmingDeleteImage(false);
  }
  function confirmDeleteImage() {
    closeConfirmDeleteImage();
    console.log('delete', confirmingDeleteImage);
    updateImage(confirmingDeleteImage, {deletedAt: new Date()});
  }

  if (!clock) return null;


  const MAX_TIME_PERIODS = {
    12: 720,
    24: 1440,
  };

  const maxTime = MAX_TIME_PERIODS[clock.period];

  const timeIndices = [...Array(maxTime/clock.frequency).keys()];
  const timeValues = timeIndices.map(t => t * clock.frequency);
  const timeOptions = timeValues.map(t => ({value: t, label: renderTime(clock.period, t)}))

  function isValid(t) {
    return timeValues.includes(t);
  }

  let filteredImages = [];

  let hasDuplicate, hasUntagged, hasInvalid = false;
  filteredImages = Object.entries(images).map(([imageId, image]) => {
    const untagged = image.time === undefined;
    const invalid = image.time !== undefined && !isValid(image.time);
    const duplicate = image.time !== undefined &&
      Object.values(images).filter(i => i.time === image.time).length > 1;
    const error = duplicate || untagged || invalid;

    hasDuplicate = hasDuplicate || duplicate;
    hasUntagged = hasUntagged || untagged;
    hasInvalid = hasInvalid || invalid;

    return {...image, id: imageId, duplicate, untagged, invalid, error};
  }).filter(image => {
    if (displaySettings == 'all') return true;
    return image[displaySettings];
  });

  if (displaySettings === 'missing') {
    const times = Object.values(images).map(i => i.time);
    filteredImages = timeValues.
      slice(0, 20).
      filter(t => !times.includes(t)).
      map(t => ({id: t.toString(), time: t, missing: true}));
  }

  const sortedImages = filteredImages.sort((a, b) => {
    let diff = a.time - b.time;
    if (Object.is(diff, NaN)) diff = -Infinity;
    return diff
  });

  function getImage(image) {
    if (image.url || imageCache[image.id]) {
      return <Box
        style={{backgroundImage: `url(${image.url || imageCache[image.id]})`}}
        className={classes.image}/>
    } else {
      return <FlexBox
        alignItems="center"
        justifyContent="center"
        className={classes.image}
        fontSize={["15vw", "10vw", "5vw"]}>{renderTime(clock.period, image.time)}</FlexBox>;
    }
  }

  return <FlexBox overflow="hidden">

    <input {...getInputProps()} />

    <Dialog open={!!confirmingDeleteImage} onClose={closeConfirmDeleteImage}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        <DialogContentText>Deleted images can't be restored.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeConfirmDeleteImage}>Cancel</Button>
        <Button onClick={confirmDeleteImage}>Delete image</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={showingHelp} onClose={closeHelp} PaperProps={{style: {marginTop: 120, marginBottom: 80, height: "calc(100% - 200px)"}}}>
      <DialogTitle>Creating a clock</DialogTitle>
      <DialogContent>
        <Box mb={1}>
          First thing to do with a new clock is configure it.
        </Box>
        <Box mb={1}>
          Choose a name, select 12-or-24-hour style, and pick  a frequency
          (a new image every 1, 5, 10, 15, 30 or 60 minutes). These choices
          determine how many images you'll need to add to finish your clock.
        </Box>
        <Box mb={1}>
          Fill your clock with images by dragging them into the middle of the
          screen, or by clicking the blue '+' button below.
        </Box>
        <Box mb={1}>
          New images will be marked as 'untagged', with this
          icon: <UnknownIcon fontSize="inherit"/>
        </Box>
        <Box mb={1}>
          Use the time selectors on the image to tag it with the time that
          matches the image.
        </Box>
        <Box mb={1}>
          If you've got more than one image with the same tag, you'll see the
          'duplicate' icon on it: <DuplicateIcon fontSize="inherit"/>
        </Box>
        <Box mb={1}>
          You can show just duplicates using the filter buttons at the bottom
          of the screen - then fix the images that are tagged wrong, and/or
          delete images until you have one per time slot.
        </Box>
        <Box mb={1}>
          If you reconfigure your clock, you might end up with some images
          that don't match the new configuration - these are labelled with the
          'invalid' icon, like this: <InvalidIcon fontSize="inherit"/>
        </Box>
        <Box mb={1}>
          You can use the 'invalid' filter to check them, too, and fix or
          delete them to make them match your setup.
        </Box>
        <Box mb={1}>
          To check which images you still need to complete your clock, click
          the 'missing' filter: <MissingIcon fontSize="inherit"/>
        </Box>
        <Box mb={1}>
          This view will get you started with a short list of slots you
          haven't filled yet - pick one and get snapping.
        </Box>
        <Box>
          You can always click the 'all' filter option to get back to the main
          list of images.
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeHelp}>Close</Button>
      </DialogActions>
    </Dialog>

    <FlexBox overflow="hidden" padding={1} bgcolor="grey.300" {...getRootProps()}>

      <FlexBox component={Card} row flexShrink={0} flexGrow={0} p={1} m={1} alignItems="center">
        <FlexBox flexGrow={10} ml={1} mr={2} minWidth={50} maxWidth={400}>
          <TextField value={clock.name} onChange={updateClockName}/>
        </FlexBox>
        <FlexBox row mr={1} flexGrow={1} justifyContent="flex-end">
          <ToggleButtonGroup size="small" value={clock.period} onChange={updateClockPeriod} exclusive>
            <ToggleButton value="12">12H</ToggleButton>
            <ToggleButton value="24">24H</ToggleButton>
          </ToggleButtonGroup>
        </FlexBox>
        <FlexBox flexGrow={0} display={['flex', 'none']}>
          <Select
            onChange={e => updateClockFrequency(e.target.value)}
            renderValue={value => (
              <MenuItem
                key={value}
                style={{paddingRight: 0}}
                dense
                value={value}
                alignItems="center"
              >{value} <FlexBox ml={1}><TimeIcon/></FlexBox></MenuItem>
            )}
            value={clock.frequency}
          >
            { frequencyOptions.map(f => (
              <MenuItem
                key={f}
                value={f}
                alignItems="center"
                style={{paddingRight: 8}}
               >{f} <FlexBox ml={1}><TimeIcon/></FlexBox></MenuItem>
            ))}
          </Select>
        </FlexBox>
        <FlexBox flexGrow={0} display={['none', 'flex']}>
          <ToggleButtonGroup
            size="small"
            value={clock.frequency}
            onChange={(e, v) => updateClockFrequency(v)}
            exclusive
          >
            { frequencyOptions.map(f => (
              <ToggleButton key={f} value={f}>{f} <TimeIcon/></ToggleButton>
            ))}
          </ToggleButtonGroup>
        </FlexBox>
        <IconButton onClick={showHelp}><HelpIcon/></IconButton>
      </FlexBox>

      <FlexBox padding={1} flexGrow={0} style={{overflowY: "auto"}} pb={10}>
        <Grid container spacing={2} direction="row">
          { sortedImages.length === 0 && (
            <FlexBox m={2}>
              { displaySettings === 'all' ? (
                <NoImagesMessage/>
              ) : (
                <>No {displaySettings} items to show.</>
              ) }

            </FlexBox>
          ) }
          { sortedImages.map(image => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={image.id} className={cx({[image.error]: classes.imageError})}>
              <FlexBox
                component={Card}
                height={["60vw", "30vw", "20vw", "15vw", "10vw"]}
                alignItems="stretch"
              >
                { getImage(image) }
                { !image.missing &&(
                <FlexBox row alignItems="center" flexGrow={0} bgcolor="grey.200">
                  <FlexBox m={1} flexDirection="row" alignItems="center">
                    <TimeSelect
                      value={image.time}
                      frequency={clock.frequency}
                      period={clock.period}
                      error={!isValid(image.time)}
                      onChange={time => updateImageTime(image.id, time)}
                    />
                  </FlexBox>
                    <FlexBox row alignItems="center" flexGrow={0}>
                    { image.duplicate && (
                      <Tooltip title="Duplicate time" aria-label="Duplicate time">
                        <DuplicateIcon color="error"/>
                      </Tooltip>)
                    }
                    { image.untagged && (
                      <Tooltip title="No time selected" aria-label="No time selected">
                        <UnknownIcon color="error"/>
                      </Tooltip>)
                    }
                    { image.invalid && (
                      <Tooltip title="Invalid time selected" aria-label="Invalid time selected">
                        <InvalidIcon color="error"/>
                      </Tooltip>)
                    }
                    <IconButton onClick={() => askConfirmDeleteImage(image.id)}><DeleteIcon/></IconButton>
                  </FlexBox>
                </FlexBox>)
              }
              </FlexBox>
            </Grid>
          ))}
        </Grid>
      </FlexBox>
      { /*
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      */}
    </FlexBox>

    <FlexBox position="absolute" bottom={16} right={16} row alignItems="center">
      <FlexBox mr={1}>
        <ToggleButtonGroup size="small" value={displaySettings} onChange={updateDisplaySettings} exclusive>
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="untagged">
            <FlexBox display={['none', 'flex']} row alignItems="center">
              Untagged { hasUntagged && <FlexBox ml={1}><ErrorIcon color="error"/></FlexBox> }
            </FlexBox>
            <FlexBox display={['flex', 'none']} row alignItems="center">
              <UnknownIcon color={hasUntagged ? "error" : "inherit"}/>
            </FlexBox>
          </ToggleButton>
          <ToggleButton value="duplicate">
            <FlexBox display={['none', 'flex']} row alignItems="center">
              Duplicates { hasDuplicate && <FlexBox ml={1}><ErrorIcon color="error"/></FlexBox> }
            </FlexBox>
            <FlexBox display={['flex', 'none']} row alignItems="center">
              <DuplicateIcon color={hasDuplicate ? "error" : "inherit"}/>
            </FlexBox>
          </ToggleButton>
          <ToggleButton value="invalid">
            <FlexBox display={['none', 'flex']} row alignItems="center">
              Invalid { hasInvalid && <FlexBox ml={1}><ErrorIcon color="error"/></FlexBox> }
            </FlexBox>
            <FlexBox display={['flex', 'none']} row alignItems="center">
              <InvalidIcon color={hasInvalid ? "error" : "inherit"}/>
            </FlexBox>
          </ToggleButton>
          <ToggleButton value="missing">
            <FlexBox display={['none', 'flex']} row alignItems="center">
              Missing
            </FlexBox>
            <FlexBox display={['flex', 'none']} row alignItems="center">
              <MissingIcon/>
            </FlexBox>
          </ToggleButton>
        </ToggleButtonGroup>
      </FlexBox>
      <Fab color="primary" aria-label="add" onClick={open} className={classes.fab}>
        <AddIcon />
      </Fab>
    </FlexBox>
   </FlexBox>
}

function TimeSelect({value, period, frequency, error, onChange}) {
  const hours = [...Array(parseInt(period, 10)).keys()];
  const minutes = [...Array(60/frequency).keys()].map(f => f * frequency);
  let hour, minute;

  if (value === undefined) {
    hour = '';
    minute = '';
  } else {
    hour = Math.floor(value / 60);
    if (!hours.includes(hour)) hours.push(hour);
    minute = value % 60;
  }

  const hourOptions = hours.map(h => ({ value: h, disabled: false }));
  const minuteOptions = minutes.map(m => ({ value: m, disabled: false }));
  if (!hours.includes(hour)) hourOptions.push({value: hour, disabled: true});
  if (!minutes.includes(minute)) minuteOptions.push({value: minute, disabled: true});

  function handleChange(event) {
    const { value, name } = event.target;

    let newTime;
    if (name === 'hour') {
      newTime = value * 60 + (minute === '' ? 0 : minute);
    } else {
      newTime = (hour === '' ? 0 : hour) * 60 + value;
    }

    onChange(newTime);
  }

  return <>
    <FormControl error={error}>
      <Select name="hour" value={hour} onChange={handleChange}>
        { hourOptions.map(({value, disabled}) =>
          <MenuItem
            disabled={disabled}
            key={value.toString()}
            value={value}>
              {(period === '12' && value === 0 ? 12 : value).toString().padStart(2, '0')}
          </MenuItem>
        )}
      </Select>
    </FormControl>
    :
    <FormControl error={error}>
      <Select name="minute" value={minute} onChange={handleChange}>
        { minuteOptions.map(({value, disabled}) => <MenuItem
          disabled={disabled}
          key={value.toString()}
          value={value}>
            {value.toString().padStart(2, '0')}
          </MenuItem>
        ) }
      </Select>
    </FormControl>
  </>;
}

const NoImagesMessage = () => 'No clock images yet. Drag an image here - or click the '+' in the bottom right - to add one.'
