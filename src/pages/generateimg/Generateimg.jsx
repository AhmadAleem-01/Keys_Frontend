import React from 'react'
import './generateimg.css';
import { Link } from 'react-router-dom';
import Header from '../../assets/3outof3.svg'
import Back from '../../assets/back-arrow.svg'
import Check from '../../assets/check.svg'
import Button from '../../components/button/Button';
import Photo from '../../assets/photo.svg';


const Generateimg = () => {
  return (
    <div className='upload-main'>
      <div className='upload-img'>
          <Link to='/upimg2'><img className='back' src={Back} alt='top-icon'/></Link>
          <img src={Header} alt='top-icon'/>
      </div>
      <div className='genimg-boxtext'>
        <h2>Results</h2>
      </div>
      <div className='genimg-box'>
          
          <div className='upload-box2-icon'>
              <img src={Check} alt='show'/>
          </div>
      </div>

      <div className='genimg-slider'>
        <p>Adjust head</p>
        <input type="range" min="1" max="100" className="slider" id="myRange" />
        <div className='slider-val'>
          <div><p>0</p></div>
          <div><p>100</p></div>
        </div>
      </div>

      <div className='genimg-dist'>
        <div><p>Distance from Shoulder</p></div>
        <div><h2>150mm</h2></div>
      </div>

      <div className='genimg-bite'>
        <p>Depth of each biting point</p>
        <div className='genimg-bite-row'>
          <div className='genimg-bite-box'>
            <p>7</p>
          </div>
          <div className='genimg-bite-box'>
            <p>5</p>
          </div>
          <div className='genimg-bite-box'>
            <p>4</p>
          </div>
          <div className='genimg-bite-box'>
            <p>2</p>
          </div>
          <div className='genimg-bite-box'>
            <p>3</p>
          </div>
          <div className='genimg-bite-box'>
            <p>1</p>
          </div>
          <div className='genimg-bite-box'>
            <p>8</p>
          </div>
        </div>
      </div>

      <Link to='/upimg2'><Button icon={Photo} text="Retake Photo" onClick={()=>{}} /></Link>



    </div>
  )
}

export default Generateimg