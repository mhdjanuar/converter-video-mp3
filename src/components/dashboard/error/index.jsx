import react from "react";
import '../index.css';

const Error = (props) => {
  return (
    <>
      <div className="container-error">
        <p>An error occurred (code: 0-0).</p>
        <div style={{display: 'flex'}}>
          <p>Please try to convert another video by clicking {'\u00A0'}</p>
          <p className="link-error" onClick={props.onClick}>here.</p>
        </div>
      </div>
    </>
  );
}

export default Error;