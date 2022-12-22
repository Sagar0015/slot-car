import logo from './logo.svg';
import './App.css';
import { Box, Button, FormControl, FormLabel, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import _, { isEqual, orderBy, sumBy } from 'lodash'
import Roboflow from './roboflo';
import SimpleSnackbar from './components/Snackbar';

function App() {
  const videoRef = React.useRef()
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = useState('')
  const [laps, setLaps] = useState(3)
  const [raceStart, setRaceStart] = useState(false)
  const [lapEnd, setLapEnds] = useState(false)
  const [lapRecord, setLapRecord] = useState([])
  const [averageTime, setAverageTime] = useState(null)
  const [millieSecond, setMillieSecond] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [predictions, setPredictions] = useState([])



  useEffect(() => {
    const interval = setInterval(() => {
      if (raceStart) {
        setMillieSecond(seconds => seconds + 500);

      } else {
        setMillieSecond(0)
        clearInterval(interval)
      }
    }, 500);
    return () => clearInterval(interval);
  }, [raceStart]);

  console.log('millieSecond', millieSecond, lapEnd)

  //check if lap isCompleted
  useEffect(() => {
    if (lapEnd) {
      setLapRecord([...lapRecord, { time: millieSecond, laps: lapRecord.length + 1 }])
      setMillieSecond(0)
      setLapEnds(false)
    }
  }, [lapEnd])

  //To be removed : for now end lap in 3 sec
  useEffect(() => {
    if (millieSecond === 3000) {
      setLapEnds(true)

    }
  }, [millieSecond])

  //check if race is completed 
  useEffect(() => {
    if (lapRecord.length === laps) {
      let average = (Number(sumBy(lapRecord, 'time') / lapRecord.length) / 1000).toFixed(2);
      setAverageTime(average)
      setRaceStart(false)
    }
  }, [lapRecord])


  const handleStart = () => {
    setRaceStart(true)
  }

  const handleStop = () => {
    setRaceStart(false)
    let average = (Number(sumBy(lapRecord, 'time') / lapRecord.length) / 1000).toFixed(2)
    setAverageTime(average);
    let finalObj = {
      name,
      laps: lapRecord.length,
      average
    }
    setLeaderboard([...leaderboard, finalObj])
  }
  const handleReset = () => {
    setRaceStart(false)
    setAverageTime(null)
    setLapRecord([])
    setLapEnds(false)
    setLaps(3)
    setName('')

  }

  

  const handleSetPrediction = (data) => {
    const orderedByConfindence = _.orderBy(data, (item) => item?.bbox, ['confidence'])
    setPredictions(orderedByConfindence)
  }

  const handleSetFinishLineCoordinate = () => {

  }
  return (
    <Box p={'40px'}>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box position={'relative'} margin={'0 auto'} width={'740px'} height={'480px'}>

            <Roboflow
              handleSetPrediction={handleSetPrediction}
              modelName="slot-car-racing" modelVersion="1"
              handleSetFinishLineCoordinate={handleSetFinishLineCoordinate}

            />
          </Box>

        </Grid>
        <Fragment>

          <Grid item xs={6}>
            <Box display={'flex'} flexDirection={'column'} gap={'15px'}>
              <FormControl>
                <FormLabel>
                  <Typography color="black">
                    Name
                  </Typography>
                </FormLabel>
                <TextField value={name} onChange={(e) => { setName(e.target.value) }} />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <Typography color="black">
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
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={6}>6</MenuItem>

                </Select>
              </FormControl>
              <Button onClick={handleStart} disabled={raceStart} variant='contained'>
                Start
              </Button>
              <Box>
                <TableContainer component={Paper}>
                  <Table aria-label="simple table">
                    <TableHead>
                      <TableRow>
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
                      <TableRow

                      >
                        <TableCell component="th" scope="row">
                          name
                        </TableCell>
                        <TableCell align="right">123</TableCell>


                      </TableRow>
                      {lapRecord && lapRecord.map(data => (
                        <TableRow

                        >
                          <TableCell component="th" scope="row">
                            {data?.laps}
                          </TableCell>
                          <TableCell align="right">                          {data?.time}
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
                <Button onClick={handleStop} fullWidth color="error" variant='contained'>
                  Stop and save
                </Button>   <Button onClick={handleReset} fullWidth variant='contained'>
                  Reset
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead sx={{ background: '#0EB3E852' }}>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight={600}>
                        Name
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        Laps
                      </Typography></TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        Average time
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard && orderBy(leaderboard, ['laps', 'average',], ['desc', 'asc']).map(data => (
                    <TableRow

                    >
                      <TableCell component="th" scope="row">
                        {data?.name}
                      </TableCell>
                      <TableCell align="right">
                        {data?.laps}

                      </TableCell>
                      <TableCell align="right">
                        {data?.average}

                      </TableCell>

                    </TableRow>
                  ))}

                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Fragment>
      </Grid>
      <SimpleSnackbar open={modalOpen} setOpen={setModalOpen} />
    </Box >

  );
}

export default App;
