import react from "react";
import '../index.css';

const Loading = (props) => {
  return (
    <>
      <div className="container-loading">
          <p>{props.name}</p>
      </div>
    </>
  );
}

export default Loading;