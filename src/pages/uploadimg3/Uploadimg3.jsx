import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import './uploadimg3.css';
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
  const inputFileRef = useRef(null);
  const canvasRef = useRef(null);
  const guidanceCanvasRef = useRef(null);
  const hash = window.location.hash;
  const data = hash.substring(1);

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

  useEffect(() => {
    const drawGuidanceLines = () => {
      const canvas = guidanceCanvasRef.current;
      const context = canvas.getContext('2d');
      const dpi = window.devicePixelRatio * 140;
      const lineGap = keyData?.widthUnCutKeys * dpi;
      const halfCanvasWidth = canvas.width / 2;
      const redLineGap = lineGap / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);

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

      context.beginPath();
      context.strokeStyle = 'green';
      context.lineWidth = 2;

      context.moveTo(x1, canvas.height * 0.1);
      context.lineTo(x1 - 20, canvas.height * 0.1);
      context.moveTo(x2, canvas.height * 0.1);
      context.lineTo(x2 + 20, canvas.height * 0.1);

      context.stroke();
    };

    const drawLines = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const image = new Image();

      if (selectedImage) {
        image.src = selectedImage;
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          drawKeyLines(context, canvas);
        };
      }
    };

    const drawKeyLines = (context, canvas) => {
      if (keyData) {
        const dpi = window.devicePixelRatio * 140;
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
          const x = (canvas.width / 2) + depth;
          context.moveTo(x, canvas.height * 0.1);
          context.lineTo(x, canvas.height * 0.9);
        });

        shoulders.forEach(shoulder => {
          const y = shoulder + (canvas.height * 0.1);
          context.moveTo(0, y);
          context.lineTo(canvas.width * 0.8, y);
        });

        context.stroke();

        const markedLines = new Set();
        const newDetectedEdges = [];

        context.strokeStyle = 'yellow';
        context.lineWidth = 2;

        shoulders.forEach(shoulder => {
          if (!markedLines.has(shoulder)) {
            for (let depth of depths) {
              const x = (canvas.width / 2) + depth;
              const y = shoulder + (canvas.height * 0.1);

              const pixelData = context.getImageData(x, y, 1, 1).data;
              const intensity = (pixelData[0] + pixelData[1] + pixelData[2]) / 3;

              if (intensity < 100) {
                context.beginPath();
                context.moveTo(x, y - 5);
                context.lineTo(x, y + 5);
                context.strokeStyle = 'yellow';
                context.lineWidth = 2;
                context.stroke();

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

        setDetectedEdges(newDetectedEdges);
      }
    };

    if (selectedImage && keyData) {
      drawGuidanceLines();
      const interval = setInterval(drawLines, 100);
      return () => clearInterval(interval);
    }
  }, [selectedImage, shoulderDistance, keyData]);

  return (
    <div className='upload-main'>
      <div className='upload-img'>
        <Link to={`/upimg`}><img className='back' src={Back} alt='back-icon' /></Link>
        <img src={Header} alt='header-icon' />
      </div>

      <div className='upload-box2'>
        <div className='upload-box2-icon'>
          <img src={ImgDisplay} alt='display-icon' />
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputFileRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button onClick={() => inputFileRef.current.click()}>Upload Image</button>
        {selectedImage && (
          <div className="canvas-container">
            <TransformWrapper>
              <TransformComponent>
                <img src={selectedImage} alt="uploaded" className='uploaded-image' />
                <canvas ref={canvasRef} className='image-canvas' />
              </TransformComponent>
            </TransformWrapper>
            <canvas ref={guidanceCanvasRef} className='guidance-canvas' />
          </div>
        )}
      </div>

      <div className='select-buttons2'>
        <p>Is this fine?</p>
        <Link to={`/upimg`} className='linking'>
          <Button icon={Photo} text="Retake Photo" onClick={() => { }} />
        </Link>
        <Link to={`/genimg#${data}`} className='linking'>
          <Button icon={Proceed} text="Proceed" onClick={() => { }} color='#FFFFFF' />
        </Link>
      </div>

      <div className='detected-edges'>
        {detectedEdges.length > 0 && (
          <p>
            Decodings:
            {detectedEdges.map((edge, index) => (
              <span key={index}> {edge.decoding} </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

export default Uploadimg3;
