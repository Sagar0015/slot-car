import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import { Alert } from '@mui/material';

export default function SimpleSnackbar({
  open, setOpen
}) {

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <Alert onClose={handleClose} severity="info" sx={{ width: '100%' }}>
        {open}
      </Alert>
    </React.Fragment>
  );

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}

        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {action}
      </Snackbar>
    </div>
  );
}
