import { Box } from '@mui/system'
import React from 'react'
import logo from '../assets/logo.png'
import ces from '../assets/ces.png'


function Topbar() {
  return (
    <Box mt={'30px'} display={'flex'} alignItems={'center'} gap={'30px'} p={'0 30px'} justifyContent={'space-between'}>

      <img src={logo} alt={'logo'} style={{ width: '107px', height: '66px' }} />
      <img src={ces} alt={'ces'} style={{ width: 'auto', height: '66px' }} />

    </Box>
  )
}

export default Topbar