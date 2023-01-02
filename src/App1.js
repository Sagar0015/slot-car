import './App.css';
import { Box, Button, FormControl, FormLabel, Grid, MenuItem, Paper, Select, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, styled } from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import _, { isEmpty, isEqual, orderBy, sumBy } from 'lodash'
import Roboflow from './roboflo';
import SimpleSnackbar from './components/Snackbar';
import Topbar from './components/Topbar';
import layer from './assets/layer.svg'
import { ThemeProvider } from '@mui/system';
import { appTheme } from './theme';
import { model, version } from './constant';
import ConfirmationDialog from './components/ConfirmationDialog';
import test from './assets/car.gif'



const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.primary.main,

    boxSizing: 'border-box',
  },
}));

function App() {
  const videoRef = React.useRef()
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = useState('Sagar')
  const [laps, setLaps] = useState(3)
  const [raceStart, setRaceStart] = useState(false)
  const [lapEnd, setLapEnds] = useState(false)
  const [lapRecord, setLapRecord] = useState([])
  const [averageTime, setAverageTime] = useState(null)
  const [millieSecond, setMillieSecond] = useState(0)
  const [FPS, setFps] = useState(0)
  const [displayFps, setDisplayFps] = useState(true)


  const [leaderboard, setLeaderboard] = useState([

  ])
  const [predictions, setPredictions] = useState([])

  const [initialCoordinate, setInitialCoordinate] = useState(null)
  const [soloCar, setSoloCar] = useState(null)

  useEffect(() => {
    let savedLeaderBoard = localStorage.getItem('savedLeaderBoard') ? JSON.parse(localStorage.getItem('savedLeaderBoard')) : []
    if (savedLeaderBoard.length) {
      setLeaderboard(savedLeaderBoard)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (raceStart) {
        setMillieSecond((seconds) => seconds + 100);

      } else {
        setMillieSecond(0)
        clearInterval(interval)
      }
    }, 100);
    return () => clearInterval(interval);
  }, [raceStart]);

  //check if lap isCompleted
  useEffect(() => {
    if (lapEnd) {
      // setLapRecord([...lapRecord, { time: ((millieSecond / 1000)), laps: lapRecord.length + 1 }])
      // setMillieSecond(0)
      // setLapEnds(false)
    }
  }, [lapEnd])


  function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  useEffect(() => {

    let checkIfLapEnds = predictions && checkIfCarIsInFinishRectangle(
      {
        x: predictions[0]?.bbox?.x,
        y: predictions[0]?.bbox?.y,
        width: predictions[0]?.bbox?.width,
        height: predictions[0]?.bbox?.height
      }

    )
    if (checkIfLapEnds) {

      console.log(checkIfLapEnds, lapEnd)
    }
    if (checkIfLapEnds && millieSecond > 3000) {
      setLapRecord([...lapRecord, { time: ((millieSecond / 1000)), laps: lapRecord.length + 1 }])
      setMillieSecond(0)

    }

  }, [millieSecond, predictions])



  //check if race is completed 
  useEffect(() => {
    if (lapRecord.length === laps) {
      let average = (Number(sumBy(lapRecord, 'time') / lapRecord.length)).toFixed(2);
      setAverageTime(average)
      setRaceStart(false)
    }
  }, [lapRecord])


  const handleStart = () => {
    setRaceStart(true)
    setAverageTime(null)
    setLapRecord([])
    setLapEnds(false)

  }

  const handleStop = () => {
    setRaceStart(false)
    let average = (Number(sumBy(lapRecord, 'time') / lapRecord.length)).toFixed(2)
    const bestLapTime = _.orderBy(lapRecord, (item) => item, ['time'])[0]?.time ?? null

    setAverageTime(average);
    let finalObj = {
      name,
      laps: lapRecord.length,
      average,
      lapRecord: lapRecord,
      bestLapTime: bestLapTime
    }
    setLeaderboard([...leaderboard, finalObj])
    let savedLeaderBoard = localStorage.getItem('savedLeaderBoard') ? JSON.parse(localStorage.getItem('savedLeaderBoard')) : []
    savedLeaderBoard = [...savedLeaderBoard, finalObj]
    localStorage.setItem('savedLeaderBoard', JSON.stringify(savedLeaderBoard))
    setLapRecord([])
    setLapEnds(false)
    setLaps(3)
    setName('')

  }
  const handleReset = () => {
    setRaceStart(false)
    setAverageTime(null)
    setLapRecord([])
    setLapEnds(false)
    setLaps(3)
    setName('')

  }

  useEffect(() => {
    if (!raceStart && !!predictions.length) {
      setSoloCar(predictions[0])

      setInitialCoordinate(predictions[0]?.bbox)
    }
    if (raceStart) {
      // console.log('prediction', predictions[0], 'soloCar', soloCar, 'initialCoordinate', initialCoordinate
      // )


    }
  }, [predictions])



  const checkIfCarIsInFinishRectangle = (rectB) => {
    let rectA = {
      x: initialCoordinate?.x,
      y: initialCoordinate?.y,
      width: initialCoordinate?.width,
      height: initialCoordinate?.height
    }
    if (rectB) {
      return Math.abs(rectA.x - rectB.x) < 2

    }

    return false

  };
  const handleSetPrediction = (data) => {
    const orderedByConfindence = _.orderBy(data, (item) => item?.bbox, ['confidence'])

    setPredictions(orderedByConfindence)
  }

  const handleSetFinishLineCoordinate = () => {

  }
  const [openModal, setOpenModal] = React.useState(false);
  const [rankByAverage, setRankByAverage] = React.useState(false);


  const handleResetLeaderboard = () => {
    console.log('sad')
    setOpenModal(false)

    localStorage.removeItem('savedLeaderBoard')
    setLeaderboard([])
  }
  const rankBy = rankByAverage ? ['average', 'laps'] : ['bestLapTime', 'laps']
  return (
    <ThemeProvider theme={appTheme}>

      <Box bgcolor={'#f0eef9'}>
        <Box height={'90vh'} p={'10px 10px 30px 10px'} sx={{ background: `linear-gradient(0deg,#009FFD,rgba(31,6,85,.1)),url(${layer}),linear-gradient(180deg,#1f0655,#009FFD)` }}>
          <Topbar />
          <Box mt={'30px'} display={'flex'} alignItems={'center'} gap={'30px'} p={'0 30px'}>
            <Box display={'flex'} width={'40%'} flexDirection={'column'} gap={'15px'}>
              <FormControl>
                <FormLabel>
                  <Typography color="white">
                    Name
                  </Typography>
                </FormLabel>
                <TextField inputProps={{ style: { background: '#fff' } }} value={name} onChange={(e) => { setName(e.target.value) }} />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <Typography color="white">
                    No of laps
                  </Typography>
                </FormLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={laps}
                  label="Age"
                  onChange={(e) => {
                    setLaps(e.target.value)
                  }}
                  sx={{ background: '#fff' }}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={6}>6</MenuItem>

                </Select>
              </FormControl>
              <Button color={'primary'} onClick={handleStart} disabled={raceStart} variant='contained'>
                <Typography fontSize={'medium'} fontWeight={500} >
                  Start
                </Typography>
              </Button>
              <Box>
                <TableContainer component={Paper}>
                  <Table aria-label="simple table">
                    <TableHead >
                      <TableRow >
                        <TableCell>
                          <Typography fontWeight={600}>
                            Laps
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            Time
                          </Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>

                      {lapRecord && lapRecord.map(data => (
                        <TableRow

                        >
                          <TableCell component="th" scope="row">
                            {data?.laps}
                          </TableCell>
                          <TableCell align="right">                          {data?.time.toFixed(2)} sec
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box>
                {!!lapRecord.length && averageTime && <Typography variant={"h6"}>Average time {averageTime}sec</Typography>}
              </Box>
              <Box display={'flex'} gap={'30px'} justifyContent={'space-around'}>
                <Button disabled={isEmpty(lapRecord)} onClick={handleStop} fullWidth color="error" variant='contained'>
                  Stop and save
                </Button>   <Button onClick={handleReset} fullWidth variant='contained'>
                  Reset
                </Button>
              </Box>
            </Box>
            <Box position={'relative'} margin={'0 auto'} width={'55%'} height={'80vh'} maxHeight={'566px'}>

              <Roboflow
                handleSetPrediction={handleSetPrediction}
                modelName={model} modelVersion={version}
                handleSetFinishLineCoordinate={handleSetFinishLineCoordinate}
                initialCoordinate={initialCoordinate}
                setFps={setFps}

              />
              <Box display={'flex'} alignItems={'center'} position={'absolute'} bottom={-60} gap={'20px'} right={10} >
                {displayFps && <Typography fontWeight={700} color={'white'}>{Math.floor(FPS / 1000)} fps</Typography>}

                <Button size='small' onClick={() => setDisplayFps(!displayFps)} variant={'outlined'}>{displayFps ? 'Hide' : 'Show'} fps</Button>
              </Box>
            </Box>
          </Box>

        </Box>
        <Box p={'40px'}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography> Best lap time</Typography>

            <AntSwitch checked={rankByAverage} onChange={() => setRankByAverage(!rankByAverage)} inputProps={{ 'aria-label': 'ant design' }} />
            <Typography> Average time</Typography>


          </Stack>
          <Grid container spacing={2}>

            <Fragment>

              <Grid item xs={6}>
                <Box width={'100%'} height={'100%'}>

                  <TableContainer sx={{ background: '#fff' }} component={Paper}>
                    <Table aria-label="simple table">
                      <TableHead sx={{ background: '#847ad1' }}>
                        <TableRow>
                          <TableCell>
                            <Typography color={'white'} fontWeight={600}>
                              Name
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={'white'} fontWeight={600}>
                              Laps
                            </Typography></TableCell>
                          <TableCell align="right">
                            <Typography color={'white'} fontWeight={600}>
                              Average time
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={'white'} fontWeight={600}>
                              Lap time
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                    </Table>
                  </TableContainer>
                  <TableContainer sx={{ height: '430px', overflow: 'auto', background: '#fff' }} >
                    <Table>
                      <TableBody>{console.log('rankBy', rankBy)}
                        {leaderboard && orderBy(leaderboard, rankBy, ['asc',]).map(data => (
                          <TableRow

                          >
                            <TableCell
                              sx={{ padding: '0 0 0 5px' }}
                              component="td" scope="row">
                              {data?.name}
                            </TableCell>
                            <TableCell align="right">
                              {data?.laps}

                            </TableCell>
                            <TableCell align="right">
                              {data?.average}s

                            </TableCell>
                            <TableCell align="right">
                              {data?.bestLapTime}s
                            </TableCell>

                          </TableRow>
                        ))}

                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box display={'flex'} width={'50%'} mt={'20px'} gap={'30px'} justifyContent={'space-around'}>
                    <Button onClick={() => setOpenModal(true)} color="error" fullWidth variant='contained'>
                      Reset Leaderboard
                    </Button>
                    <ConfirmationDialog
                      setOpenModal={setOpenModal}
                      openModal={openModal}
                      acceptText={'Confirm'}
                      rejectText={'Cancel'}
                      title={'Are you sure you want to leave reset leaderboard?'}
                      handleConfirm={() => handleResetLeaderboard()}
                    />

                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box width={'100%'} height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>

                  <img src={test} alt={'ces'} style={{ width: '100%', height: '100%', objectFit: 'contain', paddingBottom: '40px' }} />
                </Box>
              </Grid>

            </Fragment>
          </Grid>
          <SimpleSnackbar open={modalOpen} setOpen={setModalOpen} />
        </Box >
      </Box>
    </ThemeProvider>


  );
}

export default App;
