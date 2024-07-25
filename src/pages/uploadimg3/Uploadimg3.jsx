import React, { useState, useEffect, useRef, useCallback } from 'react';
import './uploadimg3.css';
import { Link } from 'react-router-dom';
import Header from '../../assets/2outof3.svg';
import Back from '../../assets/back-arrow.svg';
import ImgDisplay from '../../assets/displayimg.svg';
import Button from '../../components/button/Button';
import Photo from '../../assets/photo.svg';
import Proceed from '../../assets/proceed.svg';
import axios from 'axios';

const Uploadimg3 = () => {
  const [keyData, setKeyData] = useState(null);
  const [shoulderDistance, setShoulderDistance] = useState([]);
  const [detectedEdges, setDetectedEdges] = useState([]);
  const [decoding, setDecoding] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragOffset, setStartDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const hash = window.location.hash;
  const data = hash.substring(1);

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

  const drawLines = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const imageElement = document.getElementById('uploaded-image');
  
    if (!context || !imageElement) {
      return;
    }
  
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw image on canvas
    context.drawImage(
      imageElement,
      imagePosition.x,
      imagePosition.y,
      imageElement.width * scale,
      imageElement.height * scale
    );
  
    const dpi = window.devicePixelRatio * 140;
    const lineGap = keyData?.widthUnCutKeys * dpi;
    const halfCanvasWidth = canvas.width / 2;
    const redLineGap = lineGap / 2;
  
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
  
    // Draw green lines horizontally from the red lines
    context.beginPath();
    context.strokeStyle = 'green';
    context.lineWidth = 2;
  
    context.moveTo(x1, canvas.height * 0.1);
    context.lineTo(x1 - 20, canvas.height * 0.1); // Green line to the left of the first red line
    context.moveTo(x2, canvas.height * 0.1);
    context.lineTo(x2 + 20, canvas.height * 0.1); // Green line to the right of the second red line
  
    context.stroke();
  
    if (keyData) {
      let depths;
      if (keyData.hasVariant) {
        depths = keyData.Depth.map(d => d.split(',').map(d => parseInt(d, 10) * dpi / 1000)).flat();
        depths = depths.filter((value, index) => depths.indexOf(value) === index);
      } else {
        depths = keyData.Depth.split(',').map(d => parseInt(d, 10) * dpi / 1000);
      }
      const shoulders = shoulderDistance.map(d => parseInt(d, 10) * dpi / 1000);
  
      context.strokeStyle = 'rgba(0, 255, 0, 0.4)'; // Changed to green
      context.lineWidth = 1;
  
      depths.forEach(depth => {
        const x = x1 + depth;
        context.moveTo(x, canvas.height * 0.1);
        context.lineTo(x, canvas.height * 0.9);
      });
  
      shoulders.forEach(shoulder => {
        const y = shoulder + (canvas.height * 0.1);
        context.moveTo(0, y);
        context.lineTo(canvas.width * 0.8, y);
      });
  
      context.stroke();
  
      // Analyze intersections for biting points
      const markedLines = new Set();
      const newDetectedEdges = [];
  
      context.strokeStyle = 'yellow';
      context.lineWidth = 2;
  
      shoulders.forEach(shoulder => {
        let rightmostDepth = -Infinity;
        let rightmostDecoding = null;
  
        depths.forEach(depth => {
          const x = x1 + depth;
          const y = shoulder + (canvas.height * 0.1);
  
          const pixelData = context.getImageData(x, y, 1, 1).data;
          const intensity = (pixelData[0] + pixelData[1] + pixelData[2]) / 3;
  
          if (intensity > 75 && depth > rightmostDepth) {
            rightmostDepth = depth;
            if (!keyData.hasVariant) {
              const index = depths.indexOf(depth);
              rightmostDecoding = keyData.Decoding.split(',')[index];
            } else {
              const tempArray = keyData.Decoding.map(d => d.split(',')).flat();
              const decodings = tempArray.filter((value, index) => tempArray.indexOf(value) === index);
              const index = depths.indexOf(depth);
              rightmostDecoding = decodings[index];
            }
          }
        });
  
        if (rightmostDepth !== -Infinity) {
          const x = x1 + rightmostDepth;
          const y = shoulder + (canvas.height * 0.1);
  
          context.beginPath();
          context.moveTo(x, y - 5); // Small vertical line
          context.lineTo(x, y + 5);
          context.strokeStyle = 'yellow';
          context.lineWidth = 2;
          context.stroke();
  
          markedLines.add(shoulder);
          newDetectedEdges.push({ edge: y, decoding: rightmostDecoding });
        }
      });
  
      setDetectedEdges(newDetectedEdges);
    }
  }, [shoulderDistance, keyData, imagePosition, scale]);
  
  useEffect(() => {
    const animate = () => {
      drawLines();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [drawLines]);

  useEffect(() => {
    // extract the decodings from the detected edges
    const decoding = detectedEdges.map(edge => edge.decoding);
    setDecoding(decoding);
  }, [detectedEdges]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const canvasWidth = canvasRef.current.parentElement.clientWidth;
        const canvasHeight = canvasRef.current.parentElement.clientHeight;
        const initialScale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
        setScale(initialScale);
        setImagePosition({
          x: (canvasWidth - img.width * initialScale) / 2,
          y: (canvasHeight - img.height * initialScale) / 2,
        });
        setImage(e.target.result);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    setIsDragging(true);
    setStartDragOffset({
      x: event.clientX - imagePosition.x,
      y: event.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (event) => {
    event.preventDefault();
    if (isDragging) {
      setImagePosition({
        x: event.clientX - startDragOffset.x,
        y: event.clientY - startDragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (event) => {
    event.preventDefault();
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        (touch1.clientX - touch2.clientX) ** 2 + (touch1.clientY - touch2.clientY) ** 2
      );
      setLastTouchDistance(distance);
    } else if (event.touches.length === 1) {
      const touch = event.touches[0];
      setIsDragging(true);
      setStartDragOffset({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y,
      });
    }
  };

  const handleTouchMove = (event) => {
    event.preventDefault();
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        (touch1.clientX - touch2.clientX) ** 2 + (touch1.clientY - touch2.clientY) ** 2
      );
      if (lastTouchDistance) {
        const scaleAmount = (distance - lastTouchDistance) * 0.01;
        setScale((prevScale) => Math.min(Math.max(prevScale + scaleAmount, 0.1), 10)); // Adjusted scale limits
      }
      setLastTouchDistance(distance);
    } else if (event.touches.length === 1 && isDragging) {
      const touch = event.touches[0];
      setImagePosition({
        x: touch.clientX - startDragOffset.x,
        y: touch.clientY - startDragOffset.y,
      });
    }
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setLastTouchDistance(null);
  };

const handleWheel = (event) => {
    event.preventDefault();
    const zoomSpeed = 0.00002;
    const newScale = Math.max(scale - event.deltaY * zoomSpeed, 0.1);
    setScale(newScale);
};

  return (
    <div className='upload-main'>
      <div className='upload-img'>
        <Link to={`/upimg#${data}`}><img className='back' src={Back} alt='top-icon' /></Link>
        <img src={Header} alt='top-icon' />
      </div>

      <div className='upload-box2'>
        <div className='upload-box2-icon'>
          {/* <img src={ImgDisplay} alt='show'/> */}
        </div>
        <div
          className='canvas-container'
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {image && (
            <img
              id="uploaded-image"
              src={image}
              alt="Uploaded"
              className='uploaded-image'
              style={{
                left: imagePosition.x,
                top: imagePosition.y,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: 'center',
                display: 'none'
              }}
            />
          )}
          <canvas ref={canvasRef} className='video-canvas' width="280px" height="400px" />
        </div>
      </div>

      <div className='select-buttons2'>
        {/* <input type="file" accept="image/*" onChange={handleImageUpload} /> */}

        <input 
          type="file" 
          accept="image/*" 
          id="fileInput" 
          style={{ display: 'none' }} 
          onChange={handleImageUpload} 
        />

        <Button 
          icon={Photo} 
          text="Upload Photo" 
          onClick={() => document.getElementById('fileInput').click()} 
        />

        <Link to={`/genimg#${data}-#${decoding}`} className='linking'><Button icon={Proceed} text="Proceed" onClick={() => { }} color='#FFFFFF' /></Link>
      </div>

      <div className='detected-edges'>

          <p>
            Decodings:
            {detectedEdges?.map((edge, index) => (
              <span key={index}> {edge.decoding} </span>
            ))}
          </p>

      </div>
    </div>
  );
}

export default Uploadimg3;
