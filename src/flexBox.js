import React, { forwardRef } from 'react';
import Box from '@material-ui/core/Box';

const FlexBox = forwardRef(({row, column, flexDirection, children, ...rest}, ref) => {
  const direction = (row && 'row') || (column && 'column') || flexDirection || 'column';

  return <Box
    ref={ref}
    display="flex"
    flexDirection={direction}
    flexGrow={1}
    flexShrink={1}
    {...rest}
  >{children}</Box>
});

export default FlexBox;
