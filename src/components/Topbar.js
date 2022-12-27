import { Box } from '@mui/system'
import React from 'react'
import logo from '../assets/logo.png'

function Topbar() {
  return (
    <Box>
      <img src={logo} alt={'logo'} style={{ width: '107px', height: '66px' }} />
    </Box>
  )
}

export default Topbar