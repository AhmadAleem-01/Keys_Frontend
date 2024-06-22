import React from 'react'
import { KeySelect, GenerateImg, UploadImg, UploadImg2 } from './pages';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import './app.css'

const App = () => {
  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<KeySelect />} />
          <Route path='/genimg' element={<GenerateImg />} />
          <Route path='/upimg' element={<UploadImg />} />
          <Route path='/upimg2' element={<UploadImg2 />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App