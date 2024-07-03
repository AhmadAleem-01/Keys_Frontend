import React from 'react'
import { KeySelect, GenerateImg, UploadImg, UploadImg2, KeyModel } from './pages';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import Key from './assets/key-bg.svg';


const App = () => {
  return (
    <div className='app'>
      
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<KeySelect />} />
          <Route path='/genimg' element={<GenerateImg />} />
          <Route path='/upimg' element={<UploadImg />} />
          <Route path='/upimg2' element={<UploadImg2 />} />
          <Route path='/keymodel' element={<KeyModel />} />
        </Routes>
      </BrowserRouter>
      <img src={Key} className='key-img' alt="key" />
    </div>
  )
}

export default App