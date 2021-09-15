import { useState, useEffect }  from "react";
import { TextInput, Button, Thumbnail, ThumbnailDescription, ProgressBar, Loading } from "../../components/dashboard";
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
      console.log(API)
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
      setIsloadingCheckVideo(true)

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

  const InputWithLoading = () => {
    if (!isLoadingGetInfo && !isLoadingCheckVideo) {
      return (
        <TextInput value={urlText} onChange={(e) => setUrlText(e.target.value)}>
              <Button 
                style={{width: '20%'}}
                name={isEmptyData ? 'Convert' : 'Next'}
                onClick={() => isEmptyData ? getInfoVideo() : deleteFileInfo()}
              />
         </TextInput>
      )
    } else if (isLoadingGetInfo) {
      return <Loading name="initialize..." />
    } else if (isLoadingCheckVideo) {
      return <Loading name="checking video" />
    }
  }

  return (
    <div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{backgroundColor: '#f4f4f4', padding: '20px', marginTop: '20px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              {!isLoadingDownload ? (
                isEmptyData && (
                  <div>
                    <p style={{color: '#0087cf'}}>
                      Please insert a valid video URL
                    </p>
                    <InputWithLoading />
                  </div>
                )
              ): (
                <ProgressBar currentProgress={`${progressDownload}`} value={`${progressDownload}%`}/>
              )}
            </div>

            {!isEmptyData && (
                <Thumbnail src={videoInfo.thumbnail}>
                    <ThumbnailDescription 
                      title={videoInfo.title}
                      author={videoInfo.author}
                    />
                    <div style={{display: 'flex'}}>
                      <Button name="Download" onClick={() => !isLoadingDownload ? downloader() : alert('bersabar proses download')}/>
                      {progressDownload >= 100 && <Button style={{marginLeft: 10}} name="Convert Next" onClick={() => deleteFileInfo()}/>}
                    </div>
                </Thumbnail>
            )}
          </div>
        </div>
    </div>
  );
}

export default Dashboard;
