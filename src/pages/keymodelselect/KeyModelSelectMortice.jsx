import React,{useState, useEffect} from "react";
import "./keyModelSelect.css";
import Header from "../../assets/1outof3.svg";
import Back from "../../assets/back-arrow.svg";
import { Link } from "react-router-dom";
import Search from '../../assets/search.svg';
import ImgDisplay from '../../assets/displayimg.svg'
import axios from 'axios';


const KeyModelSelectMortice = () => {
    const [input,setInput] = useState("");
    const [variants, setVariants] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        const response = await axios.get('https://keys-backend.vercel.app/mortice/getReferenceNumber');
        const results = response.data.filter((variant) => {
          if (!input) {
            return true; // show all data if input is empty
          }
          return variant && variant.Reference_Number && variant.Reference_Number.toLowerCase().includes(input.toLowerCase());
        });
        setVariants(results);
      }
      fetchData();
    },[input]);

    const handleChange = (value) => {
        setInput(value);
        // fetchData(value);
    }
  return (
    <div className="select-main">
      <div className="select-img">
        <Link to="/">
          <img className="back" src={Back} alt="top-icon" />
        </Link>
        <img src={Header} alt="top-icon" />
      </div>

      <div className="model-dropdown">
        <div className='upload-box2-icon'>
            <img src={ImgDisplay} alt='show'/>
        </div>

        <div className="model-dropdown-input">
            <img src={Search} alt="search-icon" />
            <input placeholder="Enter Variant" className="search-var" value={input} onChange={(e) => handleChange(e.target.value)}/>
        </div>
        <div className="model-dropdown-items">
            {
                variants.map((variant) => {
                    return <Link to={`/upimg#${variant.Reference_Number}`} className='linking'>
                            <div className="model-dropdown-item" onClick={() => {}}>
                                <p>{variant.Reference_Number}</p>
                            </div>
                        </Link>;
                })
            }
            
        </div>
      </div>
    </div>
  );
};

export default KeyModelSelectMortice;