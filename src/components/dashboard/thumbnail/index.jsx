import react from "react";
import '../index.css';

const Thumbnail = (props) => {
  return (
    <>
      <img style={{width: '200px', height: '130px'}} src={props.src} />
    </>
  );
}

export default Thumbnail;