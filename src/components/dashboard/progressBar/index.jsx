import react from "react";
import '../index.css';

const ProgressBar = (props) => {
  return (
    <>
      <div className="container-progress-bar">
        <div style={{width: `${props.currentProgress}`, height: 20, backgroundColor: 'orange'}} />
      </div>
    </>
  );
}

export default ProgressBar;