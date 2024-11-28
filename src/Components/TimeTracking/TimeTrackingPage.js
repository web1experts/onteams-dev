import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/dist/styles.css";
import { Container, Row, Col, Button, Form, ListGroup, Table, Badge, CardGroup, Card, Modal, Dropdown } from "react-bootstrap";
import  Fullscreen  from "yet-another-react-lightbox/dist/plugins/fullscreen";
import { FaCheck } from "react-icons/fa";
import { MdOutlineClose, MdFilterList, MdSearch } from "react-icons/md";
import { getliveActivity, getRecoredActivity } from "../../redux/actions/activity.action";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { socket, refreshSocket } from "../../helpers/auth";
import { getMemberdata, showAmPmtime } from "../../helpers/commonfunctions";
import DatePicker from "react-multi-date-picker";
function TimeTrackingPage() {
  let totalhours = 0;
  let totalProjecthours = 0
  const currentMember = getMemberdata();
  const [spinner, setSpinner] = useState(false)
  const [isActive, setIsActive] = useState(false);
  const handleClick = (activity) => {
    setIsActive(current => !current);
    setCurrentActivity( activity)
  };
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const [currentActivity, setCurrentActivity] = useState(false);
  const dispatch = useDispatch()
  const fullscreenRef = React.useRef(null);
  const [activeTab, setActiveTab] = useState("Live");
  const [screenshotTab, setScreenshotTab] = useState({});
  const [activeInnerTab, setActiveInnerTab] = useState("InnerLive");
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postMedia, setPostMedia] = useState([]);
  const activitystate = useSelector((state) => state.activity)
  const [liveactivities, setLiveactivities] = useState([])
  const [ recordedactivities, setRecordedActivities] = useState([])
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setsearchTerm] = useState("");
  const [ filters, setFilters] = useState({});
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
  const [ date, setDate ] = useState('')
  const [showSearch, setSearchShow] = useState(false);
  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);

  const videoRef = useRef(null);
    const peerConnections = {}
    function startsharing(userID, status){
      socket.emit('joinRoom', userID)
     if( status === true ){
      setTimeout(function(){        
        socket.emit('watcher', socket.id, userID, userID, currentMember.role?.slug)
     },800)
     }
   }

   function leaveRoom(room){
     socket.emit('leaveRoom', socket.id, room )
   }
  const handleLiveActivityList = async () => {
    let selectedfilters = { currentPage: currentPage, status: 'live' }
    if (Object.keys(filters).length > 0) {
        selectedfilters = { ...selectedfilters, ...filters }
    }
    await dispatch(getliveActivity(selectedfilters))
    setSpinner(false)
  }
  

  const handleRecordedActivity = async () => {
    setSpinner(true)
    await dispatch(getRecoredActivity(currentActivity._id, 'recorded'))
      setSpinner(false)
  }

  function formattotalTime(time){
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));

    let formattedTime = '';
    if (hours > 0) {
        formattedTime += `${hours}h `;
    }
    if (minutes > 0 || hours > 0) {
        formattedTime += `${minutes}m`;
    }
    return formattedTime.trim();
  }

  useEffect(() => { 
    if(currentActivity !== false && activeTab === "Live"){ 
        startsharing(currentActivity._id, currentActivity?.latestActivity?.status);
    }else if(currentActivity !== false && activeTab === "Recorded"){
      setActiveInnerTab("InnerRecorded")
    }
  },[currentActivity])

   useEffect(() => {
    if (Object.keys(filters).length > 0 && !showFilter) {
        handleLiveActivityList()
    }
  }, [filters])


  useEffect(() => {
    refreshSocket()
    selectboxObserver()
    handleLiveActivityList()

    socket.on('trackerstateUpdate', (memberId) => {
      handleLiveActivityList()
    })

    socket.on('offer', function (id, description, roomId) {
      if(peerConnections[id]){ 
         peerConnections[id].close();
         delete peerConnections[id];
      }
      
      if( !peerConnections[id] ){
        peerConnections[id] = new RTCPeerConnection({ // User stun server for connection with different networks
          iceServers: [
              {
                urls: 'turn:64.227.189.65:3478',
                username: 'web1experts',  // Optional if using 'lt-cred-mech'
                credential: 'PtJJc0FUvuKP3jkn' // Optional if using 'lt-cred-mech'
              },
          ]
        });  
      }

        peerConnections[id].setRemoteDescription(new RTCSessionDescription(description))
            .then(() => peerConnections[id].createAnswer())
            .then(sdp => peerConnections[id].setLocalDescription(sdp))
            .then(function () {
                socket.emit('answer', id, peerConnections[id].localDescription, roomId);
            });
        peerConnections[id].onaddstream = function (event) {
          if(event.stream){
            videoRef.current.srcObject = event.stream;
            videoRef.current.onloadedmetadata = () => videoRef.current.play();
          }
        };
        peerConnections[id].onicecandidate = function (event) {
            if (event.candidate) {
                socket.emit('candidate', id, event.candidate, roomId,'viwers');
            }
        };

        peerConnections[id].addEventListener('iceconnectionstatechange', () => {console.log('ICE Connection State:', peerConnections[id].iceConnectionState);
          if (peerConnections[id].iceConnectionState === 'connected' || peerConnections[id].iceConnectionState === 'completed' || peerConnections[id].iceConnectionState === 'disconnected' || peerConnections[id].iceConnectionState === 'failed') {
              console.log('WebRTC connection is complete!');
              
          }
        });
  });

  socket.on('candidate', function (id, candidate, roomId) {
    if(peerConnections[id]){
      const rtcPeerConnection = peerConnections[id]
      peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error(e));
    }
  });

  setSpinner(true)
  }, [])

  useEffect(() => {
    if (activitystate?.liveactivities?.memberData) { 
      setLiveactivities(activitystate.liveactivities.memberData)
      if (currentActivity && Object.keys(currentActivity).length > 0) {
        activitystate.liveactivities.memberData.forEach((a, inx) => {
            if (a._id === currentActivity._id) {
                setCurrentActivity(a);
                return;
            }
        })
      }
    }

    if( activitystate?.recordedActivity ){
      setRecordedActivities(activitystate?.recordedActivity)
    }
  }, [activitystate])

  const handlefilterchange = (name, value) => {
    if (name === "search" && value === "" || name === "search" && value.length > 1 || name !== "search") {
        setFilters({ ...filters, [name]: value })
    }
  }

  const handleLightBox = (type, mediaItems, index) => {
    setCurrentIndex(index);
    const slides =
    Array.isArray(mediaItems) && mediaItems.length > 0
      ? mediaItems.map((item) => {
          if (type === "video") {
            return {
              type: "video",
              src: item.url,
              poster: null, // Optional, for a thumbnail or video preview
              videoProps: {
                controls: true,
                autoPlay: false, // Set to true if you want videos to start automatically
                style: { maxHeight: "90vh", maxWidth: "100%" },
              },
            };
          }
          return { type: "image", src: item.url }; // Default case for images
        })
      : [];

    // const data = slides;
    setPostMedia(slides)
    setOpen(true)
  }
  
  useEffect(() => {
    selectboxObserver();
  }, [activeTab])

  useEffect(() => {
  
    if( activeInnerTab === "InnerRecorded"){
      handleRecordedActivity()
    }
  }, [activeInnerTab])

  // useEffect(() => {
  //   handleRecordedActivity();
  // }, [screenshotTab])

  const showTabs = () => {
    if (activeTab === 'Recorded') {
      return (
        <>
          <ListGroup.Item key="filter-key-1" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('show_for', event.target.value)} value={filters['show_for'] || 'all'}>
                <option value="all">Team Projects</option>
                <option value="my">My Projects</option>
            </Form.Select>
            
          </ListGroup.Item>
          <ListGroup.Item key="filter-key-2" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
          <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('status', event.target.value)} value={filters['status'] || 'all'}>
              <option value="all">View All</option>
              <option value="active">Active</option>
              <option value="pause">Paused</option>
              <option value="inactive">Inactive</option>
          </Form.Select>
          </ListGroup.Item>
          <ListGroup.Item key="filter-key-4" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
            <Form>
              <Form.Group className="mb-0 form-group">
              <DatePicker 
                    name="date"
                    id='date--picker'
                    value={date} 
                    onChange={async (value) => {
                        const date = value.toDate();
                        // Manually format the date to YYYY-MM-DDTHH:mm:ss.sss+00:00 without converting to UTC
                        const year = date.getFullYear();
                        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
                        const day = date.getDate().toString().padStart(2, '0');
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const seconds = date.getSeconds().toString().padStart(2, '0');
                        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
                        // Combine into the desired format
                        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
                        
                        setDate(formattedDate)
                      }
                    }                    
                    className="form-control"
                    placeholder="dd/mm/yyyy"
                />
              </Form.Group>
            </Form>
          </ListGroup.Item>
          <ListGroup.Item key="filter-key-5" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
            <Form>
              <Form.Group className="mb-0 form-group">
                <Form.Control type="text" name="search" placeholder="Search by name" />
              </Form.Group>
            </Form>
          </ListGroup.Item>
        </>
      )
    } else {
      return (
        <>
          <ListGroup.Item key="filter-key-6" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('tracker_status', event.target.value)} value={filters['status'] || 'all'}>
                <option value="all">View All</option>
                <option value="active">Active</option>
                <option value="pause">Paused</option>
                <option value="inactive">Inactive</option>
            </Form.Select>
            
          </ListGroup.Item>
          <ListGroup.Item key="filter-key-7" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
            <Form>
              <Form.Group className="mb-0 form-group">
                <Form.Control type="text" name="search" placeholder="Search by name" onChange={(event) => handlefilterchange('search', event.target.value)} />
              </Form.Group>
            </Form>
          </ListGroup.Item>
        </>
      )
    }
  }

  const showDate = () => {
    if (activeInnerTab === 'InnerRecorded') {
      return (
        <>
          <ListGroup.Item className="no--style">
            <Form>
              <Form.Group className="mb-0 form-group">
                <DatePicker 
                    name="date"
                    id='date--picker'
                    value={date} 
                    onChange={async (value) => {
                        const date = value.toDate();
                        // Manually format the date to YYYY-MM-DDTHH:mm:ss.sss+00:00 without converting to UTC
                        const year = date.getFullYear();
                        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
                        const day = date.getDate().toString().padStart(2, '0');
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const seconds = date.getSeconds().toString().padStart(2, '0');
                        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
                        // Combine into the desired format
                        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
                        
                        setDate(formattedDate)
                      }
                    }                    
                    className="form-control"
                    placeholder="dd/mm/yyyy"
                />
              </Form.Group>
            </Form>
          </ListGroup.Item>
        </>
      )
    } else {
      return (
        <>
        </>
      )
    }
  }

  const getActiveTab = (recordingId) => screenshotTab[recordingId] || "Screenshots";


  return (
    <>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={postMedia}
        plugins={[Fullscreen]}
        fullscreen={{ ref: fullscreenRef }}
        index={currentIndex}
        on={{
          click: () => fullscreenRef.current?.enter(),
        }}
        render={{
          slide: ({slide}) => {
            if (slide?.type === "video") {
              return (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <video
                    controls
                    autoPlay={false}
                    style={{ maxHeight: "90vh", maxWidth: "100%" }}
                  >
                    <source src={slide.src} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }
            return null; // Default render for images will be used
          },
        }}
      />

      <div className={isActive ? "show--details team--page" : "team--page"}>
        <div className='page--title px-md-2 pt-3'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>Activity
                  <Button variant="primary" className={isActive ? 'd-flex ms-auto' : 'd-lg-none'} onClick={handleSearchShow}><MdSearch /></Button>
                  <Button variant="primary" className={isActive ? 'd-flex' : 'd-xl-none'} onClick={handleFilterShow}><MdFilterList /></Button>
                  <ListGroup horizontal className={isActive ? "d-none" : "activity--tabs ms-auto"}>
                    <ListGroup.Item action active={activeTab === "Live"} onClick={() => {
                      if( currentActivity && Object.keys(currentActivity)){
                        const cact = currentActivity
                        leaveRoom(currentActivity?._id)
                        setCurrentActivity(cact);
                      }
                      setActiveTab("Live")}}>Live</ListGroup.Item>
                    <ListGroup.Item action active={activeTab === "Recorded"} onClick={() => {setActiveTab("Recorded")}}>Recorded</ListGroup.Item>
                    {showTabs()}
                  </ListGroup>
                </h2>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper daily--reports activity--table px-md-2 py-3'>
          {
              spinner &&
              <div class="loading-bar">
                  <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
          }
          <Container fluid>
            {activeTab === "Live" && (
              <>
                <p className="d-flex d-lg-none">Total Hours <strong className="ms-auto">50 Hrs</strong></p>
                <Table responsive="lg" className="activity--table">
                  <thead>
                    <tr key="tracking-table-header">
                      <th scope="col"><abbr>#</abbr> Member Name</th>
                      <th scope="col" className="onHide">Project Name</th>
                      <th scope="col" className="onHide">Task Name</th>
                      <th scope="col" className="onHide">Project Time</th>
                      <th scope="col" className="onHide">Total Time</th>
                      <th scope="col" className="onHide">Status</th>
                      <th scope="col" className="onHide text-lg-end">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      liveactivities.length > 0 ?
                        liveactivities.map((activity, index) => {
                          totalhours += Number(activity?.totalDuration || 0)
                          totalProjecthours += Number(activity?.latestActivity?.duration || 0)
                          return (
                            <>
                              <tr key={`activity-row-${index}`} className={ (currentActivity && currentActivity?._id === activity._id ) ? 'active': '' } >
                                {/* <td key={`index-${index}`}>{index + 1} </td> */}
                                <td data-label="Member Name" className="project--title--td" onClick={() => {
                                      if (isActive) {
                                        leaveRoom(currentActivity?._id)
                                        setCurrentActivity(activity);
                                      }
                                  }} >
                                    <span><abbr key={`index-${index}`}>{index + 1}.</abbr> {activity.name}
                                      {
                                        activity?.latestActivity?.status ? 
                                        <small className="status--circle active--color"></small>
                                        :
                                        activity?.latestActivity?.status === false  ?
                                        <small className="status--circle info--color"></small>
                                        :
                                        null
                                      }
                                    </span>
                                </td>
                                <td data-label="Project Name" className="onHide project--title--td"><span>{ activity?.latestActivity?.project?.title || '--' }</span></td>
                                <td data-label="Task Name" className="onHide project--title--td"><span>{ activity?.latestActivity?.task?.title || '--' }</span></td>
                                <td data-label="Task Time" className="onHide">{ formattotalTime(activity?.latestActivity?.duration) || '00:00'}</td>
                                <td data-label="Total Time" className="onHide">{ formattotalTime(activity?.totalDuration) || '00:00'}</td>
                                <td data-label="Status" className="onHide">
                                  { 
                                    (activity?.latestActivity?.status) ? 
                                    <Badge bg="success">Active</Badge> : 
                                    (activity?.latestActivity?.status === false ) ?
                                    <Badge bg="warning">Pause</Badge>
                                    :
                                    <Badge bg="danger">Inactive</Badge>
                                    }
                                </td>
                                <td className="onHide text-lg-end"><Button variant="primary" onClick={() => handleClick(activity)}>View Activity</Button></td>
                              </tr>
                              
                            </>
                          )
                        })
                        :
                        !spinner && liveactivities.length === 0  &&
                          <tr key={`noresults-row`}>
                            <td colSpan={8} className="text-center"><h3>No Results</h3> </td>
                          </tr>
                    }
                    <tr className="onHide bg-light mobile--hide" key={'hiddenkey'}>
                      <td></td>
                      <td></td>
                      <td><strong>Total Hours</strong></td>
                      <td><strong>{ formattotalTime(totalProjecthours) || '00:00'}</strong></td>
                      <td><strong>{ formattotalTime(totalhours) || '00:00'}</strong></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </>
            )}
            {activeTab === "Recorded" && (
              <>
                <p className="d-flex d-lg-none">Total Hours <strong className="ms-auto">50 Hrs</strong></p>
                <Table responsive="lg" className="activity--table">
                  <thead>
                    <tr key={'recorded-table-header'}>
                      {/* <th scope="col" width={20}>#</th> */}
                      <th scope="col" width={300}><abbr>#</abbr> Member Name</th>
                      <th scope="col" className="onHide">Total Time</th>
                      <th scope="col" className="onHide text-lg-end">View</th>
                    </tr>
                  </thead>
                  <tbody>
                  {
                      liveactivities.length > 0 ?
                        liveactivities.map((activity, index) => {
                          totalhours += Number(activity?.totalDuration || 0)
                          totalProjecthours += Number(activity?.latestActivity?.duration || 0)
                          return (
                            <>
                              <tr key={`activity-row-${index}`} className={ (currentActivity && currentActivity?._id === activity._id ) ? 'active': '' } >
                                {/* <td key={`index-${index}`}>{index + 1} </td> */}
                                <td data-label="Member Name" onClick={() => {
                                      if (isActive) {
                                        setCurrentActivity(activity);
                                      }
                                  }} ><abbr key={`index-${index}`}>{index + 1}.</abbr> {activity.name} 
                                  
                                </td>
                                
                                <td data-label="Total Time" className="onHide">{ formattotalTime(activity?.totalDuration) || '00:00'}</td>
                                
                                <td className="onHide text-lg-end"><Button variant="primary" onClick={() => handleClick(activity)}>View Activity</Button></td>
                              </tr>
                              
                            </>
                          )
                        })
                        :
                        !spinner && liveactivities.length === 0  &&
                          <tr key={`noresults-row`}>
                            <td colSpan={8} className="text-center"><h3>No Results</h3> </td>
                          </tr>
                    }
                    
                  </tbody>
                </Table>
              </>
            )}
          </Container>
        </div>
      </div>
      <div className="details--wrapper">
        <div className="wrapper--title">
          <ListGroup horizontal className="live--tabs">
            <ListGroup.Item key={'live-key'} action active={activeInnerTab === "InnerLive"} onClick={() => {setActiveInnerTab("InnerLive")
             if( currentActivity && Object.keys(currentActivity)){
              const cact = currentActivity
              leaveRoom(currentActivity?._id)
              startsharing(currentActivity?._id, currentActivity?.latestActivity?.status)
            }
            }}>
              Live
            </ListGroup.Item>
            <ListGroup.Item key={'recored-key'} action active={activeInnerTab === "InnerRecorded"} onClick={() => {setActiveInnerTab("InnerRecorded")
              if( currentActivity && Object.keys(currentActivity)){
                leaveRoom(currentActivity?._id)
              }
            }}>
              Recorded
            </ListGroup.Item>
            {showDate()}
          </ListGroup>
          <ListGroup horizontal>
            <ListGroup.Item key={'closekey'} onClick={() => { socket.emit('leaveRoom', socket.id, currentActivity?._id ); setCurrentActivity(false); setIsActive(false)}}>
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>
        <div className="rounded--box activity--box">
          {activeInnerTab === "InnerLive" && (
            <>
              <div className="current--player p-2" key={`activity-${currentActivity?._id}`}>
                <div className="timer--task">
                  <h5 key={`project-task-title-for-${currentActivity?.latestActivity?._id}`}>{ currentActivity?.latestActivity?.project?.title || '--' } - <small>{ currentActivity?.latestActivity?.task?.title || '--' }</small></h5>
                  <span className="ml-3 p-2">{ currentActivity?.latestActivity?.app_version}</span>
                  <p className="task--timer">
                    <span><strong>{ formattotalTime(currentActivity?.totalDuration) || '00:00'}</strong></span>
                  </p>
                </div>
                {
                  currentActivity?.latestActivity?.status ? 
                  <video ref={videoRef} id='remoteVideo' width="100%"  className="video" 
                  preload="auto"
                        autoPlay
                        muted>video not available</video>

                        :
                        currentActivity?.latestActivity?.status === false ?
                        <p className="text-center">The member is paused</p>
                        :
                        <p className="text-center">Member is not currently active</p>
                }
                
                
              </div>
            </>
          )}
          {activeInnerTab === "InnerRecorded" && (
            <>
              {
                recordedactivities && recordedactivities.length > 0 ? 
                  recordedactivities.map((recording, index) => {
                    return (
                    <>
                      <div className="wrapper--title screens--tabs">
                        <p><span>Project: {recording?.project?.title}</span><strong>{new Date(recording?.createdAt).toLocaleDateString('en-GB', options)}</strong></p>
                        <ListGroup horizontal>
                          <ListGroup.Item key={'screenshots1-tab-key'} action active={!screenshotTab[recording._id] || screenshotTab[recording._id] && screenshotTab[recording._id] === "Screenshots"} onClick={() => setScreenshotTab({...screenshotTab, [recording._id]: "Screenshots"})}>
                            Screenshots
                          </ListGroup.Item>
                          <ListGroup.Item key={'videos1-tab-key'} action active={screenshotTab[recording._id] && screenshotTab[recording._id] === "Videos"} onClick={() => setScreenshotTab({...screenshotTab, [recording._id]: "Videos"})}>
                            Videos
                          </ListGroup.Item>
                        </ListGroup>
                      </div>

                      <div className="shots--list pt-3">
                      <CardGroup>
                          {
                            recording?.activityMeta &&
                            recording.activityMeta.length > 0 &&
                            recording.activityMeta.map((meta, i) => {
                              // Handle screenshots tab
                              if (
                                getActiveTab(recording._id) === "Screenshots" &&
                                meta.meta_key === 'screenshots' &&
                                meta.meta_value.length > 0
                              ) {
                                return meta.meta_value.map((screenshotData, j) => (
                                  <Card key={`screenshot-card-${i}-${j}`}>
                                    <Card.Body>
                                      <img
                                        className="card-img-top"
                                        src={screenshotData?.url}
                                        alt="Card image cap"
                                        onClick={() => handleLightBox('screenshot', meta.meta_value, j)}
                                      />
                                      <p>
                                        <strong>Task Name:</strong> {recording.task?.title} <br />
                                        <strong>Time:</strong>
                                      </p>
                                    </Card.Body>
                                  </Card>
                                ));
                              }
                              // Handle videos tab
                              if (
                                getActiveTab(recording._id) === "Videos" &&
                                meta.meta_key === 'videos' &&
                                meta.meta_value.length > 0
                              ) {
                                return meta.meta_value.map((videoData, j) => (
                                  <Card key={`video-card-${i}-${j}`}>
                                    <Card.Body onClick={() => handleLightBox('video', meta.meta_value, j)}>
                                      <video controls height="175px">
                                        <source src={videoData?.url} type="video/webm" />
                                        Your browser does not support the video tag.
                                      </video>
                                      <p>
                                        <strong>Task Name:</strong> {recording.task?.title} <br />
                                        <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                      </p>
                                    </Card.Body>
                                  </Card>
                                ));
                              }
                              return null; // Return null if no condition is met
                            })
                          }
                        </CardGroup>

                      </div>
                    </>
                    )
                  })
                  

                :
                null
              }
            </>
          )}
        </div>
      </div>
      {/*--=-=Filter Modal**/}
      <Modal show={showFilter} onHide={handleFilterClose} centered size="md" className="filter--modal">
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item key="filter-key-1" className="mt-0">
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success">Team Projects</Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option" href="#/action-1">Team Projects <FaCheck /></Dropdown.Item>
                  <Dropdown.Item href="#/action-2">My Projects</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              
            </ListGroup.Item>
            <ListGroup.Item key="filter-key-2" className="mt-3">
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success">View All</Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option" href="#/action-1">View All <FaCheck /></Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Active</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Paused</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Inactive</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
            <ListGroup.Item key="filter-key-3" className="mt-3">
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success">All Projects</Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option" href="#/action-1">All Projects <FaCheck /></Dropdown.Item>
                  <Dropdown.Item href="#/action-2">The Galaxy</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">On Teams</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Ticket</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
            <ListGroup.Item key="filter-key-4" className="mt-3">
              <Form>
                <Form.Group className="mb-0 form-group">
                <DatePicker 
                    name="date"
                    id='date--picker'
                    value={date} 
                    onChange={async (value) => {
                        const date = value.toDate();
                        // Manually format the date to YYYY-MM-DDTHH:mm:ss.sss+00:00 without converting to UTC
                        const year = date.getFullYear();
                        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
                        const day = date.getDate().toString().padStart(2, '0');
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const seconds = date.getSeconds().toString().padStart(2, '0');
                        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
                        // Combine into the desired format
                        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
                        
                        setDate(formattedDate)
                      }
                    }                    
                    className="form-control"
                    placeholder="dd/mm/yyyy"
                />
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFilterClose}>Cancel</Button>
          <Button variant="primary">Save</Button>
        </Modal.Footer>
      </Modal>
      {/*--=-=Search Modal**/}
      <Modal show={showSearch} onHide={handleSearchClose} size="md" className="search--modal">
        <Modal.Header closeButton>
          <Modal.Title>Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item className="border-0 p-0" key="filter-key-5">
              <Form>
                <Form.Group className="mb-0 form-group">
                  <Form.Control type="text" name="search" placeholder="Search by name" />
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default TimeTrackingPage;