import React from "react";
import "./uploadimg.css";
import Header from "../../assets/2outof3.svg";
import Back from "../../assets/back-arrow.svg";
import Button from "../../components/button/Button";
import Tips from "../../assets/tips.svg";
import Photo from "../../assets/photo.svg";
import Upload from "../../assets/upload.svg";
import { Link } from "react-router-dom";

const Uploadimg = () => {
  const hash = window.location.hash;
  return (
    <div className="upload-main">
      <div className="upload-img">
        <Link to="/">
          <img className="back" src={Back} alt="top-icon" />
        </Link>
        <img src={Header} alt="top-icon" />
      </div>

      <div className="upload-tips-box">
        <div>
          <img className="tips-icon" src={Tips} alt="tip triangle" />
        </div>
        <ul className="upload-tips-text">
          <li>Please ensure good lighting</li>
          <li>Try and ensure a solid colored background</li>
          <li>Key should be the only object in the image!</li>
        </ul>
      </div>

      <Link to={`/upimg2${hash}`} className="linking">
        <Button icon={Photo} text="Take Photo" onClick={() => {}} />
      </Link>
      <Link to={`/upimg3${hash}`} className="linking">
        <Button icon={Upload} text="Upload Photo" onClick={() => {}} />
      </Link>
    </div>
  );
};

export default Uploadimg;
