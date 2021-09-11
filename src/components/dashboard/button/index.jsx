import react from "react";
import '../index.css';

const Button = (props) => {
  return (
    <div className="button" onClick={props.onClick}>
      <p style={{color: 'white'}}>{props.name}</p>
    </div>
  );
}

export default Button;