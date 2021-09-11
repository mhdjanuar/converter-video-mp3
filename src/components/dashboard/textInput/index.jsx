import react from "react";
import '../index.css';

const TextInput = (props) => {
  return (
    <>
      <div className="container-text-input">
        <input 
              type="text" 
              autoFocus
              style={props.style}
              onChange={props.onChange}
              value={props.value}
              className="text-input"
          />

          {props.children}
      </div>
    </>
  );
}

export default TextInput;