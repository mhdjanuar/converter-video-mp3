import react from "react";
import '../index.css';

const Button = (props) => {
  return (
    <div style={props.style} className="button" onClick={props.onClick}>
      <p style={{color: 'white'}}>{props.name}</p>
    </div>
  );
}

export default Button;