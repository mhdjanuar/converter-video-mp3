import react from "react";
import '../index.css';

const Thumbnail = (props) => {
  return (
    <>
      <div className="container-thumbnail">
        <img style={{width: '200px', height: '130px'}} src={props.src} />
        {props.children}
      </div>
    </>
  );
}

export default Thumbnail;