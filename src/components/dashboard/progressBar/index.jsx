import react from "react";
import '../index.css';

const ProgressBar = (props) => {
  return (
    <>
      <div className="container-progress-bar">
        <div className="proggres-bar" 
          style={{width: props.currentProgress <= 10 ? '10%' : `${props.currentProgress}%`}}>
          <p>{props.value}</p>
        </div>
      </div>
    </>
  );
}

export default ProgressBar;