import React, { useState, useEffect, useRef } from 'react';
import './uploadimg2.css';
import { Link } from 'react-router-dom';
import Header from '../../assets/2outof3.svg';
import Back from '../../assets/back-arrow.svg';
import ImgDisplay from '../../assets/displayimg.svg';
import Button from '../../components/button/Button';
import Photo from '../../assets/photo.svg';
import Proceed from '../../assets/proceed.svg';
import axios from 'axios';

const Uploadimg2 = () => {
  const [keyData, setKeyData] = useState(null);
  const [shoulderDistance, setShoulderDistance] = useState([]);
  const [detectedEdges, setDetectedEdges] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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
    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        })
        .catch(err => {
          console.error("Error accessing the camera", err);
        });
    };
    startVideo();
  }, []);

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
        const newShoulderDistances = keyData.Shoulder_Distance.map(variant => updateShoulderDistance(variant));
        setShoulderDistance(newShoulderDistances);
      } else {
        const newShoulderDistance = updateShoulderDistance(keyData.Shoulder_Distance);
        setShoulderDistance(newShoulderDistance);
      }
    }
  }, [keyData]);

  useEffect(() => {
    const drawLines = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame on canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

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

      if (keyData) {
        const depths = keyData.Depth.split(',').map(d => parseInt(d, 10) * dpi / 1000);
        const shoulders = shoulderDistance.map(d => parseInt(d, 10) * dpi / 1000);

        context.strokeStyle = 'rgba(0, 0, 255, 0.5)';
        context.lineWidth = 1;

        depths.forEach(depth => {
          const x = x1 + depth;
          context.moveTo(x, canvas.height * 0.1);
          context.lineTo(x, canvas.height * 0.9);
        });

        shoulders.forEach(shoulder => {
          const y = shoulder + (canvas.height * 0.1);
          context.moveTo(0, y);
          context.lineTo(canvas.width * .8, y);
        });

        context.stroke();

        // Analyze intersections for biting points
        const markedLines = new Set();
        const newDetectedEdges = [];

        context.strokeStyle = 'yellow';
        context.lineWidth = 2;

        shoulders.forEach(shoulder => {
          if (!markedLines.has(shoulder)) {
            for (let depth of depths) {
              const x = x1 + depth;
              const y = shoulder + (canvas.height * 0.1);

              const pixelData = context.getImageData(x, y, 1, 1).data;
              const intensity = (pixelData[0] + pixelData[1] + pixelData[2]) / 3;

              if (intensity < 100) {
                context.beginPath();
                context.moveTo(x, y - 5); // Small vertical line
                context.lineTo(x, y + 5);
                context.strokeStyle = 'yellow';
                context.lineWidth = 2;
                context.stroke();

                markedLines.add(shoulder);

                const index = depths.indexOf(depth);
                newDetectedEdges.push({ edge: y, decoding: keyData.Decoding.split(',')[index] });

                break;
              }
            }
          }
        });

        setDetectedEdges(newDetectedEdges);
      }
    };

    const interval = setInterval(drawLines, 100); // Draw lines repeatedly

    return () => clearInterval(interval);
  }, [shoulderDistance, keyData]);

  console.log(shoulderDistance);

  return (
    <div className='upload-main'>
      <div className='upload-img'>
        <Link to={`/upimg#${data}`}><img className='back' src={Back} alt='top-icon'/></Link>
        <img src={Header} alt='top-icon'/>
      </div>

      <div className='upload-box2'>
        <div className='upload-box2-icon'>
          {/* <img src={ImgDisplay} alt='show'/> */}
        </div>
        <video ref={videoRef} className='video-feed' />
        <canvas ref={canvasRef} className='video-canvas' />
      </div>

      <div className='select-buttons2'>
        <p>Is this fine?</p>
        <Link to={`/upimg#${data}`} className='linking'><Button icon={Photo} text="Retake Photo" onClick={() => {}} /></Link>
        <Link to='/genimg' className='linking'><Button icon={Proceed} text="Proceed" onClick={() => {}} color='#FFFFFF' /></Link>
      </div>

      <div className='detected-edges'>
        {detectedEdges.length > 0 && (
          <p>
            Detected Edges and Decodings:
            {detectedEdges.map((edge, index) => (
              <span key={index}> Edge: {edge.edge}, Decoding: {edge.decoding} </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

export default Uploadimg2;
