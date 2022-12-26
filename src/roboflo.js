import { Backdrop, CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { orderBy } from "lodash";
import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

export const key = 'rf_BfXqX0b70aeyibaAl5eRhqgy2yJ3'
const Roboflow = (props) => {
  const { initialCoordinate } = props
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [Coordinates, setCoordinates] = useState(null)
  const [RoboModel, setRoboModel] = useState(null)


  useEffect(() => {
    if (initialCoordinate) {
      setCoordinates(initialCoordinate)
    }
  }, [initialCoordinate])


  var inferRunning;
  var model;



  const startInfer = () => {
    inferRunning = true;
    window.roboflow
      .auth({
        publishable_key: key
      })
      .load({
        model: props.modelName,
        version: props.modelVersion,
        onMetadata: function (m) {
          console.log("model loaded");
        }
      }).then((model) => {
        if (inferRunning) {
          console.log('model running')
          setRoboModel(model)
        }


      });
  };

  useEffect(startInfer, []);


  useEffect(() => {
    const interval = setInterval(() => {
      if (RoboModel) {
        detect(RoboModel)


      } else {
        clearInterval(interval)
      }
    }, 10);
    return () => clearInterval(interval);
  }, [RoboModel, Coordinates]);



  // const stopInfer = () => {
  //     inferRunning = false;
  //     if (model) model.teardown();
  // };

  const detect = async (model) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      adjustCanvas(videoWidth, videoHeight);

      const detections = await model.detect(webcamRef.current.video);

      props.handleSetPrediction(detections)
      const ctx = canvasRef?.current?.getContext("2d");

      drawBoxes(detections, ctx);
    }
  };

  const adjustCanvas = (w, h) => {
    canvasRef.current.width = w * window.devicePixelRatio;
    canvasRef.current.height = h * window.devicePixelRatio;

    canvasRef.current.style.width = w + "px";
    canvasRef.current.style.height = h + "px";

    canvasRef.current.getContext("2d").scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  const drawBoxes = (detections, ctx) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (Coordinates) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red'
      const orderedByConfindence = orderBy(detections, (item) => item?.bbox, ['confidence'])

      ctx.rect(Coordinates?.x - 10, Coordinates?.y - 10, Coordinates?.width + 20, Coordinates?.height + 20);
      ctx.stroke();
      const isPointInPath = ctx.isPointInPath(Coordinates?.bbox?.x, Coordinates?.bbox?.y);
    }
    detections.forEach((row) => {
      if (true) {
        //video
        var temp = row.bbox;
        temp.class = row.class;
        temp.color = row.color;
        temp.confidence = row.confidence;
        row = temp;
      }

      if (row.confidence < 0) return;
      if (ctx) {
        //dimensions
        // var x = row.x - row.width / 2;
        // var y = row.y - row.height / 2;
        var x = row.x
        var y = row.y
        var w = row.width;
        var h = row.height;

        //box
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = row.color;
        ctx.rect(x, y, w, h);
        ctx.stroke();

        //line
        // ctx.beginPath();
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = 'red'
        // ctx.moveTo(90, 100);
        // ctx.lineTo(499.67124938964844, 365.0818920135498);
        // ctx.stroke();

        //shade
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1.0;

        //label
        var fontColor = "black";
        var fontSize = 12;
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = "center";
        var classTxt = row.class;
        var confTxt = (row.confidence * 100).toFixed().toString() + "%";
        var msgTxt = classTxt + " " + confTxt;
        const textHeight = fontSize;
        var textWidth = ctx.measureText(msgTxt).width;

        if (textHeight <= h && textWidth <= w) {
          ctx.strokeStyle = row.color;
          ctx.fillStyle = row.color;
          ctx.fillRect(
            x - ctx.lineWidth / 2,
            y - textHeight - ctx.lineWidth,
            textWidth + 2,
            textHeight + 1
          );
          ctx.stroke();
          ctx.fillStyle = fontColor;
          ctx.fillText(msgTxt, x + textWidth / 2 + 1, y - 1);
        } else {
          textWidth = ctx.measureText(confTxt).width;
          ctx.strokeStyle = row.color;
          ctx.fillStyle = row.color;
          ctx.fillRect(
            x - ctx.lineWidth / 2,
            y - textHeight - ctx.lineWidth,
            textWidth + 2,
            textHeight + 1
          );
          ctx.stroke();
          ctx.fillStyle = fontColor;
          ctx.fillText(confTxt, x + textWidth / 2 + 1, y - 1);
        }
      }

    });
  };

  return (
    <>
      < Webcam
        ref={webcamRef}
        muted={true}
        style={{ position: 'absolute', inset: 0, zIndex: 10, textAlign: 'center' }
        }
        className="absolute mx-auto left-0 right-0 text-center z-10"
        videoConstraints={{
          facingMode: 'environment'
        }}
      />
      <canvas ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 20, textAlign: 'center' }}

        className="absolute mx-auto left-0 right-0 text-center z-20" />

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!RoboModel}
        onClick={() => {

        }}
      >
        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} gap={'20px'}>

          <CircularProgress />
          <Typography color="white">Modal loading</Typography>
        </Box>
      </Backdrop>

    </>
  );
};

export default Roboflow;