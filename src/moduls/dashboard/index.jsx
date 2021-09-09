import react, { useState }  from "react";
import { TextInput, Button, Thumbnail, ThumbnailDescription } from "../../components/dashboard";
import { API_URL, AUTH_USERNAME, AUTH_PASS } from "../../global";
import axios from "axios";

const Dashboard = () => {

  const [urlText, setUrlText] = useState('');

  const [videoInfo, setVideoInfo] = useState({});
  const [isLoading, setIsloading] = useState(false);
  const [isEmptyData, setIsEmptyData] = useState(true);
  const [error, setError] = useState('');

  console.log(error)

  const getInfoVideo = async () => {
    try {
      const API = `${API_URL}/video-info?url=${urlText}`;
      setIsEmptyData(true)
      setIsloading(true)

      const response = await axios.get(API, {
        // Axios looks for the `auth` option, and, if it is set, formats a
        // basic auth header for you automatically.
        auth: {
          username: AUTH_USERNAME,
          password: AUTH_PASS
        }
      });

      const res = response.data;
      if (res.success) {
        setIsloading(false)
        setVideoInfo(res.data)
        setIsEmptyData(false)
      }
    } catch (error) {
      setIsloading(false)
      setError(error)
    }
  }

  const downloader = async () => {
    const API = `${API_URL}/download?url=https://www.youtube.com/watch?v=d95PPykB2vE`;

    const response = await axios.get(API, {
      // Axios looks for the `auth` option, and, if it is set, formats a
      // basic auth header for you automatically.
      auth: {
        username: AUTH_USERNAME,
        password: AUTH_PASS
      },
      responseType: 'blob',
    });

    const { url } = response.config;

    const link = document.createElement('a');
    link.href = url;
    document.body.appendChild(link);
    link.click();
  }


  return (
    <div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{backgroundColor: '#f4f4f4', padding: '20px', marginTop: '20px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <p>Please insert a valid video URL</p>
              <TextInput onChange={(e) => setUrlText(e.target.value)}>
                <Button onClick={() => getInfoVideo()}/>
              </TextInput>
            </div>
           

            {isLoading && <p>Loading...</p>}

            {!isEmptyData && (
                <Thumbnail src={videoInfo.thumbnail}>
                    <ThumbnailDescription 
                      title={videoInfo.title} 
                      author={videoInfo.author}
                    />
                </Thumbnail>
            )}
          </div>
        </div>
    </div>
  );
}

export default Dashboard;
