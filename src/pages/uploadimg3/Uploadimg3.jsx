import React, { useState, useEffect, useRef } from 'react';
import './uploadimg3.css';
import { Link } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Header from '../../assets/2outof3.svg';
import Back from '../../assets/back-arrow.svg';
import ImgDisplay from '../../assets/displayimg.svg';
import Button from '../../components/button/Button';
import Photo from '../../assets/photo.svg';
import Proceed from '../../assets/proceed.svg';
import axios from 'axios';

const Uploadimg3 = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [keyData, setKeyData] = useState(null);
  const [shoulderDistance, setShoulderDistance] = useState([]);
  const [detectedEdges, setDetectedEdges] = useState([]);
  const [decoding, setDecoding] = useState([]);
  const inputFileRef = useRef(null);
  const guidanceCanvasRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const hash = window.location.hash;
  const data = hash.substring(1);
  const [originalDecoding, setOriginalDecoding] = useState([])

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`https://keys-backend.vercel.app/getKeys/${data}`);
      console.log(response.data);
      setKeyData(response.data);
    };
    fetchData();
  }, [data]);

  useEffect(() => {
    if (keyData) {
      const updateShoulderDistance = (shoulderDist) => {
        return shoulderDist.split(',').reduce((acc, val) => {
          const updatedValue = acc.length > 0 ? acc[acc.length - 1] + parseInt(val, 10) : parseInt(val, 10);
          acc.push(updatedValue);
          return acc;
        }, []);
      };

      if (keyData.hasVariant) {
        const newShoulderDistance = updateShoulderDistance(keyData.Shoulder_Distance[0]);
        setShoulderDistance(newShoulderDistance);
      } else {
        const newShoulderDistance = updateShoulderDistance(keyData.Shoulder_Distance);
        setShoulderDistance(newShoulderDistance);
      }
    }
  }, [keyData]);

  const drawGuidanceLines = () => {
    const canvas = guidanceCanvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const dpi = window.devicePixelRatio * 140;
    const lineGap = keyData?.widthUnCutKeys * dpi;
    const halfCanvasWidth = canvas.width / 2;
    const redLineGap = lineGap / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw red lines
    context.beginPath();
    context.strokeStyle = 'red';
    context.lineWidth = 2;

    const x1 = halfCanvasWidth - redLineGap;
    const x2 = halfCanvasWidth + redLineGap;

    context.moveTo(x1, canvas.height * 0.1);
    context.lineTo(x1, canvas.height * 0.9);
    context.moveTo(x2, canvas.height * 0.1);
    context.lineTo(x2, canvas.height * 0.9);

    context.stroke();

    // Draw green lines 
    context.beginPath();
    context.strokeStyle = 'green';
    context.lineWidth = 2;

    context.moveTo(x1, canvas.height * 0.1);
    context.lineTo(x1 - 20, canvas.height * 0.1);
    context.moveTo(x2, canvas.height * 0.1);
    context.lineTo(x2 + 20, canvas.height * 0.1);

    context.stroke();

    // Draw blue lines based on key data
    if (keyData) {
      let depths;
      if (keyData.hasVariant) {
        depths = keyData.Depth.map(d => d.split(',').map(d => parseInt(d, 10) * dpi / 1000)).flat();
        depths = depths.filter((value, index) => depths.indexOf(value) === index);
      } else {
        depths = keyData.Depth.split(',').map(d => parseInt(d, 10) * dpi / 1000);
      }

      const shoulders = shoulderDistance.map(d => parseInt(d, 10) * dpi / 1000);

      context.strokeStyle = 'rgba(0, 0, 255, 0.5)';
      context.lineWidth = 1;

      depths.forEach(depth => {
        const x = halfCanvasWidth - redLineGap + depth;
        context.moveTo(x, canvas.height * 0.1);
        context.lineTo(x, canvas.height * 0.9);
      });

      shoulders.forEach(shoulder => {
        const y = shoulder + (canvas.height * 0.1);
        context.moveTo(0, y);
        context.lineTo(canvas.width * 0.8, y);
      });

      context.stroke();
    }
  };

  const drawImageCanvas = () => {
    const imageCanvas = imageCanvasRef?.current;
    const guidanceCanvas = guidanceCanvasRef?.current;
    const imageContext = imageCanvas?.getContext('2d');

    if (!selectedImage || !imageCanvas || !guidanceCanvas || !imageContext) {
      return;
    }

    const image = new Image();
    image.src = selectedImage;

    image.onload = () => {
      imageCanvas.width = image.width;
      imageCanvas.height = image.height;
      imageContext.drawImage(image, 0, 0);

      const dpi = window.devicePixelRatio * 140;
      const lineGap = keyData?.widthUnCutKeys * dpi;
      const halfCanvasWidth = guidanceCanvas.width / 2;
      const redLineGap = lineGap / 2;

      if (keyData) {
        let depths;
        if (keyData.hasVariant) {
          depths = keyData.Depth.map(d => d.split(',').map(d => parseInt(d, 10) * dpi / 1000)).flat();
          depths = depths.filter((value, index) => depths.indexOf(value) === index);
        } else {
          depths = keyData.Depth.split(',').map(d => parseInt(d, 10) * dpi / 1000);
        }
        
        const shoulders = shoulderDistance.map(d => parseInt(d, 10) * dpi / 1000);

        const markedLines = new Set();
        const newDetectedEdges = [];

        const guidanceContext = guidanceCanvas?.getContext('2d');
        guidanceContext.clearRect(0, 0, guidanceCanvas.width, guidanceCanvas.height);
        drawGuidanceLines();

        shoulders.forEach(shoulder => {
          if (!markedLines.has(shoulder)) {
            for (let depth of depths) {
              const x = halfCanvasWidth - redLineGap + depth;
              const y = shoulder + (guidanceCanvas.height * 0.1);

              const pixelData = imageContext.getImageData(x, y, 1, 1).data;
              const intensity = (pixelData[0] + pixelData[1] + pixelData[2]) / 3;

              if (intensity < 100) {
                guidanceContext.beginPath();
                guidanceContext.moveTo(x, y - 5); // Small vertical line
                guidanceContext.lineTo(x, y + 5);
                guidanceContext.strokeStyle = 'yellow';
                guidanceContext.lineWidth = 2;
                guidanceContext.stroke();

                markedLines.add(shoulder);

                if (!keyData.hasVariant) {
                  const index = depths.indexOf(depth);
                  newDetectedEdges.push({ edge: y, decoding: keyData.Decoding.split(',')[index] });
                  break;
                } else {
                  const tempArray = keyData.Decoding.map(d => d.split(',')).flat();
                  const decodings = tempArray.filter((value, index) => tempArray.indexOf(value) === index);
                  const index = depths.indexOf(depth);
                  newDetectedEdges.push({ edge: y, decoding: decodings[index] });
                  break;
                }
              }
            }
          }
        });
        console.log(newDetectedEdges, "newDetectedEdges");
        setDetectedEdges(newDetectedEdges);
      }
    };
  };

  useEffect(() => {
    drawGuidanceLines();
  }, [keyData, shoulderDistance]);
  

  useEffect(() => {
    if (selectedImage) {
      drawImageCanvas();
    }
  }, [selectedImage, keyData, shoulderDistance]);

  useEffect(() => {
    const decodingData = detectedEdges.map(edge => edge.decoding);
    setDecoding(decodingData);
  }, [detectedEdges]);

  const handleDecoding = () => {
    if (selectedImage === null) {
      alert("Please upload an image first");
      return;
    }
    // check if keyData.Decoding is an array
    if (keyData.Decoding instanceof Array) {
      console.log("here")
      setOriginalDecoding(null)
      alert("Unsupported variant, please capture a live photo");
      return
    }

    const originalDecoding = keyData?.Decoding;
    console.log(originalDecoding, "originalDecoding");
    setOriginalDecoding(originalDecoding);
    // the orginal decoding will be like such 1,2,3,4,5 I want to display this on a alert box
    alert(`Decoding: ${originalDecoding}`);
  }
  return (
    <div className='upload-main'>
      <div className='upload-img'>
        <Link to={`/upimg#${data}`}><img className='back' src={Back} alt='back-icon' /></Link>
        <img src={Header} alt='header-icon' />
      </div>

      <div className='upload-box2'>
        <div className='upload-box2-icon'>
          <img src={ImgDisplay} alt='display-icon' />
        </div>
        
        {selectedImage && (
          <div className="canvas-container">
            <canvas ref={guidanceCanvasRef} className='guidance-canvas fixed-canvas' />
            <TransformWrapper>
              <TransformComponent>
                <img src={selectedImage} alt="uploaded" className='uploaded-image' />
                <canvas ref={imageCanvasRef} className='image-canvas' />
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}
      </div>

      <div className='select-buttons2'>
      <input
          type="file"
          accept="image/*"
          ref={inputFileRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button onClick={() => inputFileRef.current.click()}>Upload Image</button>
        <p>Is this fine?</p>
        <Link to={`/upimg#${data}`} className='linking'>
          <Button icon={Photo} text="Retake Photo" onClick={() => { }} />
        </Link>
        {/* <Link to={`/upimg3#${data}`} className='linking'> */}
          <Button icon={Proceed} text="Proceed" onClick={handleDecoding} />
        {/* </Link> */}
      </div>
    </div>
  );
};

export default Uploadimg3;