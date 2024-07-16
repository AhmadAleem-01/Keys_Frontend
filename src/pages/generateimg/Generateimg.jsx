import React from 'react'
import './generateimg.css';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../assets/3outof3.svg'
import Back from '../../assets/back-arrow.svg'
import Check from '../../assets/check.svg'
import Button from '../../components/button/Button';
import Photo from '../../assets/photo.svg';


const Generateimg = () => {
  // split the url by the hash
  const location = useLocation();
  let data = location.hash.substring(1);
  const decoding = data.split('-#')[1];
  data = data.split('-#')[0];
  console.log(decoding, data)
  // make decoding an array
  const decodingArray = decoding.split(',');
  console.log(decodingArray)
  return (
    <div className='upload-main'>
      <div className='upload-img'>
        <Link to={`/upimg#${data}`}><img className='back' src={Back} alt='top-icon'/></Link>
        <img src={Header} alt='top-icon'/>
      </div>

      <div className='genimg-bite'>
        <p>Depth of each biting point</p>
        <br></br>
        <div className='genimg-bite-row'>
          {decodingArray.map((bite, index) => (
            <div className='genimg-bite-box' key={index}>
              <p>{bite}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='genimg-buttons'>
        <Link to={`/upimg#${data}`} className='linking'><Button icon={Photo} text="Retake Photo" onClick={()=>{}} /></Link>
      </div>
    </div>
  )
}

export default Generateimg