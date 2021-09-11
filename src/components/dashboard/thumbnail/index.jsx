import react from "react";
import '../index.css';

const Thumbnail = (props) => {
  return (
    <>
      <div className="container-thumbnail">
        <img className="thumbnail-image" src={props.src} />
        <div style={{paddingLeft: '20px'}}>
          {props.children}
        </div>
      </div>
    </>
  );
}

export default Thumbnail;