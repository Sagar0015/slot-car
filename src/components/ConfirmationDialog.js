import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { Fragment } from 'react';
function ConfirmationDialog({
  openModal,
  setOpenModal,
  title,
  acceptText,
  rejectText,
  handleConfirm
}) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(openModal);
  }, [openModal]);

  const handleClose = () => {
    setOpen(false);
    setOpenModal(null);
  };
  const handleOpen = () => {
    setOpen(true);
    setOpenModal(true);
  };

  return (
    <Fragment>
      {/* <Button onClick={handleOpen} variant="contained">
        Delete {isStudent ? 'Student' : ' Instructor'}
      </Button> */}

      <Dialog onClose={handleClose} open={open}>
        {/* <DialogTitle>Set backup account</DialogTitle> */}
        <DialogContent>
          <Box display={'flex'} gap={'23px'}>
            <Typography sx={{ color: '#FF0000' }}>{title ?? ''}</Typography>
          </Box>
          <Box
            justifyContent={'center'}
            mt={'53px'}
            display={'flex'}
            gap={'26px'}
          >
            <Button onClick={handleConfirm} color={'error'} variant="contained">
              {acceptText ?? 'Delete'}
            </Button>
            <Button onClick={handleClose} variant="contained">
              {rejectText ?? 'Delete'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

export default ConfirmationDialog;
