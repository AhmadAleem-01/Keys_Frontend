import React from 'react'
import './uploadimg2.css'
import { Link } from 'react-router-dom';
import Header from '../../assets/2outof3.svg'
import Back from '../../assets/back-arrow.svg'
import ImgDisplay from '../../assets/displayimg.svg'
import Button from '../../components/button/Button';
import Photo from '../../assets/photo.svg';
import Proceed from '../../assets/proceed.svg';


const Uploadimg2 = () => {
  return (
    <div className='upload-main'>
        <div className='upload-img'>
          <Link to='/upimg'><img className='back' src={Back} alt='top-icon'/></Link>
          <img src={Header} alt='top-icon'/>
        </div>

        <div className='upload-box2'>
            <div className='upload-box2-icon'>
                <img src={ImgDisplay} alt='show'/>
            </div>
        </div>

        <div className='select-buttons2'>
            <p>Is this fine?</p>
            <Link to='/upimg' className='linking'><Button icon={Photo} text="Retake Photo" onClick={()=>{}} /></Link>
            <Link to='/genimg' className='linking'><Button icon={Proceed} text="Proceed" onClick={()=>{}} color='#FFFFFF'/></Link>
        </div>
    </div>
  )
}

export default Uploadimg2