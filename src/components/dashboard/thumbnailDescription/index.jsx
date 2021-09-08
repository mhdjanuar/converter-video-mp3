import react from "react";
import '../index.css';

const ThumbnailDescription = (props) => {
  return (
    <>
      <div className="container-tumbnail-desc">
          <h3 style={{width: 400}}>{props.title}</h3>
          <p>{props.author}</p>
      </div>
    </>
  );
}

export default ThumbnailDescription;