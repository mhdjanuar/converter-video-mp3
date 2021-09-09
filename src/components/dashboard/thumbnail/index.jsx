import react from "react";
import '../index.css';

const Thumbnail = (props) => {
  return (
    <>
      <div className="container-thumbnail">
        <img className="thumbnail-image" src={props.src} />
        {props.children}
      </div>
    </>
  );
}

export default Thumbnail;