import React from 'react'
import './keyselect.css';
import Header from '../../assets/1outof3.svg'
import Button from '../../components/button/Button';
import Mortice from '../../assets/button-mortice.svg';
import Cylinderical from '../../assets/button-cylinderical.svg';
import Key from '../../assets/textbg-key.svg';
import { Link } from 'react-router-dom';


const Keyselect = () => {
  return (
    <div className='select-main'>
        <div className='select-img'>
            <img src={Header} alt='top-icon'/>
        </div>
        
        <div className='select-text'>
            <img className='select-text-img' src={Key} alt='key' />
            <h2>Welcome To</h2>
            <h1>Keys Project</h1>
        </div>

        <div className='select-buttons'>
            <p>Select Keys</p>
            <Link to='/keymodelmortice' className='linking'><Button icon={Mortice} text="Mortice Key" onClick={()=>{}}/></Link>
            <Link to='/keymodel' className='linking'><Button icon={Cylinderical} text="Cylinderical Key" onClick={()=>{}}/></Link>
        </div>


    </div>
  )
}

export default Keyselect