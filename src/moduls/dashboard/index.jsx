import { useState, useEffect }  from "react";
import { TextInput, Button, Thumbnail, ThumbnailDescription } from "../../components/dashboard";
import { API_URL, AUTH_USERNAME, AUTH_PASS } from "../../global";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://free-downloader.herokuapp.com");

const Dashboard = () => {
  const [urlText, setUrlText] = useState('');

  const [videoInfo, setVideoInfo] = useState({});
  const [isLoadingGetInfo, setIsloadingGetInfo] = useState(false);
  const [isLoadingCheckVideo, setIsloadingCheckVideo] = useState(false);
  const [isLoadingDownload, setisLoadingDownload] = useState(false);
  const [isEmptyData, setIsEmptyData] = useState(true);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const [socketId, setSocketId] = useState('');

  useEffect(() => {    
    socket.on("connect", () => {
      const { id } = socket;
      console.log(id);
      setSocketId(id)
    });

    socket.on("statusCheckDownload", (response) => {
      if (!response.isLoading) {
        setIsloadingCheckVideo(false)
        setIsEmptyData(false)
      }
    });

    return () => {
      socket.on("disconnect", (socket) => {
        console.log(socket.id); // undefined
      });
    }
  })

  const getInfoVideo = async () => {
    try {
      const API = `${API_URL}/video-info?url=${urlText}`;
      setIsEmptyData(true)
      setIsloadingGetInfo(true)

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
        const { data } = res;
        setIsloadingGetInfo(false)
        setVideoInfo(data)
        checkingVideo(data);
      }
    } catch (error) {
      console.log(error)
      setIsloadingGetInfo(false)
      setError(error)
    }
  }

  const checkingVideo = async (data) => {
    try {
      const API = `${API_URL}/check-download?url=${urlText}`;
      const { title } = data;
      const body = {
        clientId: `${socketId}`
      }

      const response = await axios.post(API, body, {
        // Axios looks for the `auth` option, and, if it is set, formats a
        // basic auth header for you automatically.
        auth: {
          username: AUTH_USERNAME,
          password: AUTH_PASS
        }
      });

      const res = response.data;
      if (res.success) {
        setIsloadingCheckVideo(true)
        setFileName(res.data.filename)
      }
    } catch (error) {
      console.log(error)
      setIsloadingCheckVideo(false)
    }
  } 

  const downloader = async () => {
    try{
      const API = `${API_URL}/download?clientId=${socketId}&filename=${fileName}`;
      setisLoadingDownload(true)

      const response = await axios.get(API, {
        // Axios looks for the `auth` option, and, if it is set, formats a
        // basic auth header for you automatically.
        auth: {
          username: AUTH_USERNAME,
          password: AUTH_PASS
        },
        responseType: 'blob',
      });

      console.log(response.statusText);

      if (response.statusText == 'OK') {
        const url  = window.URL.createObjectURL(new Blob([response.data]))

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${videoInfo.title} BY YUJA.mp3`); //or any other extension
        document.body.appendChild(link);
        link.click();
        setisLoadingDownload(false)
      }
    } catch(e){
      console.log(e)
      setisLoadingDownload(false)
    }
  }


  return (
    <div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{backgroundColor: '#f4f4f4', padding: '20px', marginTop: '20px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <p>Please insert a valid video URL</p>
              <TextInput onChange={(e) => setUrlText(e.target.value)}>
                <Button name="Convert" onClick={() => getInfoVideo()}/>
              </TextInput>
            </div>
           

            {isLoadingGetInfo && <p>initialize...</p>}

            {isLoadingCheckVideo && <p>checking video...</p>}

            {isLoadingDownload && <p>Wait for dowmload...</p>}

            {!isEmptyData && (
                <Thumbnail src={videoInfo.thumbnail}>
                    <ThumbnailDescription 
                      title={videoInfo.title}
                      author={videoInfo.author}
                    />
                    <Button name="Download" onClick={() => downloader()}/>
                </Thumbnail>
            )}
          </div>
        </div>
    </div>
  );
}

export default Dashboard;
