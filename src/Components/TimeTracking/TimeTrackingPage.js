import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/dist/styles.css";
import { Container, Row, Col, Button, Form, ListGroup, Table, Badge, CardGroup, Card, Modal, Dropdown, Accordion } from "react-bootstrap";
import  Fullscreen  from "yet-another-react-lightbox/dist/plugins/fullscreen";
import { FaCheck, FaEye } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { FiSidebar, FiUserX, FiMonitor, FiCoffee, FiClock } from "react-icons/fi";
import { GrExpand } from "react-icons/gr";
import { BsArrowsFullscreen, BsFullscreen, BsFullscreenExit, BsArrowClockwise , BsArrowLeftCircleFill, BsArrowRightCircleFill, BsEye} from "react-icons/bs";
import { MdOutlineClose, MdOutlineSearch } from "react-icons/md";
import { toggleSidebar, toggleSidebarSmall } from "../../redux/actions/common.action";
import { getliveActivity, getRecoredActivity, deleteRecoredActivity } from "../../redux/actions/activity.action";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { socket, refreshSocket, currentMemberProfile } from "../../helpers/auth";
import { getMemberdata, showAmPmtime, generateTimeRange, convertSecondstoTime } from "../../helpers/commonfunctions";
import DatePicker from "react-multi-date-picker";
import "media-chrome";
import "media-chrome/dist/menu";

function TimeTrackingPage() {
  const memberProfile = currentMemberProfile()
  let totalhours = 0;
  let totalProjecthours = 0
  const currentMember = getMemberdata();
  const [spinner, setSpinner] = useState(false)
  const [activityspinner, setActSpinner] = useState(false)
  const [isActive, setIsActive] = useState(false);
   const [isActiveView, setIsActiveView] = useState(2);
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [ recordedRefresh, setRecordedRefresh ] = useState(true)
  const handleSidebar = () => dispatch(toggleSidebar(commonState.sidebar_open ? false : true))
  const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
  const commonState = useSelector(state => state.common)
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
  const [currentVideoPage, setCurrentVideoPage] = useState({});
  const videosPerPage = 12; // Adjust as needed
  
  const [selectedFilter, setSelectedFilter ] = useState('today')
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showSearch, setSearchShow] = useState(false);
  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);

  const videoRef = useRef(null);
  const videoPlyrRef = useRef(null)

  const [selectedScreenshots, setSelectedScreenshots] = useState({});

  const handleSelectRecording = (activityId, index) => {
    setSelectedScreenshots(prev => {
      const selectedForActivity = prev[activityId] || [];
      const isSelected = selectedForActivity.includes(index);
  
      return {
        ...prev,
        [activityId]: isSelected
          ? selectedForActivity.filter(i => i !== index)
          : [...selectedForActivity, index]
      };
    });
  };

  const deleteRecordedData  = () => {
    dispatch(deleteRecoredActivity({
      type: screenshotTab.toLowerCase(),
      data: selectedScreenshots
    }))
  }

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

    if( memberProfile?.permissions?.tracking?.view_others === true && memberProfile?.permissions?.tracking?.selected_members?.length > 0){
      selectedfilters = { ...selectedfilters, ['selected_members']: memberProfile?.permissions?.tracking?.selected_members  }
    }else{
      selectedfilters = { ...selectedfilters, ['selected_members']: [memberProfile?._id]  }
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
    if(currentActivity !== false && activeTab === "Live" || currentActivity !== false && activeInnerTab === "InnerLive"){ 
        setSpinner( false )
        startsharing(currentActivity._id, currentActivity?.latestActivity?.status);
    }
    if(currentActivity !== false && activeInnerTab === "InnerRecorded" && recordedRefresh === true || currentActivity !== false && activeTab === "Recordings" && recordedRefresh === true){
      // setActiveInnerTab("InnerRecorded")
      handleRecordedActivity()
    }
    if(currentActivity?.latestActivity?.status === false){
      setActSpinner( false )
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
                urls: 'turn:13.51.172.133:3478',
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
          if(event.stream && videoRef.current){
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
      setSelectedScreenshots({})
      setRecordedActivities(activitystate?.recordedActivity)
    }

    if(activitystate.success){
      handleRecordedActivity()
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
          {/* <ListGroup.Item key="filter-key-5" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
            <Form className="search-filter-list">
              <Form.Group className="mb-0 form-group">
                <MdOutlineSearch />
                <Form.Control type="text" name="search" placeholder="Search by name" />
              </Form.Group>
            </Form>
          </ListGroup.Item> */}
        </>
      )
    } else {
      return (
        <>
          {/* <ListGroup.Item key="filter-key-6" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('tracker_status', event.target.value)} value={filters['status'] || 'all'}>
                <option value="all">View All</option>
                <option value="active">Active</option>
                <option value="pause">Paused</option>
                <option value="inactive">Inactive</option>
            </Form.Select>
            
          </ListGroup.Item>
          <ListGroup.Item key="filter-key-7" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
            <Form className="search-filter-list">
              <Form.Group className="mb-0 form-group">
                <MdOutlineSearch />
                <Form.Control type="text" name="search" placeholder="Search by name" onChange={(event) => handlefilterchange('search', event.target.value)} />
              </Form.Group>
            </Form>
          </ListGroup.Item> */}
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

  const showDate = () => {
    // if (activeInnerTab === 'InnerRecorded') {
      return (
        <>
          <ListGroup.Item className="no--style">
            <Form className="d-flex align-items-center">
              <Form.Group className="mb-0 form-group me-2">
                <Dropdown className="select--dropdown">
                  <Dropdown.Toggle variant="success">Today</Dropdown.Toggle>
                  <Dropdown.Menu>
                    <div className="drop--scroll">
                      <Dropdown.Item className="selected--option" href="#/action-1">Today</Dropdown.Item>
                      <Dropdown.Item href="#/action-1">Yesterday</Dropdown.Item>
                      <Dropdown.Item href="#/action-1">Last 7 days</Dropdown.Item>
                      <Dropdown.Item href="#/action-1">Last week</Dropdown.Item>
                      <Dropdown.Item href="#/action-1">Last 2 weeks</Dropdown.Item>
                      <Dropdown.Item href="#/action-1">This month</Dropdown.Item>
                      <Dropdown.Item href="#/action-1">Last month</Dropdown.Item>
                      <Dropdown.Item href="#/action-1">Custom</Dropdown.Item>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
                {/* <Form.Select className="custom-selectbox">
                  <option selected>Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="Last 7 days">Last 7 days</option>
                  <option value="Last week">Last week</option>
                  <option value="Last 2 weeks">Last 2 weeks</option>
                  <option value="This month">This month</option>
                  <option value="Last month">Last month</option>
                  <option value="custom">Custom</option>
                </Form.Select> */}
              </Form.Group>
              {/* <Form.Group className="mb-0 form-group">
                <DatePicker 
                    key={'date-filter'}
                    ref={datePickerRef}
                    name="date"
                    weekStartDayIndex={1}
                    id='datepicker-filter'
                    value={filtereddate} 
                    format="YYYY-MM-DD"
                    range
                    multiple={false}
                    numberOfMonths={2}
                    dateSeparator=" - " 
                    onChange={async (value) => {
                        // setFilteredDate(value)
                        const formatDate = (date) => {
                          const d = new Date(date);
                          const year = d.getFullYear();
                          const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                          const day = String(d.getDate()).padStart(2, '0');
                          return `${year}-${month}-${day}`;
                        };

                        if (Array.isArray(value)) {
                          const formatted = value.map(formatDate);
                          setFilteredDate(formatted);
                        } else {
                          const formatted = formatDate(value);
                          setFilteredDate(formatted);
                        }
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
              </Form.Group> */}
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
              <ListGroup horizontal className="bg-light">
                {
                  selectedScreenshots &&
                  Object.keys(selectedScreenshots).length > 0 &&
                  Object.values(selectedScreenshots).some(arr => arr.length > 0) && (
                    <Button variant="secondary" className="btn--view" key={'delete-group'} active={true} onClick={() => deleteRecordedData()}>
                      Delete Selected
                    </Button>
                  )
                }
                <Button variant="secondary" className="btn--view" key={'screenshots1-tab-key'} active={screenshotTab === "Screenshots"} onClick={() => setScreenshotTab("Screenshots")}>
                  Screenshots
                </Button>
                <Button variant="primary" className="btn--view" key={'videos1-tab-key'} active={screenshotTab === "Videos"} onClick={() => setScreenshotTab("Videos")}>
                  Videos
                </Button>
              </ListGroup>
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
        carousel={{ finite: postMedia.length === 1 }}
        on={{
          click: () => fullscreenRef.current?.enter(),
        }}
        render={{
          slide: ({slide}) => {
            if (slide?.type === "video") {
              return (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <media-controller>
                    <video
                      slot="media"
                      id="videoElement"
                      src={slide.src}
                      crossorigin
                      type="video/webm"
                      style={{ maxHeight: "90vh", maxWidth: "100%" }}
                    >
                      
                    </video>
                    <media-settings-menu hidden anchor="auto">
                      <media-settings-menu-item>
                        Speed
                        <media-playback-rate-menu slot="submenu" hidden rates="1 1.25 1.5 1.75 2 2.50 3 3.50 4 4.50 5 6 7 8 9 10">
                          <div slot="title">Speed</div>
                        </media-playback-rate-menu>
                      </media-settings-menu-item>
                      <media-settings-menu-item>
                        Quality
                        <media-rendition-menu slot="submenu" hidden>
                          <div slot="title">Quality</div>
                        </media-rendition-menu>
                      </media-settings-menu-item>
                    </media-settings-menu>
                    <media-control-bar>
                    <media-play-button></media-play-button>
                       <media-seek-backward-button seekoffset="10"></media-seek-backward-button>
                      <media-seek-forward-button seekoffset="10"></media-seek-forward-button>
                      <media-time-display></media-time-display>
                      <media-time-range></media-time-range>
                      <media-duration-display></media-duration-display>
                      <media-pip-button></media-pip-button>
                      <media-fullscreen-button></media-fullscreen-button>
                      <media-settings-menu-button></media-settings-menu-button>
                    </media-control-bar>
                  </media-controller>
                </div>
              );
            }
            return null; // Default render for images will be used
          },
        }}
      />

      <div className={isActive ? "show--details team--page" : "team--page"}>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  <span className="open--sidebar me-3 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>Activity
                  {/* <Button variant="primary" className={isActive ? 'd-flex ms-auto' : 'd-lg-none'} onClick={handleSearchShow}><MdSearch /></Button>
                  <Button variant="primary" className={isActive ? 'd-flex' : 'd-xl-none'} onClick={handleFilterShow}><MdFilterList /></Button> */}
                  <ListGroup horizontal className={isActive ? "d-none" : "activity--tabs ms-auto"}>
                    <ListGroup horizontal>
                        <ListGroup.Item action active={activeTab === "Live"} onClick={() => {
                          if( currentActivity && Object.keys(currentActivity)){
                            const cact = currentActivity
                            leaveRoom(currentActivity?._id)
                            setCurrentActivity(cact);
                          }
                          setActiveTab("Live")}}>Live
                        </ListGroup.Item>
                        <ListGroup.Item action active={activeTab === "Recordings"} onClick={() => {setActiveTab("Recordings")}}>Recorded</ListGroup.Item>
                    </ListGroup>
                    {showTabs()}
                    <ListGroup.Item key="filter-key-6" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
                      <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('tracker_status', event.target.value)} value={filters['status'] || 'all'}>
                          <option value="all">View All</option>
                          <option value="active">Active</option>
                          <option value="pause">Paused</option>
                          <option value="inactive">Inactive</option>
                      </Form.Select>
                      
                    </ListGroup.Item>
                    <ListGroup.Item key="filter-key-7" className={isActive ? 'd-none' : 'd-none d-xl-flex'}>
                      <Form className="search-filter-list">
                        <Form.Group className="mb-0 form-group">
                          <MdOutlineSearch />
                          <Form.Control type="text" name="search" placeholder="Search by name" onChange={(event) => handlefilterchange('search', event.target.value)} />
                        </Form.Group>
                      </Form>
                    </ListGroup.Item>
                    
                    <ListGroup horizontal className="bg-white expand--icon ms-3">
                        <ListGroup.Item onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                        <ListGroup.Item className="refresh--btn btn btn-primary d-none d-md-flex">
                          <BsArrowClockwise onClick={handleLiveActivityList}/>
                        </ListGroup.Item>
                    </ListGroup>
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
                  <img src="images/OnTeam-icon.png" className="flipchar" />
              </div>
          }
          <Container fluid className="pt-2 py-3">
            {activeTab === "Live" && (
              <>
                <div className="activity--stats">
                  <Row>
                    <Col className="card--stack">
                      <Card className="text--green">
                        <Card.Body>
                          <Card.Title><span>Active</span>2</Card.Title>
                          <Card.Text><FiMonitor /></Card.Text>
                        </Card.Body>
                      </Card>
                      <Card className="text--orange">
                        <Card.Body>
                          <Card.Title><span>On Break</span>2</Card.Title>
                          <Card.Text><FiCoffee /></Card.Text>
                        </Card.Body>
                      </Card>
                      <Card className="text--gray">
                        <Card.Body>
                          <Card.Title><span>Inactive</span>1</Card.Title>
                          <Card.Text><FiUserX /></Card.Text>
                        </Card.Body>
                      </Card>
                      <Card className="text--blue">
                        <Card.Body>
                          <Card.Title><span>Total Hours</span>24.0h</Card.Title>
                          <Card.Text><FiClock /></Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
                {/* <p className="d-flex d-lg-none">Total Hours <strong className="ms-auto">50 Hrs</strong></p> */}
                <div className="attendance--table activity--table--list">
                  <div className='attendance--table--list'>
                    <Table>
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
                                        <div className="d-flex justify-content-between">
                                          <div className="project--name d-flex justify-content-md-between gap-3 align-items-center">
                                              <div className="title--initial">{activity.name.charAt(0)}</div>
                                              <div className="title--span flex-column d-flex align-items-start gap-0">
                                                <span>
                                                  {activity.name}
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
                                                  <strong key={`project-title-${activity?._id}`} className="project--title--td">{ activity?.latestActivity?.project?.title || '--' }</strong>
                                              </div>
                                          </div>
                                        </div>
                                    </td>
                                    <td className="ms-auto">
                                      <div className="d-flex align-items-center gap-3 mt-3 mt-xl-0 gap-xl-5 flex-wrap">
                                        {/* <div key={`task-name-${activity?._id}`} className="onHide project--title--td"><span>{ activity?.latestActivity?.task?.title?.substring(0, 25) || '--' }</span></div> */}
                                        <div key={`task-time-${activity?._id}`} className="onHide"><strong>Project Time: </strong>{ convertSecondstoTime(activity?.latestActivity?.duration || 0) || '00:00'}</div>
                                        <div key={`total-time-${activity?._id}`} className="onHide"><strong>Total Time: </strong>{ convertSecondstoTime(activity?.totalDuration || 0) || '00:00'}</div>
                                        <div key={`status-title-${activity?._id}`} className="onHide">
                                          { 
                                            (activity?.latestActivity?.status) ? 
                                            <Badge bg="success">Active</Badge> : 
                                            (activity?.latestActivity?.status === false ) ?
                                            <Badge bg="warning">Break</Badge>
                                            :
                                            <Badge bg="secondary">Inactive</Badge>
                                            }
                                        </div>
                                        <div key={`view-act-${activity?._id}`} className="onHide text-lg-end">
                                          <Button variant="primary" onClick={() => {handleClick(activity);}}><FaEye/> View Activity</Button>
                                        </div>
                                      </div>
                                    </td>
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
                        {/* <tr className="onHide bg-light mobile--hide" key={'hiddenkey'}>
                          <td></td>
                          <td></td>
                          <td><strong>Total Hours</strong></td>
                          <td><strong>
                            { formatTime(totalProjecthours) || '00:00'}
                            </strong></td>
                          <td><strong>
                           { formatTime(totalhours) || '00:00'}
                            </strong></td>
                          <td></td>
                          <td></td>
                        </tr> */}
                      </tbody>
                    </Table>
                  </div>
                </div>
                
              </>
            )}
            {activeTab === "Recordings" && (
              <>
                {/* <p className="d-flex d-lg-none">Total Hours <strong className="ms-auto">50 Hrs</strong></p> */}
                <div className="attendance--table activity--table--list">
                  <div className='attendance--table--list'>
                    <Table>
                      <tbody>
                      {
                          liveactivities.length > 0 ?
                            liveactivities.map((activity, index) => {
                              totalhours += Number(activity?.totalTaskDuration || 0)
                            
                              return (
                                <>
                                  <tr key={`activity-row-${index}`} className={ (currentActivity && currentActivity?._id === activity._id ) ? 'active': '' } >
                                    {/* <td key={`index-${index}`}>{index + 1} </td> */}
                                    <td data-label="Member Name" className="project--title--td" onClick={() => {
                                          // if (isActive) {
                                          //   setCurrentActivity(activity);
                                          // }
                                          if (isActive && activeInnerTab !== "InnerRecorded" || isActive && activeTab !== "Recordings") {
                                            leaveRoom(currentActivity?._id)
                                            socket.emit('get-tracker-status-update', {userID: activity._id})
                                            setCurrentActivity(activity);
                                          }else if(activeInnerTab === "InnerRecorded" ||  activeTab === "Recordings"){
                                            setRecordedRefresh( true )
                                            setCurrentActivity(activity)
                                          }
                                      }} >
                                        <div className="d-flex justify-content-between">
                                          <div className="project--name d-flex justify-content-md-between gap-3 align-items-center">
                                              <div className="title--initial">{activity.name.charAt(0)}</div>
                                              <div className="title--span flex-column d-flex align-items-start gap-0">
                                                <span>
                                                  {activity.name}
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
                                                  <strong key={`project-title-${activity?._id}`} className="project--title--td">{ activity?.latestActivity?.project?.title || '--' }</strong>
                                              </div>
                                          </div>
                                        </div>
                                    </td>
                                    <td className="ms-auto">
                                      <div className="d-flex align-items-center gap-5">
                                        <div className="onHide"><strong>Total Time: </strong>{ convertSecondstoTime(activity?.totalTaskDuration || 0) || '00:00'}</div>
                                        <div className="onHide text-lg-end">
                                          <Button variant="primary" onClick={() => {handleClick(activity);}}><FaEye/> View Activity</Button>
                                        </div>
                                      </div>
                                    </td>
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
                  </div>
                </div>
                
              </>
            )}
          </Container>
        </div>
      </div>
      <div className="details--wrapper common--project--grid">
        <div className="wrapper--title py-2 bg-white border-bottom">
            <div className="projecttitle">
              {/* <h3>
                  <strong>Alex Chen</strong>
                  <span>E-commerce Platform</span>
              </h3> */}
              <Dropdown>
                  <Dropdown.Toggle variant="link" id="dropdown-basic">
                      <h3>
                          <strong>Alex Chen</strong>
                          <span>E-commerce Platform</span>
                      </h3>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                      <div className="drop--scroll">
                          <Dropdown.Item>
                            <strong>Alex Chen</strong>
                            <span>E-commerce Platform</span>
                          </Dropdown.Item>
                      </div>
                  </Dropdown.Menu>
              </Dropdown>
          </div>
          <ListGroup horizontal className="live--tabs me-auto">
            <ListGroup horizontal className="bg-light me-3">
              <Button variant="secondary" className="btn--view" key={'live-key'} active={activeInnerTab === "InnerLive"} onClick={() => {setActiveInnerTab("InnerLive")
                if( currentActivity && Object.keys(currentActivity)){
                  const cact = currentActivity
                  leaveRoom(currentActivity?._id)
                  startsharing(currentActivity?._id, currentActivity?.latestActivity?.status)
                }
                }}>
                Live
              </Button>
              <Button variant="primary" className="btn--view" key={'recored-key'} active={activeInnerTab === "InnerRecorded"} onClick={() => {setActiveInnerTab("InnerRecorded")
                if( currentActivity && Object.keys(currentActivity)){
                  leaveRoom(currentActivity?._id)
                }
              }}>
                Recorded
              </Button>
            </ListGroup>
            
            {
              activeInnerTab === "InnerRecorded" && showDate()
            }
          </ListGroup>
          <ListGroup horizontal className="ms-auto p-0">
            {showRecordedTabs()}
            <ListGroup horizontal className="bg-white expand--icon ms-3 p-0 b-0 rounded-0 align-items-center">
              <ListGroup.Item onClick={handleSidebar} className="d-none d-sm-flex"><GrExpand /></ListGroup.Item>
              <ListGroup.Item className="list-group-item refresh--btn list-group-item-action d-none d-md-flex">
                <BsArrowClockwise onClick={handleRecordedActivity}/>
              </ListGroup.Item>
              <ListGroup.Item className="btn btn-primary" key={'closekey'} onClick={() => { socket.emit('leaveRoom', socket.id, currentActivity?._id ); setCurrentActivity(false); setIsActive(false);}}>
                <MdOutlineClose />
              </ListGroup.Item>
            </ListGroup>
          </ListGroup>
        </div>
        <div className={isScreenActive ? 'rounded--box activity--box fullscreen--box' : 'rounded--box activity--box'}>
          {
              activityspinner &&
              <div className="loading-bar">
                  <img src="images/OnTeam-icon.png" className="flipchar" />
              </div>
          }
          {activeInnerTab === "InnerLive" && (
            <>
              <div className="current--player p-3" key={`activity-${currentActivity?._id}`}>
                <div className="timer--task">
                  
                  <h5 key={`project-task-title-for-${currentActivity?.latestActivity?._id}`}>{ currentActivity?.latestActivity?.project?.title || '--' } [{currentActivity?.latestActivity?.project?.client?.name}] - <small>{ currentActivity?.latestActivity?.task?.title || '--' }</small></h5>
                  <span className="ms-md-3">{ currentActivity?.latestActivity?.app_version}</span>
                  <p className="task--timer">
                    <span><strong>{ convertSecondstoTime(currentActivity?.totalTaskDuration) || '00:00'}</strong></span>
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
            <Accordion>
              {
                recordedactivities && recordedactivities.length > 0 ? 
                  recordedactivities.map((recording, index) => {
                    return (
                    <>
                    
                    <Accordion.Item eventKey={`screenshot-${recording?._id}-${index}`}>
                      <div className="screens--tabs">
                      
                        <Accordion.Header>
                          <p>
                            <span>{recording?.project?.title} [{recording?.project?.client?.name}]</span>
                            <strong>{new Date(recording?.createdAt).toLocaleDateString('en-GB', options)}</strong>
                            <strong>{ generateTimeRange(recording?.createdAt, recording?.duration)}</strong>
                            <strong className="activity-type-text">Activity Type: {recording?.type }</strong>
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
                                        { (screenshotData?.is_deleted !== true && memberProfile?.permissions?.tracking?.delete_recordings === true && memberProfile?._id === recording?.member) && 
                                          <div className="d-flex justify-content-between align-items-start">
                                            <Form.Check
                                              type="checkbox"
                                              checked={selectedScreenshots[recording?._id]?.includes(j) || false}
                                              onChange={() => handleSelectRecording(recording?._id, j)}
                                            />
                                          </div>
                                        }
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
                                if (screenshotTab === "Videos" && meta.meta_key === "videos" && meta.meta_value.length > 0) {
                                  return (
                                    <>
                                      {meta.meta_value
                                        .slice(
                                          ((currentVideoPage[recording?._id] || 1) - 1) * videosPerPage,
                                          (currentVideoPage[recording?._id] || 1) * videosPerPage
                                        )
                                        .map((videoData, j) =>
                                          videoData?.is_deleted === true ? (
                                            <Card key={`blank-card-${recording?._id}-${currentVideoPage[recording?._id] || 1}-${j}`}>
                                              <Card.Body>
                                                <img
                                                  className="card-img-top"
                                                  src={videoData.url}
                                                  alt="screenshot"
                                                />
                                                <p>
                                                  <strong>Task Name:</strong> {videoData?.task_data?.title} <br />
                                                  <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                                </p>
                                              </Card.Body>
                                            </Card>
                                          ) :
                                          videoData?.url === 'video_disabled' ? (
                                            <Card key={`blank-card-${recording?._id}-${currentVideoPage[recording?._id] || 1}-${j}`}>
                                              <Card.Body>
                                                <img
                                                  className="card-img-top"
                                                  src="https://onteams-bucket.s3.eu-north-1.amazonaws.com/images/5H2J6.jpg"
                                                  alt="screenshot"
                                                />
                                                <p>
                                                  <strong>Task Name:</strong> {videoData?.task_data?.title} <br />
                                                  <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                                </p>
                                              </Card.Body>
                                            </Card>
                                          ) : (
                                            <Card key={`video-card-${recording?._id}-${currentVideoPage[recording?._id] || 1}-${j}`}>
                                              <Card.Body onClick={() => handleLightBox('video', meta.meta_value, j)}>
                                              { videoData?.is_deleted !== true && memberProfile?.permissions?.tracking?.delete_recordings === true && memberProfile?._id === recording?.member && 
                                                <div className="d-flex justify-content-between align-items-start">
                                                  <Form.Check
                                                    type="checkbox"
                                                    checked={selectedScreenshots[recording?._id]?.includes(j) || false}
                                                    onChange={() => handleSelectRecording(recording?._id, j)}
                                                  />
                                                </div>
                                              }
                                                <video
                                                  height="175px"
                                                  preload="metadata"
                                                  muted
                                                  onLoadedMetadata={(e) => (e.target.currentTime = 0.1)}
                                                  controls={false}
                                                >
                                                  <source src={videoData?.url} type="video/webm" />
                                                  Your browser does not support the video tag.
                                                </video>
                                                <p>
                                                  <strong>Task Name:</strong> {videoData?.task_data?.title} <br />
                                                  <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                                </p>
                                              </Card.Body>
                                            </Card>
                                          )
                                        )}

                                
                                      {/* Pagination Controls */}
                                      <div style={{ marginTop: "10px", textAlign: "center" }}>
                                        <Button variant="outline-primary"
                                          disabled={(currentVideoPage[recording?._id] || 1) === 1}
                                          onClick={() =>
                                            setCurrentVideoPage((prev) => ({
                                              ...prev,
                                              [recording?._id]: (prev[recording?._id] || 1) - 1,
                                            }))
                                          }
                                        >
                                          <BsArrowLeftCircleFill />
                                        </Button>
                                
                                        <span style={{ margin: "0 10px" }}>
                                          Page {currentVideoPage[recording?._id] || 1} of {Math.ceil(meta.meta_value.length / videosPerPage)}
                                        </span>
                                
                                        <Button variant="outline-primary"
                                          disabled={(currentVideoPage[recording?._id] || 1) >= Math.ceil(meta.meta_value.length / videosPerPage)}
                                          onClick={() =>
                                            setCurrentVideoPage((prev) => ({
                                              ...prev,
                                              [recording?._id]: (prev[recording?._id] || 1) + 1,
                                            }))
                                          }
                                        >
                                          <BsArrowRightCircleFill />
                                        </Button>
                                      </div>
                                    </>
                                  );
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