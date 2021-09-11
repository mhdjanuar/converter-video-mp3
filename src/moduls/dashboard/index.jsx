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
  const [isEmptyData, setIsEmptyData] = useState(true);
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
  }, [])

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
      setIsloadingGetInfo(false)
      setError(error)
    }
  }

  const checkingVideo = async (data) => {
    try {
      const API = `${API_URL}/check-download?url=https://www.youtube.com/watch?v=jeccjxIgBJ0`;
      const { title } = data;
      const body = {
        title,
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
      }
    } catch (error) {
      console.log(error)
    }
  } 

  const downloader = async () => {
    const API = `https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3`;

    const response = await axios.get(API, {
      // Axios looks for the `auth` option, and, if it is set, formats a
      // basic auth header for you automatically.
      // auth: {
      //   username: AUTH_USERNAME,
      //   password: AUTH_PASS
      // },
      responseType: 'blob',
    });

    console.log(response)

    const url  = window.URL.createObjectURL(new Blob([response.data]))
    console.log(url)

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'file.mp3'); //or any other extension
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
           

            {isLoadingGetInfo && <p>initialize...</p>}

            {isLoadingCheckVideo && <p>checking video...</p>}

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
