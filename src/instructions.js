import React from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DuplicateIcon from '@material-ui/icons/FilterNone';
import UnknownIcon from '@material-ui/icons/HelpOutline';
import InvalidIcon from '@material-ui/icons/HighlightOff';
import MissingIcon from '@material-ui/icons/FullScreen';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import MobileStepper from '@material-ui/core/MobileStepper';


const steps = [
  () => (<>
    First thing to do with a new clock is configure it.
    <br/>
    <br/>
    Choose a name, select 12-or-24-hour style, and pick  a frequency
    (a new image every 1, 5, 10, 15, 30 or 60 minutes). These choices
    determine how many images you'll need to add to finish your clock.
  </>),
  () => (<>
    Fill your clock with images by dragging them into the middle of the
    screen, or by clicking the blue '+' button below.
    <br/>
    <br/>
    New images will be marked as 'untagged', with this
    icon: <UnknownIcon fontSize="inherit"/>
  </>),
  () => (<>
    Use the time selectors on the image to tag it with the time that
    matches the image.
    <br/>
    <br/>
    If you've got more than one image with the same tag, you'll see the
    'duplicate' icon on it: <DuplicateIcon fontSize="inherit"/>
  </>),
  () => (<>
    You can show just duplicates using the filter buttons at the bottom
    of the screen - then fix the images that are tagged wrong, and/or
    delete images until you have one per time slot.
  </>),
  () => (<>
    If you reconfigure your clock, you might end up with some images
    that don't match the new configuration - these are labelled with the
    'invalid' icon, like this: <InvalidIcon fontSize="inherit"/>
    <br/>
    <br/>
    You can use the 'invalid' filter to check them, too, and fix or
    delete them to make them match your setup.
  </>),
  () => (<>
    To check which images you still need to complete your clock, click
    the 'missing' filter: <MissingIcon fontSize="inherit"/>
    <br/>
    <br/>
    This view will get you started with a short list of slots you
    haven't filled yet - pick one and get snapping.
  </>),
  () => (<>
    You can always click the 'all' filter option to get back to the main
    list of images.
  </>),
]

export default function Instructions({showingHelp, closeHelp}) {
    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    function handleClose() {
      setActiveStep(0);
      closeHelp();
    }

    return (
    <Dialog open={showingHelp} onClose={closeHelp} PaperProps={{style: {marginTop: 120, marginBottom: 80, maxHeight: "calc(100% - 200px)"}}}>
      <DialogTitle>Creating a clock</DialogTitle>
      <DialogContent>
        <Box mb={3} fontSize="h6.fontSize">
          { steps[activeStep]() }
        </Box>

        <MobileStepper
          position="static"
          variant="dots"
          steps={steps.length}
          activeStep={activeStep}
          nextButton={
            <Button size="small" onClick={handleNext} disabled={activeStep === steps.length - 1}>
              Next <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
              <KeyboardArrowLeft /> Back
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
