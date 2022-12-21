import logo from './logo.svg';
import './App.css';
import { Box, Button, FormControl, FormLabel, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import _ from 'lodash'
import Roboflow from './roboflo';
import SimpleSnackbar from './components/Snackbar';

function App() {
  const videoRef = React.useRef()
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef
    }

  }, [videoRef])



  const [predictions, setPredictions] = useState([])
  const [raceStart, setRaceStart] = useState(false)

  const [initialCoordinate, setInitialCoordinate] = useState(null)
  const [soloCar, setSoloCar] = useState(null)
  const [milliTimeInSecond, setTimeInMilliSeconds] = useState(0)
  const [name, setName] = useState('')
  const [laps, setLaps] = useState(1)
  const [leaderboard, setLeaderboard] = useState([])
  const [lapRecord, setLapRecord] = useState([])






  const runTimer = () => {
    if (raceStart) {
      if (milliTimeInSecond < 5000) {

        setTimeInMilliSeconds(prev => prev + 1)
      } else {
        setLapRecord(prev => prev.push({ name, laps }))
        setTimeInMilliSeconds(0)

      }

    } else {
      clearTimeout(myTimeout)
    }
  }
  const myTimeout = setTimeout(runTimer, 100);



  useEffect(() => {
    if (!raceStart && !!predictions.length) {
      console.log('abc')

      setSoloCar(predictions[0])
      setInitialCoordinate(predictions[0]?.bbox)
    }
    if (raceStart) {
      console.log('prediction', predictions[0], 'soloCar', soloCar, 'initialCoordinate', initialCoordinate
      )
    }
  }, [predictions])




  const handleSetPrediction = (data) => {
    if (!raceStart && data) {
      const orderedByConfindence = _.orderBy(data, (item) => item?.bbox, ['confidence'])
      setPredictions(orderedByConfindence)
    }
  }
  const handleStart = () => {
    if (soloCar && predictions) {
      setRaceStart(true)
    } else {
      // setModalOpen('No car detected to start the race.')
      alert("No car found")
    }
  }
  const handleStop = () => {
    setRaceStart(false)

  }
  const handleReset = () => {
    setRaceStart(false)
    setPredictions([])
    setInitialCoordinate(null)
    setTimeInMilliSeconds(0)
    setSoloCar(null)
  }

  const handleSetFinishLineCoordinate = (canvasRef, e, ctx) => {
    if (ctx) {
      console.log('abc')
      const rect = canvasRef?.getBoundingClientRect()
      const x = e.offsetX
      const y = e.offsetY
      console.log("x: " + x + " y: " + y)
      let x1 = 0, y1 = 150;
      let x2 = 150, y2 = 145;
      var a = x1 - x2;
      var b = y1 - y2;



      var finishLine = Math.hypot(a, b)

      let t1 = x, t2 = y;
      var c = x1 - t1
      var d = y1 - t2

      var f = x2 - t1
      var g = y2 - t2

      let distanceT1X1 = Math.hypot(c, d)
      let distanceT2X2 = Math.hypot(f, g)
      let distanceTFromFinishLine = distanceT1X1 + (distanceT2X2 - distanceT1X1) / 2
      // console.log('distanceTFromFinishLine', distanceTFromFinishLine, finishLine, distanceT1X1, distanceT2X2)
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'red'
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      console.log('is coordinate on the finish line', ctx.isPointInStroke(x, y))

      ctx.stroke();

    }

    // ctx.beginPath();
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = 'red'
    // ctx.rect(x, y, 88 / 2, 46 / 2);
    // ctx.stroke();
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
              </Select>
            </FormControl>
            <Button onClick={handleStart} variant='contained'>
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
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box>
              <Typography variant={"h6"}>Average time 4 sec</Typography>
            </Box>
            <Box display={'flex'} gap={'30px'} justifyContent={'space-around'}>
              <Button onClick={handleStop} fullWidth color="error" variant='contained'>
                Stop
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
                <TableRow

                >
                  <TableCell component="th" scope="row">
                    name
                  </TableCell>
                  <TableCell align="right">123</TableCell>
                  <TableCell align="right">123</TableCell>

                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

      </Grid>
      <SimpleSnackbar open={modalOpen} setOpen={setModalOpen} />
    </Box>

  );
}

export default App;
