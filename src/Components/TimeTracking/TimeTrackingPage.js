import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/dist/styles.css";
import { Container, Row, Col, Button, Form, ListGroup, Table, Badge, CardGroup, Card, Modal, Dropdown, Accordion } from "react-bootstrap";
import  Fullscreen  from "yet-another-react-lightbox/dist/plugins/fullscreen";
import { FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { BsArrowsFullscreen, BsFullscreen, BsFullscreenExit, BsArrowClockwise } from "react-icons/bs";
import { MdOutlineClose, MdFilterList, MdSearch } from "react-icons/md";
import { getliveActivity, getRecoredActivity } from "../../redux/actions/activity.action";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { socket, refreshSocket } from "../../helpers/auth";
import { getMemberdata, showAmPmtime, generateTimeRange } from "../../helpers/commonfunctions";
import DatePicker from "react-multi-date-picker";
function TimeTrackingPage() {
  let totalhours = 0;
  let totalProjecthours = 0
  const currentMember = getMemberdata();
  const [spinner, setSpinner] = useState(false)
  const [activityspinner, setActSpinner] = useState(false)
  const [isActive, setIsActive] = useState(false);
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [ recordedRefresh, setRecordedRefresh ] = useState(true)
  const handleClick = (activity) => {
    setIsActive(current => !current);
    setRecordedRefresh( true )

    socket.emit('get-tracker-status-update', {userID: activity._id})
    setCurrentActivity( activity)
    if(activeTab === "Recordings"){
      setActiveInnerTab("InnerRecorded")
    }else{
      setActiveInnerTab("InnerLive")
    }
  };
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const [currentActivity, setCurrentActivity] = useState(false);
  const dispatch = useDispatch()
  const fullscreenRef = React.useRef(null);
  const datePickerRef = useRef(null)
  const [activeTab, setActiveTab] = useState("Live");
  const [screenshotTab, setScreenshotTab] = useState('Screenshots');
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
  const [ filtereddate, setFilteredDate ] = useState([new Date().toISOString().split('T')[0]])
  
  const [selectedFilter, setSelectedFilter ] = useState('today')
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showSearch, setSearchShow] = useState(false);
  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);

  const videoRef = useRef(null);
    const peerConnections = {}
    function startsharing(userID, status){
      socket.emit('joinRoom', userID)
     if( status === true ){
      setActSpinner(true)
      setTimeout(function(){        
        socket.emit('watcher', socket.id, userID, userID, currentMember.role?.slug)
     },800)
     }
   }

   function leaveRoom(room){
     socket.emit('leaveRoom', socket.id, room )
   }
  const handleLiveActivityList = async () => {
    let selectedfilters = { currentPage: currentPage, status: activeTab.toLowerCase(), date_range: filtereddate }
    if (Object.keys(filters).length > 0) {
        selectedfilters = { ...selectedfilters, ...filters }
    }
    await dispatch(getliveActivity(selectedfilters))
    setSpinner(false)
  }
  

  const handleRecordedActivity = async () => {
    setActSpinner(true)
    await dispatch(getRecoredActivity(currentActivity._id, 'recorded', filtereddate))
    setActSpinner(false)
  }

  
  const handleToggler = event => {
    setIsScreenActive(current => !current);
  };


  function formatTime(seconds) {
    // Validate input: check if seconds is a valid non-negative number
    if (typeof seconds !== "number" || seconds < 0 || isNaN(seconds)) {
      return "00:00";
    }
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    setActSpinner( false )
    if(currentActivity !== false && activeTab === "Live"){ 
        setSpinner( false )
        startsharing(currentActivity._id, currentActivity?.latestActivity?.status);
    }
    if(currentActivity !== false && activeInnerTab === "InnerRecorded" && recordedRefresh === true){
      // setActiveInnerTab("InnerRecorded")
      handleRecordedActivity()
    }
    // if(currentActivity?.latestActivity?.status === false){
    //   setActSpinner( false )
    // }
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

    socket.on('trackerstateUpdate', (memberData, status = false) => {
      setRecordedRefresh(false); 
      setLiveactivities((prevActivities) => {
  
          if (memberData && memberData._id && prevActivities && prevActivities.length > 0) {
              const updatedActivities = prevActivities.map(activity => {
                
                if (activity._id === memberData._id) {
                  const updatedMemberData = {
                    ...memberData,
                    latestActivity: {
                      ...memberData.latestActivity,
                      status: status // Update the status here
                    }
                  };
              
                  // Merge updatedMemberData with the activity
                  return { ...activity, ...updatedMemberData };
                }
                
                setCurrentActivity((prev) => {
                  if (prev && prev._id === memberData._id) { 
                    return {
                      ...prev,
                      ...memberData,
                      latestActivity: {
                        ...prev.latestActivity,
                        status: status,
                      },
                    };
                  }
                  return prev; // Return unchanged `currentActivity` if `_id` doesn't match
                });

                return activity; // Return unchanged activity if no match
              });

              console.log('updatedActivities:: ', updatedActivities);
              return updatedActivities;
          }
  
          // If no update is needed, return the previous state
          return prevActivities;
      });
  
      // handleLiveActivityList() if required
  });
  

    socket.on('offer', function (id, description, roomId) {
      if(peerConnections[id]){ 
         peerConnections[id].close();
         delete peerConnections[id];
      }
      
      if( !peerConnections[id] ){
        peerConnections[id] = new RTCPeerConnection({ // User stun server for connection with different networks
          iceServers: [
              {
                urls: 'turn:app.onteams.ai:3478',
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
              if(peerConnections[id].iceConnectionState === 'disconnected' || peerConnections[id].iceConnectionState === 'failed'){
                setActSpinner(false)
              }
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

  setInterval(function(){
    handleLiveActivityList()
  }, 60000)

  }, [])

//   function generateTimeRange(createdAt, tasks) {
//     // Create a new Date object from the createdAt date (UTC)
//     const startTime = new Date(createdAt);
    
//     // If tasks array is empty, the total duration will be 0
//     const totalDurationInSeconds = tasks.length > 0
//         ? tasks.reduce((sum, task) => sum + task.duration, 0)
//         : 0;
    
//     // Add the total duration in seconds to the start time
//     const endTime = new Date(startTime.getTime() + totalDurationInSeconds * 1000);
    
//     // Calculate hours and minutes for the duration
//     const totalHours = Math.floor(totalDurationInSeconds / 3600); // Total hours
//     const totalMinutes = Math.floor((totalDurationInSeconds % 3600) / 60); // Remaining minutes
    
//     // Format hours and minutes into a string (e.g., 1:30 hrs)
//     const formattedDuration = `${totalHours}:${totalMinutes.toString().padStart(2, '0')} hrs`;
    
//     // Format the start and end times using local time zone
//     const startTimeFormatted = startTime.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true // Ensures 12-hour format (e.g., 3:00pm)
//     });
//     const endTimeFormatted = endTime.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true // Ensures 12-hour format (e.g., 3:00pm)
//     });
    
//     // Return the formatted time range with duration in brackets
//     return `${startTimeFormatted} - ${endTimeFormatted} (${formattedDuration})`;
// }





  useEffect(() => {
    if (activitystate?.liveactivities?.memberData) { 
      setLiveactivities(activitystate.liveactivities.memberData)
      // if (currentActivity && Object.keys(currentActivity).length > 0) {
      //   activitystate.liveactivities.memberData.forEach((a, inx) => {
      //       if (a._id === currentActivity._id) {
      //           setCurrentActivity(a);
      //           return;
      //       }
      //   })
      // }
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
    if( activeTab !== "Recordings"){
      handleLiveActivityList()
    }
  }, [activeTab])

  useEffect(() => {
  
    if( activeInnerTab === "InnerRecorded" && currentActivity){
      handleRecordedActivity()
    }
  }, [activeInnerTab])

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const activityBox = document.querySelector(".activity--box");

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (activityBox.requestFullscreen) {
        activityBox.requestFullscreen();
      } else if (activityBox.webkitRequestFullscreen) {
        activityBox.webkitRequestFullscreen(); // Safari
      } else if (activityBox.mozRequestFullScreen) {
        activityBox.mozRequestFullScreen(); // Firefox
      } else if (activityBox.msRequestFullscreen) {
        activityBox.msRequestFullscreen(); // IE/Edge
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Safari
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen(); // Firefox
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // IE/Edge
      }
      setIsFullscreen(false);
    }
  };

  // useEffect(() => {
  //   handleRecordedActivity();
  // }, [screenshotTab])

  const showTabs = () => {
    if (activeTab === 'Recordings') {
      return (
        <>
          {showDate()}
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

  const FilterButton = ({ position }) => {
    return (
      <>
        <div className="filter-box">
          <Button variant="primary" onClick={() => {
            if( isActive ){
              handleRecordedActivity()
            }else{  
              setIsPickerOpen(false)
              handleLiveActivityList()
            }
            
          }} className="date-filter-btn me-1">Apply</Button>
          <Button variant="primary" onClick={() => setIsPickerOpen(false)} className="date-filter-btn ms-1">Cancel</Button>
        </div>
      </>
    )
  }

  const FiltersDate = ({ position, setFilteredDate, setSelectedFilter, setIsPickerOpen }) => {
    
    // Helper function to format dates as "YYYY-MM-DD"
    const formatDate = (date) => {
        return date.toISOString().split("T")[0];
    };

    // Helper function to calculate date ranges
    const handleDateFilter = (event, start, end = null) => {
        event.stopPropagation();
        if (end !== null) {
            setFilteredDate([formatDate(start), formatDate(end)]);
        } else {
            setFilteredDate([formatDate(start)]);
        }
        datePickerRef.current.closeCalendar()
        datePickerRef.current.openCalendar()
    };

    const today = new Date();

    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Last 7 days
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 6); // Subtract 6 to get exactly 7 days including today

    // Last week (Monday to Sunday)
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - today.getDay()); // Last Sunday
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekStart.getDate() - 6); // Last Monday

    // Last 2 weeks (from Monday of the week before last week)
    const last2WeeksStart = new Date(lastWeekStart);
    last2WeeksStart.setDate(last2WeeksStart.getDate() - 7);

    // This month (start to end of the current month)
    // This month (start to end of the current month)
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 2);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Correctly gets the last day of the current month
    thisMonthEnd.setHours(23, 59, 59, 999); // Optional: Ensure full inclusion of the last day


    // Last month (start to end of the previous month)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 2);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the last month
    lastMonthEnd.setHours(23, 59, 59, 999); // Ensure full-day inclusion for the last day


    return (
        <>
            <ListGroup vertical="true" className="date-filters">
                <ListGroup.Item className={ selectedFilter === 'today'? 'active': ''} key={'date-today'} onClick={(e) => {handleDateFilter(e, today); setSelectedFilter('today')}}>Today</ListGroup.Item>
                <ListGroup.Item className={ selectedFilter === 'yesterday'? 'active': ''} key={'date-yesterday'} onClick={(e) =>{ handleDateFilter(e, yesterday); setSelectedFilter('yesterday')}}>Yesterday</ListGroup.Item>
                <ListGroup.Item className={ selectedFilter === '7days'? 'active': ''} key={'date-7days'} onClick={(e) => {handleDateFilter(e, last7Days, today); setSelectedFilter('7days')}}>Last 7 days</ListGroup.Item>
                <ListGroup.Item className={ selectedFilter === 'last-week'? 'active': ''} key={'date-last-week'} onClick={(e) => {handleDateFilter(e, lastWeekStart, lastWeekEnd); setSelectedFilter('last-week')}}>Last week</ListGroup.Item>
                <ListGroup.Item className={ selectedFilter === 'last2-weeks'? 'active': ''} key={'date-last2-weeks'} onClick={(e) => {handleDateFilter(e, last2WeeksStart, lastWeekEnd); setSelectedFilter('last2-weeks')}}>Last 2 weeks</ListGroup.Item>
                <ListGroup.Item className={ selectedFilter === 'this-month'? 'active': ''} key={'date-this-month'} onClick={(e) => {handleDateFilter(e, thisMonthStart, thisMonthEnd); setSelectedFilter('this-month')}}>This month</ListGroup.Item>
                <ListGroup.Item className={ selectedFilter === 'last-month'? 'active': ''} key={'date-last-month'} onClick={(e) => {handleDateFilter(e, lastMonthStart, lastMonthEnd); setSelectedFilter('last-month')}}>Last month</ListGroup.Item>
            </ListGroup>
        </>
    );
};

function extractTimeFromISO(createdAt, duration) {
  if (createdAt && duration) {
    // Parse the ISO strings to Date objects
    const startDate = new Date(createdAt);
    const endDate = new Date(duration);

    // Calculate the difference in milliseconds
    const diffInMilliseconds = endDate - startDate;

    // Convert milliseconds to seconds
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

    // Calculate hours and minutes
    const hours = Math.floor(diffInSeconds / 3600); // Total hours
    const minutes = Math.floor((diffInSeconds % 3600) / 60); // Remaining minutes

    // Format and return as hh:mm
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return '00:00';
}


  const showDate = () => {
    // if (activeInnerTab === 'InnerRecorded') {
      return (
        <>
          <ListGroup.Item className="no--style">
            <Form>
              <Form.Group className="mb-0 form-group">
                <DatePicker 
                    key={'date-filter'}
                    ref={datePickerRef}
                    name="date"
                    weekStartDayIndex={1}
                    id='datepicker-filter'
                    value={filtereddate} 
                    format="YYYY-MM-DD"
                    range
                    numberOfMonths={2}
                    dateSeparator=" - " 
                    onChange={async (value) => {
                        setFilteredDate(value)
                      }
                    }          
                    className="form-control"
                    placeholder="dd/mm/yyyy"
                    open={isPickerOpen} // Control visibility with state
                    onOpen={() => setIsPickerOpen(true)} // Update state when opened
                    onClose={() => setIsPickerOpen(false)} // Update state when closed
                    plugins={
                      [<FilterButton position="bottom" />, <FiltersDate position="left" setFilteredDate={setFilteredDate} setSelectedFilter={setSelectedFilter} setIsPickerOpen={setIsPickerOpen} />]
                    } 
                />
              </Form.Group>
            </Form>
          </ListGroup.Item>
        </>
      )
    // } else {
    //   return (
    //     <>
    //     </>
    //   )
    // }
  }

  const showRecordedTabs = () => {
    if (activeInnerTab === 'InnerRecorded') {
      return (
        <>
            <ListGroup horizontal className="screens--shots">
              <ListGroup.Item key={'screenshots1-tab-key'} action active={screenshotTab === "Screenshots"} onClick={() => setScreenshotTab("Screenshots")}>
                Screenshots
              </ListGroup.Item>
              <ListGroup.Item key={'videos1-tab-key'} action active={screenshotTab === "Videos"} onClick={() => setScreenshotTab("Videos")}>
                Videos
              </ListGroup.Item>
            </ListGroup>
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
                    <ListGroup.Item className="refresh--btn list-group-item-action d-none d-md-flex">
                      <BsArrowClockwise onClick={handleLiveActivityList}/>
                    </ListGroup.Item>
                    <ListGroup.Item action active={activeTab === "Live"} onClick={() => {
                      if( currentActivity && Object.keys(currentActivity)){
                        const cact = currentActivity
                        leaveRoom(currentActivity?._id)
                        setCurrentActivity(cact);
                      }
                      setActiveTab("Live")}}>Live</ListGroup.Item>
                    <ListGroup.Item action active={activeTab === "Recordings"} onClick={() => {setActiveTab("Recordings")}}>Recorded</ListGroup.Item>
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
              <div className="loading-bar">
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
                          // totalhours += Number(activity?.totalTaskDuration || 0)
                          // totalProjecthours += Number(activity?.latestActivity?.duration || 0)
                          return (
                            <>
                              <tr key={`activity-row-${index}`} className={ (currentActivity && currentActivity?._id === activity._id ) ? 'project--active': '' } >
                                {/* <td key={`index-${index}`}>{index + 1} </td> */}
                                <td data-label="Member Name" className="project--title--td" onClick={() => {
                                      if (isActive && activeInnerTab !== "InnerRecorded") {
                                        leaveRoom(currentActivity?._id)
                                        socket.emit('get-tracker-status-update', {userID: activity._id})
                                        setCurrentActivity(activity);
                                      }else if(activeInnerTab === "InnerRecorded"){
                                        setRecordedRefresh( true )
                                        setCurrentActivity(activity)
                                        // await dispatch(getRecoredActivity(currentActivity._id, 'recorded'))
                                      }
                                  }} >
                                    <span><abbr key={`index-${index}`}>{index + 1}.</abbr> {activity.name}
                                      {
                                        activity?.latestActivity?.status ? 
                                        <small className="status--circle active--color"></small>
                                        :
                                        activity?.latestActivity?.status === false  ?
                                        <small className="status--circle idle--color"></small>
                                        :
                                        <small className="status--circle inactive--color"></small>
                                      }
                                    </span>
                                </td>
                                <td data-label="Project Name" key={`project-title-${activity?._id}`} className="onHide project--title--td"><span>{ activity?.latestActivity?.project?.title || '--' }</span></td>
                                <td data-label="Task Name" key={`task-name-${activity?._id}`} className="onHide project--title--td"><span>{ activity?.latestActivity?.task?.title?.substring(0, 25) || '--' }</span></td>
                                <td data-label="Task Time" key={`task-time-${activity?._id}`} className="onHide">{ extractTimeFromISO(activity?.latestActivity?.createdAt, activity?.latestActivity?.duration) || '00:00'}</td>
                                <td data-label="Total Time" key={`total-time-${activity?._id}`} className="onHide">{ formatTime(activity?.totalDuration) || '00:00'}</td>
                                <td data-label="Status" key={`status-title-${activity?._id}`} className="onHide">
                                  { 
                                    (activity?.latestActivity?.status) ? 
                                    <Badge bg="success">Active</Badge> : 
                                    (activity?.latestActivity?.status === false ) ?
                                    <Badge bg="warning">Pause</Badge>
                                    :
                                    <Badge bg="danger">Inactive</Badge>
                                    }
                                </td>
                                <td  key={`view-act-${activity?._id}`} className="onHide text-lg-end"><Button variant="primary" onClick={() => handleClick(activity)}>View Activity</Button></td>
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
                      <td><strong>
                        {/* { formatTime(totalProjecthours) || '00:00'} */}
                        </strong></td>
                      <td><strong>
                        {/* { formatTime(totalhours) || '00:00'} */}
                        </strong></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </>
            )}
            {activeTab === "Recordings" && (
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
                          totalhours += Number(activity?.totalTaskDuration || 0)
                         
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
                                
                                <td data-label="Total Time" className="onHide">{ formatTime(activity?.totalTaskDuration) || '00:00'}</td>
                                
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
        {
              activityspinner &&
              <div className="loading-bar">
                  <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
          }
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
            <ListGroup.Item className="list-group-item refresh--btn list-group-item-action d-none d-md-flex">
              <BsArrowClockwise onClick={handleRecordedActivity}/>
            </ListGroup.Item>
          </ListGroup>
          <ListGroup horizontal>
            {showRecordedTabs()}
            <ListGroup.Item key={'closekey'} onClick={() => { socket.emit('leaveRoom', socket.id, currentActivity?._id ); setCurrentActivity(false); setIsActive(false);}}>
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>
        <div className={isScreenActive ? 'rounded--box activity--box fullscreen--box' : 'rounded--box activity--box'}>
          {activeInnerTab === "InnerLive" && (
            <>
              <div className="current--player pt-3" key={`activity-${currentActivity?._id}`}>
                <div className="timer--task">
                  <h5 key={`project-task-title-for-${currentActivity?.latestActivity?._id}`}>{ currentActivity?.latestActivity?.project?.title || '--' } - <small>{ currentActivity?.latestActivity?.task?.title || '--' }</small></h5>
                  <span className="ms-md-3">{ currentActivity?.latestActivity?.app_version}</span>
                  <p className="task--timer">
                    <span><strong>{ formatTime(currentActivity?.totalTaskDuration) || '00:00'}</strong></span>
                  </p>
                  <div className={isScreenActive ? 'expand--button exit--fullscreen' : 'expand--button'}>
                  <Button variant="secondary" className="enter--screen" onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <>
                        <BsFullscreenExit />
                      </>
                    ) : (
                      <>
                        <BsFullscreen />
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={handleToggler}><BsArrowsFullscreen className="open--fullscreen" /><MdClose className="close--fullscreen" /></Button>
                  </div>
                </div>
                {
                  currentActivity?.latestActivity?.status ? 
                  <video ref={videoRef} id='remoteVideo' width="100%"  className="video" onLoadedData={() => {setActSpinner( false )}}
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
            <Accordion defaultActiveKey="0">
              {
                recordedactivities && recordedactivities.length > 0 ? 
                  recordedactivities.map((recording, index) => {
                    return (
                    <>
                    
                    <Accordion.Item eventKey={index}>
                      <div className="screens--tabs">
                      
                        <Accordion.Header>
                          <p>
                            <span>Project: {recording?.project?.title}</span>
                            <strong>{new Date(recording?.createdAt).toLocaleDateString('en-GB', options)}</strong>
                            <strong>{ generateTimeRange(recording?.createdAt, recording?.duration)}</strong>
                          </p>
                        </Accordion.Header>
                      </div>
                      <Accordion.Body>
                      <div className="shots--list pt-3">
                      <CardGroup>
                          {
                            recording?.activityMeta && recording.activityMeta.length > 0 ? (
                              recording.activityMeta.map((meta, i) => {
                                // Handle screenshots tab
                                if (screenshotTab === "Screenshots" && meta.meta_key === 'screenshots' && meta.meta_value.length > 0) {
                                  return meta.meta_value.map((screenshotData, j) => (
                                    <Card key={`screenshot-card-${i}-${j}`}>
                                      <Card.Body>
                                        <img
                                          className="card-img-top"
                                          src={screenshotData?.url}
                                          alt="screenshot"
                                          onClick={() => handleLightBox('screenshot', meta.meta_value, j)}
                                        />
                                        <p>
                                          <strong>Task Name:</strong> {screenshotData?.task_data?.title} <br />
                                          <strong>Time:{showAmPmtime(screenshotData?.taken_time)}</strong>
                                        </p>
                                      </Card.Body>
                                    </Card>
                                  ));
                                }

                                // Handle videos tab
                                if (screenshotTab === "Videos" && meta.meta_key === 'videos' && meta.meta_value.length > 0) {
                                  return meta.meta_value.map((videoData, j) => (
                                    <Card key={`video-card-${i}-${j}`}>
                                      <Card.Body onClick={() => handleLightBox('video', meta.meta_value, j)}>
                                        <video controls height="175px">
                                          <source src={videoData?.url} type="video/webm" />
                                          Your browser does not support the video tag.
                                        </video>
                                        <p>
                                          <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                                          <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                        </p>
                                      </Card.Body>
                                    </Card>
                                  ));
                                }

                                return null; // Return null if no condition is met
                              })
                            ) : (
                              <div>No data available</div> // Display if no data is available
                            )
                          }
                        </CardGroup>


                      </div>
                      </Accordion.Body>
                      </Accordion.Item>
                  
                    </>
                    )
                  })
                :
                <p className="text-center mt-5">No activity available.</p>
              }
            </Accordion>  
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