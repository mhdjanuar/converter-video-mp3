import { useState, useEffect }  from "react";
import { TextInput, Button, Thumbnail, ThumbnailDescription, ProgressBar } from "../../components/dashboard";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(`${process.env.REACT_APP_BASE_URL}`);

const Dashboard = () => {
  const API_URL = `${process.env.REACT_APP_BASE_URL}/youtube/v1`;
  const AUTH_USERNAME = process.env.REACT_APP_AUTH_USERNAME;
  const AUTH_PASS = process.env.REACT_APP_AUTH_PASS;

  const [urlText, setUrlText] = useState('');

  const [videoInfo, setVideoInfo] = useState({});
  const [isLoadingGetInfo, setIsloadingGetInfo] = useState(false);
  const [isLoadingCheckVideo, setIsloadingCheckVideo] = useState(false);
  const [isLoadingDownload, setisLoadingDownload] = useState(false);
  const [isEmptyData, setIsEmptyData] = useState(true);
  const [fileName, setFileName] = useState('');
  const [progressDownload, setprogressDownload] = useState(0);
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
        checkingVideo();
      }
    } catch (error) {
      console.log(error)
      setIsloadingGetInfo(false)
      setError(error)
    }
  }

  const checkingVideo = async () => {
    try {
      const API = `${API_URL}/check-download?url=${urlText}`;
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
        onDownloadProgress: (progressEvent) => {
          // Do whatever you want with the native progress event
          let percentCompleted = Math.floor(progressEvent.loaded / progressEvent.total * 100)
          setprogressDownload(percentCompleted);
        },
        responseType: 'arraybuffer',
      });

      if (response.status == 200) {
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

  const deleteFileInfo = () => {
    if (socketId !== '') {
      const data = {
        clientId: socketId,
        fileName: fileName,
        message: 'deleted from fe'
      }
  
      setUrlText('')
      setVideoInfo({})
      setIsloadingGetInfo(false)
      setIsloadingCheckVideo(false)
      setisLoadingDownload(false)
      setIsEmptyData(true)
      setFileName('')
      setprogressDownload(0);
  
      socket.emit("deleteFile", data);
    }
  }

  return (
    <div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{backgroundColor: '#f4f4f4', padding: '20px', marginTop: '20px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <h3>Please insert a valid video URL</h3>
              <TextInput value={urlText} onChange={(e) => setUrlText(e.target.value)}>
                <Button 
                  name={isEmptyData ? 'Convert' : 'Next'}
                  onClick={() => isEmptyData ? getInfoVideo() : deleteFileInfo()}
                />
              </TextInput>
            </div>
           

            {isLoadingGetInfo && <p>initialize...</p>}

            {isLoadingCheckVideo && <p>checking video...</p>}

            {isLoadingDownload && (
              <div>
                <p>Wait for download...</p>
                <ProgressBar currentProgress={`${progressDownload}`} value={`${progressDownload}%`}/>
              </div>
            )}

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
