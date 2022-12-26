import logo from './logo.svg';
import './App.css';
import { Box, Button, FormControl, FormLabel, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import _, { isEqual, sumBy } from 'lodash'
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
  const [averageTime, setAverageTime] = useState(0)
  const [name, setName] = useState('')
  const [laps, setLaps] = useState(3)
  const [leaderboard, setLeaderboard] = useState([])
  const [lapRecord, setLapRecord] = useState([])

  const [init, setInit] = useState(false)
  const [lapEnds, setLapEnds] = useState(false)








  const runTimer = () => {
    if (raceStart) {
      if (milliTimeInSecond === 3000) {

        setLapRecord([...lapRecord, { time: milliTimeInSecond, laps: lapRecord.length + 1 }])
        setTimeInMilliSeconds(0)

      } else {
        setTimeInMilliSeconds(milliTimeInSecond + 500)
      }

    } else {
      clearInterval(myTimeout)
    }
  }
  const myTimeout = setInterval(runTimer, 500);

  console.log('milliTimeInSecond', milliTimeInSecond, lapRecord, laps)

  useEffect(() => {
    if (!raceStart && !!predictions.length) {

      setSoloCar(predictions[0])
      setInitialCoordinate(predictions[0]?.bbox)
    }
    if (raceStart) {
      console.log('prediction', predictions[0], 'soloCar', soloCar, 'initialCoordinate', initialCoordinate
      )
    }
  }, [predictions])

  useEffect(() => {
    if (lapRecord.length === laps) {
      // clearInterval(myTimeout)

      // setAverageTime((Number(sumBy(lapRecord, 'time') / laps) / 1000).toFixed(2))
      // setRaceStart(false)
      // setTimeInMilliSeconds(0)

    }

  }, [lapRecord])





  const handleSetPrediction = (data) => {
    if (!raceStart && data) {
      const orderedByConfindence = _.orderBy(data, (item) => item?.bbox, ['confidence'])
      setPredictions(orderedByConfindence)
    }
  }
  const handleStart = () => {
    setRaceStart(true)

    if (soloCar && predictions) {
      setRaceStart(true)
    } else {
      // setModalOpen('No car detected to start the race.')
      // alert("No car found")
    }
  }
  const handleStop = () => {
    let average = (Number(sumBy(lapRecord, 'time') / laps) / 1000).toFixed(2)
    setAverageTime(average);
    handleReset()


  }

  const handleSave = () => {
    let average = (Number(sumBy(lapRecord, 'time') / laps) / 1000).toFixed(2)
    setAverageTime(average);
    let finalObj = {
      name,
      laps: lapRecord.length,
      average
    }
    setLeaderboard(leaderboard.push(finalObj))
    setRaceStart(false)
    setTimeInMilliSeconds(0)
  }
  const handleReset = () => {
    setRaceStart(false)
    setPredictions([])
    setInitialCoordinate(null)
    setTimeInMilliSeconds(0)
    setSoloCar(null)
  }

  const handleSetFinishLineCoordinate = (canvasRef, e, ctx, props) => {
    if (ctx) {
      console.log('abc', props)
      const rect = canvasRef?.getBoundingClientRect()
      const x = e.offsetX
      const y = e.offsetY
      console.log("x: " + x + " y: " + y)
      // let x1 = 0, y1 = 150;
      // let x2 = 150, y2 = 145;
      // var a = x1 - x2;
      // var b = y1 - y2;



      // var finishLine = Math.hypot(a, b)

      // let t1 = x, t2 = y;
      // var c = x1 - t1
      // var d = y1 - t2

      // var f = x2 - t1
      // var g = y2 - t2

      // let distanceT1X1 = Math.hypot(c, d)
      // let distanceT2X2 = Math.hypot(f, g)
      // let distanceTFromFinishLine = distanceT1X1 + (distanceT2X2 - distanceT1X1) / 2
      // console.log('distanceTFromFinishLine', distanceTFromFinishLine, finishLine, distanceT1X1, distanceT2X2)

      // if (finishPointX1 && finishPointY1 && finishPointX2 && finishPointY2) {
      //   console.log('draw line')
      //   ctx.beginPath();
      //   ctx.lineWidth = 5;
      //   ctx.strokeStyle = 'red'
      //   ctx.moveTo(Number(finishPointX1), Number(finishPointY1));
      //   ctx.lineTo(Number(finishPointX2), Number(finishPointY2));

      //   ctx.stroke();
      // }


    }

    // ctx.beginPath();
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = 'red'
    // ctx.rect(x, y, 88 / 2, 46 / 2);
    // ctx.stroke();
  }

  const handleSetFinishLine = () => {
    setInit(true)
  }
  return (
    <Box p={'40px'}>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box position={'relative'} margin={'0 auto'} width={'740px'} height={'480px'}>

            {/* <Roboflow
              handleSetPrediction={handleSetPrediction}
              modelName="slot-car-racing" modelVersion="1"
              handleSetFinishLineCoordinate={handleSetFinishLineCoordinate}
              finishPointX1={finishPointX1} finishPointX2={finishPointX2} finishPointY1={finishPointY1} finishPointY2={finishPointY2}
              init={init}
            /> */}
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
        </Fragment>
      </Grid>
      <SimpleSnackbar open={modalOpen} setOpen={setModalOpen} />
    </Box >

  );
}

export default App;
