import React from 'react';
import './button.css'; // Import your CSS file if needed

const Button = ({ icon, text, onClick, color }) => {
  const buttonStyle = {
    backgroundColor: color || '#FFCA64', // Set default if no color prop is provided
  };

  return (
    <div className="button-main" onClick={onClick} style={buttonStyle}>
      <div className="button-icon">
        <img src={icon} alt="img-1" className="button-icon-img-1" />
        <img src={icon} alt="img-2" className="button-icon-img-2" />
        <img src={icon} alt="img-3" className="button-icon-img-3" />
        <img src={icon} alt="img-4" className="button-icon-img-4" />
        <img src={icon} alt="img-5" className="button-icon-img-5" />
      </div>
      <div className="button-text">
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Button;
