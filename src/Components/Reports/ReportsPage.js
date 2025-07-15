import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/dist/styles.css";
import { Container, Row, Col, Button, Form, ListGroup, Modal, Card, Dropdown, CardGroup, Badge, Table, ListGroupItem, Pagination } from "react-bootstrap";
import Fullscreen  from "yet-another-react-lightbox/dist/plugins/fullscreen";
import { FaRegEdit, FaCheck, FaAngleRight, FaPlus, FaTrash, FaEye } from "react-icons/fa";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill} from "react-icons/bs";
import { showAmPmtime, getMemberdata, selectboxObserver } from "../../helpers/commonfunctions";
import { LuFolderOpen } from 'react-icons/lu';
import { MdDragIndicator, MdOutlineClose } from "react-icons/md";
import { FiSidebar } from "react-icons/fi";
import { AiOutlineTeam } from 'react-icons/ai';
import { GrExpand } from "react-icons/gr";
import { TbReport } from 'react-icons/tb';
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import { getReportsByMember, gerReportsByProject,  getSingleProjectReport, addRemarkstoProject } from "../../redux/actions/report.action";
import { Listmembers } from "../../redux/actions/members.action";
import { ListProjectsByMembers, ListMemberProjects } from "../../redux/actions/project.action";
import DatePicker from "react-multi-date-picker";
import { ListTasks } from "../../redux/actions/task.action";
import { currentMemberProfile } from "../../helpers/auth";
import { Link } from "react-router-dom";
import "media-chrome";
import "media-chrome/dist/menu"

const TaskList = ({report} ) => {
  const [ViewReport, setViewReport] = useState(false);
  const [showRemarks, setShowRemarks] = useState(false);
  const [activeTab, setActiveTab] = useState("screenshots");
  const [reportopen, setReportOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState([]);
   const fullscreenrefrence = React.useRef(null);
  const [taskId, setTaskId] = useState('')
  const [currentVideoPage, setCurrentVideoPage] = useState({});
  const videosPerPage = 12; // Adjust as needed

    let screenshotsByTask = {};
let videosByTask = {};



  if(Array.isArray(report?.activityMetas) && report.activityMetas.length > 0 ){
    const screenshots = {};
  const videos = {};
    report.activityMetas.forEach((meta) => {
    if (meta.meta_key === "screenshots" && Array.isArray(meta.meta_value)) {
      meta.meta_value.forEach((screenshot) => {
        if (!screenshot.task) return;
        if (!screenshots[screenshot.task]) screenshots[screenshot.task] = [];
        screenshots[screenshot.task].push(screenshot);
      });
    }

    if (meta.meta_key === "videos" && Array.isArray(meta.meta_value)) {
      meta.meta_value.forEach((video) => {
        if (!video.task) return;
        if (!videos[video.task]) videos[video.task] = [];
        videos[video.task].push(video);
      });
    }
  });

  // Sort screenshots by taken_time (ISO timestamp string)
  Object.values(screenshots).forEach(arr =>
    arr.sort((a, b) => new Date(a.taken_time) - new Date(b.taken_time))
  );

  // Sort videos by parsing start_time (like "7:01 AM") into Date objects for sorting
  Object.values(videos).forEach(arr =>
    arr.sort((a, b) => {
      const parseTime = (timeStr) => {
        const today = new Date();
        const [hourMinute, ampm] = timeStr.split(" ");
        let [h, m] = hourMinute.split(":").map(Number);
        if (ampm === "PM" && h !== 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return new Date(today.setHours(h, m, 0, 0));
      };
      return parseTime(a.start_time) - parseTime(b.start_time);
    })
  );

  videosByTask = videos
  screenshotsByTask = screenshots

}


const groupTasksById = (activities) => {
  
  const groupedTasks = activities.reduce((acc, activity) => {
    (activity.tasks || []).forEach((t) => {
      if (!t.task || !t.task._id) return; // skip if task is missing

      const taskId = t.task._id;

      if (!acc[taskId]) {
        acc[taskId] = {
          taskId: taskId,
          title: t.task.title,
          tab: t.task.tab,
          duration: 0
        };
      }

      if (t.duration) {
        acc[taskId].duration += t.duration;
      }
    });

    return acc;
  }, {});

  

  // Format durations into "Xh Ym" or "Z secs"
  return Object.values(groupedTasks).map((task) => {
    const totalSeconds = task.duration;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    task.duration =
      totalSeconds < 60
        ? `${seconds} secs`
        : `${hours}h ${minutes.toString().padStart(2, "0")}m`;

    return task;
  });





};

const handleReportClose = () => setViewReport(false);
 
  const handleViewReport = (taskId) => { 
    setTaskId( taskId)
    setViewReport(true);
  }

  // Group tasks by title and calculate total durations
  const groupedTasks = groupTasksById(report?.activities);
  
  const handleRemarksClose = () => setShowRemarks(false);
  const handleShowRemarks = () => setShowRemarks(true);
  


  const triggerLightBox = (type, mediaItems, index) => {
    setSlideIndex(index);
    const slides =
    Array.isArray(mediaItems) && mediaItems.length > 0
      ? mediaItems.map((item) => {
          if (type === "video" && item.task === taskId) {
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
          }else if(type === "screenshot" && item.task === taskId){
            return { type: "image", src: item.url }; // Default case for images
          }
          return null;
        }).filter(Boolean)
      : [];

    // const data = slides;
    setLightboxMedia(slides)
    setReportOpen(true)
  }

  const gettaskTab = (tabid) => { 
    if( report?.project?.workflow?.tabs?.length > 0){
      const matchedTabTitle = report.project.workflow.tabs.find(tab => tab._id === tabid)?.title;
      return <Badge bg="warning">{matchedTabTitle}</Badge>
    }
    return null;
  }

  return (
    <>
      <Lightbox
        open={reportopen}
        close={() => setReportOpen(false)}
        slides={lightboxMedia}
        plugins={[Fullscreen]}
        fullscreen={{ ref: fullscreenrefrence }}
        carousel={{ finite: lightboxMedia.length === 1 }}
        index={slideIndex}
        on={{
          click: () => fullscreenrefrence.current?.enter(),
        }}
        render={{
          slide: ({slide}) => {
            if (slide?.type === "video") {
              return (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <media-controller>
                      <video
                        slot="media"
                        src={slide.src}
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
                        <media-time-range slot="center-controls"></media-time-range>
                        <media-duration-display></media-duration-display><media-pip-button></media-pip-button>
                        <media-fullscreen-button></media-fullscreen-button>
                        <media-settings-menu-button></media-settings-menu-button>
                      </media-control-bar>
                    </media-controller>
                  {/* <video
                    controls
                    autoPlay={false}
                    style={{ maxHeight: "90vh", maxWidth: "100%" }}
                  >
                    <source src={slide.src} type="video/webm" />
                    Your browser does not support the video tag.
                  </video> */}
                </div>
              );
            }
            return null; // Default render for images will be used
          },
        }}
      />
      <ul>
        {groupedTasks?.map((taskData, index) => (
          <li key={`grouped-task-${index}`}>
            <p className="mb-0">
              <FaAngleRight /> {taskData.title}
            </p>
            {/* <strong>{taskData.duration}</strong> */}
            {/* {
              gettaskTab(task.tab)
            } */}
            <Button variant="primary" className="mt-3" onClick={() => {handleViewReport(taskData?.taskId)}}><FaEye/> View Report</Button>
            {/* <Button variant="info" className="mt-3 ms-3" onClick={() => {handleShowRemarks()}}><TbReport /> View Remarks</Button> */}
          </li>
        ))}
      </ul>
      {ViewReport && 
        <Modal show={ViewReport} onHide={handleReportClose} centered size="lg" key={`reports-${taskId}`} className="timeSheetModal">
          <Modal.Header closeButton>
            <ListGroup horizontal>
              <ListGroup.Item action active={activeTab === "screenshots"} onClick={() => setActiveTab("screenshots")}>
                Screenshots
              </ListGroup.Item>
              <ListGroup.Item action active={activeTab === "videos"} onClick={() => setActiveTab("videos")}>
                Videos
              </ListGroup.Item>
            </ListGroup>
          </Modal.Header>
          <Modal.Body>
            <div className="shots--list">
              <CardGroup key={`card-group-${taskId}`}>
            {/* {
              report?.activityMetas && report.activityMetas.length > 0 ? (
              report.activityMetas.map((meta, i) => {
                // Handle screenshots tab
                if (activeTab === "screenshots" && meta.meta_key === 'screenshots' && meta.meta_value.length > 0) {
                  let idx = 0
                  return meta.meta_value.map((screenshotData, j) => {
                    if(screenshotData?.task !== taskId){ return <></>}else{
                      const currentIdx = idx;
                      idx++;
                    return (
                      <>
                        <Card key={`task-card-${taskId}-${j}`}>
                              <Card.Body>
                                <img
                                  className="card-img-top"
                                  src={screenshotData?.url}
                                  alt="screenshot"
                                  onClick={() => triggerLightBox('screenshot', meta.meta_value, currentIdx)}
                                />
                                <p>
                                  <strong>Task Name:</strong> {screenshotData?.task_data?.title} <br />
                                  <strong>Time:{showAmPmtime(screenshotData?.taken_time)}</strong>
                                </p>
                              </Card.Body>
                            </Card>
                            
                      </>
                    )}
                  });
                }
                if (activeTab === "videos" && meta.meta_key === 'videos' && meta.meta_value.length > 0) {
                  let idx = 0
                  
                  return (
                    <>
                      {meta.meta_value
                        .slice(
                          ((currentVideoPage[`single-${report?.project?._id}`] || 1) - 1) * videosPerPage,
                          (currentVideoPage[`single-${report?.project?._id}`] || 1) * videosPerPage
                        )
                        .map((videoData, j) => { console.log(`${videoData.task} !== ${taskId}`)
                          if(videoData.task !== taskId){return null}else{
                                const currentIdx = idx;
                                idx++;
                                return (
                              <Card key={`video-card-${report?.project?._id}-${currentVideoPage[`single-${report?.project?._id}`] || 1}-${j}`}>
                                <Card.Body onClick={() => triggerLightBox("video", meta.meta_value, currentIdx)}>
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
                                    <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                                    <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                  </p>
                                </Card.Body>
                              </Card>
                            )
                          }
                      })}
                
                      <div style={{ marginTop: "10px", textAlign: "center" }}>
                        <Button variant="outline-primary"
                          disabled={(currentVideoPage[`single-${report?.project?._id}`] || 1) === 1}
                          onClick={() =>
                            setCurrentVideoPage((prev) => ({
                              ...prev,
                              [`single-${report?.project?._id}`]: (prev[`single-${report?.project?._id}`] || 1) - 1,
                            }))
                          }
                        >
                          <BsArrowLeftCircleFill />
                        </Button>
                
                        <span style={{ margin: "0 10px" }}>
                          Page {currentVideoPage[`single-${report?.project?._id}`] || 1} of {Math.ceil(meta.meta_value.length / videosPerPage)}
                        </span>
                
                        <Button variant="outline-primary"
                          disabled={(currentVideoPage[`single-${report?.project?._id}`] || 1) >= Math.ceil(meta.meta_value.length / videosPerPage)}
                          onClick={() =>
                            setCurrentVideoPage((prev) => ({
                              ...prev,
                              [`single-${report?.project?._id}`]: (prev[`single-${report?.project?._id}`] || 1) + 1,
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
          } */}
          
          {activeTab === "screenshots" && screenshotsByTask[taskId]?.length > 0 && (
  <>
    {screenshotsByTask[taskId].map((screenshotData, idx) => (
      <Card key={`screenshot-${taskId}-${idx}`}>
        <Card.Body>
          <img
            className="card-img-top"
            src={screenshotData?.url}
            alt="screenshot"
            onClick={() => triggerLightBox("screenshot", screenshotsByTask[taskId], idx)}
          />
          <p>
            <strong>Task Name:</strong> {screenshotData?.task_data?.title}
            <br />
            <strong>Time:</strong> {showAmPmtime(screenshotData?.taken_time)}
          </p>
        </Card.Body>
      </Card>
    ))}
  </>
)}
{activeTab === "videos" && videosByTask[taskId]?.length > 0 && (() => {
  const taskVideos = videosByTask[taskId];
  const page = currentVideoPage[`single-${report?.project?._id}`] || 1;
  const start = (page - 1) * videosPerPage;
  const end = page * videosPerPage;
  const paginatedVideos = taskVideos.slice(start, end);

  return (
    <>
      {paginatedVideos.map((videoData, idx) => {
        const realIndex = start + idx;
        return (
          <Card key={`video-card-${report?.project?._id}-${page}-${idx}`}>
            <Card.Body onClick={() => triggerLightBox("video", taskVideos, realIndex)}>
              <video
                height="175px"
                style={{ width: "100%" }}
                preload="metadata"
                muted
                onLoadedMetadata={(e) => (e.target.currentTime = 0.1)}
                controls={false}
              >
                <source src={videoData?.url} type="video/webm" />
                Your browser does not support the video tag.
              </video>
              <p>
                <strong>Task Name:</strong> {videoData.task_data?.title}
                <br />
                <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
              </p>
            </Card.Body>
          </Card>
        );
      })}

      {/* Pagination */}
      {taskVideos.length > videosPerPage && (
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <Button
            variant="outline-primary"
            disabled={page === 1}
            onClick={() =>
              setCurrentVideoPage((prev) => ({
                ...prev,
                [`single-${report?.project?._id}`]: page - 1,
              }))
            }
          >
            <BsArrowLeftCircleFill />
          </Button>

          <span style={{ margin: "0 10px" }}>
            Page {page} of {Math.ceil(taskVideos.length / videosPerPage)}
          </span>

          <Button
            variant="outline-primary"
            disabled={page >= Math.ceil(taskVideos.length / videosPerPage)}
            onClick={() =>
              setCurrentVideoPage((prev) => ({
                ...prev,
                [`single-${report?.project?._id}`]: page + 1,
              }))
            }
          >
            <BsArrowRightCircleFill />
          </Button>
        </div>
      )}
    </>
  );
})()}

          </CardGroup>
          </div>
          </Modal.Body>
        </Modal>
      }

      { showRemarks &&
        <Modal show={showRemarks} onHide={handleRemarksClose} centered size="lg" className="theme--modal">
          <Modal.Header closeButton className="py-3">
            <Modal.Title>
                <span className="nav--item--icon"><TbReport /></span>
                <strong>Project Remarks <small>E-commerce Platform</small></strong>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="single--project--stack">
              <div className="d-flex justify-content-between mb-2 align-items-start">
                <div className="project--name d-flex gap-3 align-items-center">
                  <div className="title--initial">1</div>
                  <div className="title--span flex-column d-flex align-items-start gap-0"><span>Progress Update</span><strong>Monday, January 15, 2024</strong></div>
                </div>
                <Badge bg="secondary">Day 1</Badge>
              </div>
              <p className="mb-0">Started authentication module development. Initial setup completed successfully.</p>
            </div>
            <div className="single--project--stack">
              <div className="d-flex justify-content-between mb-2 align-items-start">
                <div className="project--name d-flex gap-3 align-items-center">
                  <div className="title--initial">2</div>
                  <div className="title--span flex-column d-flex align-items-start gap-0"><span>Progress Update</span><strong>Monday, January 15, 2024</strong></div>
                </div>
                <Badge bg="secondary">Day 2</Badge>
              </div>
              <p className="mb-0">Started authentication module development. Initial setup completed successfully.</p>
            </div>
            <div className="single--project--stack">
              <div className="d-flex justify-content-between mb-2 align-items-start">
                <div className="project--name d-flex gap-3 align-items-center">
                  <div className="title--initial">3</div>
                  <div className="title--span flex-column d-flex align-items-start gap-0"><span>Progress Update</span><strong>Monday, January 15, 2024</strong></div>
                </div>
                <Badge bg="secondary">Day 3</Badge>
              </div>
              <p className="mb-0">Started authentication module development. Initial setup completed successfully.</p>
            </div>
            <div className="single--project--stack">
              <div className="d-flex justify-content-between mb-2 align-items-start">
                <div className="project--name d-flex gap-3 align-items-center">
                  <div className="title--initial">4</div>
                  <div className="title--span flex-column d-flex align-items-start gap-0"><span>Progress Update</span><strong>Monday, January 15, 2024</strong></div>
                </div>
                <Badge bg="secondary">Day 4</Badge>
              </div>
              <p className="mb-0">Started authentication module development. Initial setup completed successfully.</p>
            </div>
          </Modal.Body>
        </Modal>
      }
    </>
  );
};






function ReportsPage() {
  const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
  const [isActive, setIsActive] = useState(false);
  const [activeMemberTab, setActiveViewTab] = useState('members'); 
  const commonState = useSelector(state => state.common)
  const dispatch = useDispatch()
  const memberProfile = currentMemberProfile()
  const datePickerRef = useRef(null)
  const manuldatePickerRef = useRef(null)
  const memberdata = getMemberdata()
  const fullscreenRef = React.useRef(null);
 
  const [ remarksActive ,setremarksActive] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [ loader, setLoader] = useState(false)
  
  const [showNew, setShowNew] = useState(false);
  const [spinner, setSpinner] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);

  const filterDisplayLabels = {
    today: 'Today',
    yesterday: 'Yesterday',
    '7days': 'Last 7 days',
    'last-week': 'Last week',
    'last2-weeks': 'Last 2 weeks',
    'this-month': 'This month',
    'last-month': 'Last month',
    'custom': 'Custom'
  };
  
  
  
  const handleRemarks = () => {
    setremarksActive(current => !current)
    if (selectedReport?.projectmeta && selectedReport.projectmeta.length > 0) {
      const remarksMeta = selectedReport.projectmeta.find(meta => meta.meta_key === "remarks");
    
      if (remarksMeta) {
        setRemarks(remarksMeta.meta_value);
      }
    }
  }
  const handleRemarksChange = (e) => {
    setRemarks(e.target.value)
  }
  // const handleShow = () => setShow(true);
  const handleNewShow = () => setShowNew(true);
  const memberFeed = useSelector((state) => state.member.members)
  const projectFeed = useSelector(state => state.project.projects);
  const [ projects, setProjects ] = useState([])
  
 
  const [singleMemberReport, setSingleMemberReport] = useState({})
  const taskFeed = useSelector(state => state.task.tasks);
  const [taskslists, setTasksLists] = useState([])
  const [members, setMembers] = useState([])
  const reportState = useSelector((state) => state.reports)
  const [memberReports, setMemberReports] = useState([])
  const[ projectReports, setProjectReports] = useState([])
  const [ singleprojectReport , setsingleProjectReport] = useState({})
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const [screenshotTab, setScreenshotTab] = useState('Screenshots');
  const [ selectedReport, setSelectedReport] = useState({})
  const [view, setView] = useState('group')
 
  const [ filtereddate, setFilteredDate ] = useState([new Date().toISOString().split('T')[0]])
  const [selectedFilter, setSelectedFilter ] = useState('today')
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postMedia, setPostMedia] = useState([]);
  const [ filters, setFilters] = useState({member: memberdata?._id, sort_by: 'members','project_status': 'in-progress', page: 1});
  const [ selectedproject, setSelectedProject] = useState('')
  const [ selectedTask, setSelectedTask] = useState('');
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
  
  
  
  const saveRemarks = (project_id) => {
    setLoader( true )
    const payload = { project_id: project_id, remarks: remarks, date: filtereddate }
    dispatch(addRemarkstoProject(payload))
  }

  const handlefilterchange = (name, value) => {
    setFilters({ ...filters, [name]: value })
    if( name === 'sort_by'){ 
      setTimeout(function(){
        selectboxObserver()
      },10)
    }
  }

  function getProjectSummary(memberReport, arg) {
    const projectCount = memberReport?.length;

    let totalDuration = 0;
    if(memberReport?.length > 0){
      memberReport.forEach(report => {
        report.activities.forEach(activity => {
            totalDuration += activity.duration || 0;
        });
    });
    }
    

    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    const formattedTime = `${hours}h ${minutes}m`;
    if( arg === 'both'){
      return {
        totalProjects: projectCount,
        totalTime: formattedTime
      };
    }else if(arg === 'project_count'){
      return projectCount
    }else if(arg === 'time'){
      return formattedTime
    }
    
}

function getProjectTabSummary(projectReport) {
    const membersCount = projectReport?.members?.length;

    let totalDuration = 0;
    if(projectReport?.members?.length > 0){
      projectReport.members.forEach(report => {
        report.activities.forEach(activity => {
            totalDuration += activity.duration || 0;
        });
    });
    }
    
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    const formattedTime = `${hours}h ${minutes}m`;
    //if( arg === 'both'){
      return {
        totalMembers: membersCount,
        totalTime: formattedTime
      };
   // }
    // else if(arg === 'project_count'){
    //   return projectCount
    // }else if(arg === 'time'){
    //   return formattedTime
    // }
    
}



  const handleListProjects = async () => {
    if( memberProfile?.role?.slug === "owner"){
        await dispatch(ListProjectsByMembers({members: 'all'}));
    }else{
      const members = Array.from(new Set([
        memberProfile?._id,
        ...(memberProfile?.permissions?.reports?.view_others
            ? (memberProfile?.permissions?.reports?.selected_members || [])
            : [])
      ].filter(Boolean)));
      
        await dispatch(ListProjectsByMembers({members: members}));
    }
    
      await dispatch(ListMemberProjects(memberdata?._id));
  }

  const handleReports = async () => {
    setSpinner(true)
    if( filters['sort_by'] === "members"){
      await dispatch(getReportsByMember(filters))
    }else{
     await dispatch(gerReportsByProject(filters))
    }
    setSpinner(false)
  }

  useEffect(() => {
    dispatch(Listmembers(0, '', false));
    handleListProjects()
    selectboxObserver()
  }, [dispatch])

  



  

  // Helper function to calculate time ranges
  
  useEffect(() => {
    handleReports()
  }, [filters])

  useEffect(() => {
      if (memberFeed && memberFeed.memberData) {
          setMembers(memberFeed.memberData);
      }
  }, [memberFeed, dispatch]);

  useEffect(() => {
    if(view === 'single'){
      setFilteredDate(new Date().toISOString().split('T')[0])
      handlefilterchange('date_range', new Date().toISOString().split('T')[0])
    }else{
      setFilteredDate([new Date().toISOString().split('T')[0]])
      handlefilterchange('date_range', [new Date().toISOString().split('T')[0]])
    }
    // setTimeout(() => {
      // handleReports()
    // },100)
  }, [view])

  useEffect(() => {
      const check = ['undefined', undefined, 'null', null, '']
      if (projectFeed && projectFeed.projectData) {
          setProjects(projectFeed.projectData)
      }
  }, [projectFeed])



  useEffect(() => { 
    if( selectedFilter !== "custom"){
      handlefilterchange('date_range', filtereddate)
    }
  }, [filtereddate])

  useEffect(() => {
      if (reportState?.memberReports) { 
        setMemberReports(reportState?.memberReports)
      }
      if(reportState.projectReports){
        setProjectReports(reportState.projectReports)
      }

      if( reportState.singleProjectReport){
        setsingleProjectReport(reportState.singleProjectReport)
        // console.log(calculateOccupiedRanges(reportState.singleProjectReport))
        // setOccupiedRanges(calculateOccupiedRanges(reportState.singleProjectReport))
      }
    }, [reportState])

    const goToPrevious = () => {
      if (filters?.page > 1) {
        const newPage = filters?.page - 1;
        setFilters({...filters, ['page']: newPage})
      }
    };

    const goToNext = () => {
      if (filters?.page < projectReports?.totalPages) {
        const newPage = filters?.page + 1;
        setFilters({...filters, ['page']: newPage})
      }
    };


    const showRecordedTabs = () => {
        
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
      }

      

  const FilterButton = ({ position }) => {
      return (
        <>
          <div className="filter-box">
            <Button variant="primary" onClick={() => {
              setIsPickerOpen(false)
              handlefilterchange('date_range', filtereddate)
              // handleReports()
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
          // datePickerRef.current.closeCalendar()
          // datePickerRef.current.openCalendar()
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
          <Dropdown className="select--dropdown">
            <Dropdown.Toggle variant="success">{filterDisplayLabels[selectedFilter]}</Dropdown.Toggle>
            <Dropdown.Menu>
              <div className="drop--scroll">
                  
              <Dropdown.Item className={ selectedFilter === 'today'? 'selected--option': ''} key={'date-today'} onClick={(e) => {setSelectedFilter('today');handleDateFilter(e, today); }}>Today</Dropdown.Item>
              <Dropdown.Item className={ selectedFilter === 'yesterday'? 'selected--option': ''} key={'date-yesterday'} onClick={(e) =>{  setSelectedFilter('yesterday');handleDateFilter(e, yesterday);}}>Yesterday</Dropdown.Item>
              <Dropdown.Item className={ selectedFilter === '7days'? 'selected--option': ''} key={'date-7days'} onClick={(e) => { setSelectedFilter('7days');handleDateFilter(e, last7Days, today);}}>Last 7 days</Dropdown.Item>
              <Dropdown.Item className={ selectedFilter === 'last-week'? 'selected--option': ''} key={'date-last-week'} onClick={(e) => { setSelectedFilter('last-week');handleDateFilter(e, lastWeekStart, lastWeekEnd);}}>Last week</Dropdown.Item>
              <Dropdown.Item className={ selectedFilter === 'last2-weeks'? 'selected--option': ''} key={'date-last2-weeks'} onClick={(e) => {setSelectedFilter('last2-weeks');handleDateFilter(e, last2WeeksStart, lastWeekEnd); }}>Last 2 weeks</Dropdown.Item>
              <Dropdown.Item className={ selectedFilter === 'this-month'? 'selected--option': ''} key={'date-this-month'} onClick={(e) => { setSelectedFilter('this-month');handleDateFilter(e, thisMonthStart, thisMonthEnd);}}>This month</Dropdown.Item>
              <Dropdown.Item className={ selectedFilter === 'last-month'? 'selected--option': ''} key={'date-last-month'} onClick={(e) => { setSelectedFilter('last-month');handleDateFilter(e, lastMonthStart, lastMonthEnd);}}>Last month</Dropdown.Item>
              <Dropdown.Item className={ selectedFilter === 'custom'? 'selected--option': ''} key={'date-custom'} onClick={(e) => { setSelectedFilter('custom');}}>Custom</Dropdown.Item>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      );
  };



  function calculateTotalTime(activities, type= 'all') {
    let totalSeconds = 0;
    for (const activity of activities) {
        const { duration } = activity;
        if(type !== 'all' && activity?.type !== type){
          continue;
        }
        if( activity?.type === 'manual' && activity?.is_approved === false){
          continue;
        }
        totalSeconds += duration 
    }
     // If the total time is less than 60 seconds, return the number of seconds
    if (totalSeconds === 0) {
      return `00:00`;
    }
    else if (totalSeconds < 60) {
      return `${totalSeconds} seconds`;
    }

    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');

    return `${hours}h ${minutes}m`;
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
  setLoader(false)
  if (reportState.success) {
      // setFields({date: new Date()})
      handleReports()
      // handleClose()
      setremarksActive( false )
  }
}, [reportState])










const [projectToggle, setProjectToggle ] = useState(false)
const handleToggles = () => {
    if(commonState.sidebar_small === false ){ console.log('1')
        handleSidebarSmall()
    }else{
        setProjectToggle(false)
        handleSidebarSmall()
          console.log('3')
    }
}

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

      <div className={ `${isActive === 1 ? 'show--details team--page project-collapse holidays--page' : isActive === 2 ? 'view--project team--page project-collapse holidays--page' :  'team--page holidays--page'} ${projectToggle === true ? 'project-collapse' : ''}`}>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
              <Row>
                  <Col sm={12} lg={12}>
                      <h2>
                          <p className="mb-0 d-flex align-items-center">
                            <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
                            Reports
                          </p>
                          <ListGroup horizontal className={isActive ? "d-none" : "activity--tabs ms-auto"}>
                            <ListGroup horizontal className={isActive ? "d-none" : "d-none d-md-flex"}>
                              <ListGroup.Item action onClick={() => {handlefilterchange('sort_by', 'members');setActiveViewTab('members')}} className={`${activeMemberTab === 'members'? 'd-md-flex gap-2 active d-none': 'd-none d-md-flex gap-2'}`}><AiOutlineTeam /> Members</ListGroup.Item>
                              <ListGroup.Item action onClick={() => {handlefilterchange('sort_by', 'projects');setActiveViewTab('projects')}} className={`${activeMemberTab === 'projects'? 'd-md-flex gap-2 active d-none': 'd-none d-md-flex gap-2'}`}><LuFolderOpen /> Projects</ListGroup.Item>
                            </ListGroup>
                            {
                              filters['sort_by'] === 'projects' &&
                                
                              <>
                                <ListGroup.Item key="status-filter-list">
                                  <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('project_status', event.target.value)} value={filters['project_status'] || 'in-progress'}>
                                      <option value="all">View All</option>
                                      <option value="in-progress">In Progress</option>
                                      <option value="on-hold">On Hold</option>
                                      <option value="completed">Completed</option>
                                  </Form.Select>
                                </ListGroup.Item>
                              </>
                            }
                            <ListGroup.Item className="d-none d-xl-block">
                            <Form>
                              <Form.Group className="mb-0 form-group me-2">
                              <FiltersDate position="left" setFilteredDate={setFilteredDate} setSelectedFilter={setSelectedFilter} setIsPickerOpen={setIsPickerOpen} />
                              </Form.Group>
                              {
                              (selectedFilter === 'custom') && (
                              <Form.Group className="mb-0 form-group">
                                <DatePicker 
                                    ref={datePickerRef}
                                    key={'date-filter'}
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
                                    editable={false}         
                                    className="form-control"
                                    placeholder="dd/mm/yyyy"
                                    open={isPickerOpen} // Control visibility with state
                                    onOpen={() => setIsPickerOpen(true)} // Update state when opened
                                    onClose={() => setIsPickerOpen(false)} // Update state when closed
                                    plugins={
                                      [<FilterButton position="bottom" />]
                                    } 
                                />
                                  </Form.Group>
                              )}
                              </Form>
                            </ListGroup.Item>
                            
                            <ListGroup horizontal className="bg-white expand--icon d-none d-lg-flex">
                                <ListGroup.Item onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                            </ListGroup>
                          </ListGroup>
                      </h2>
                      <ListGroup horizontal className="justify-content-start mt-3 mt-md-0 d-md-none d-flex">
                        <ListGroup horizontal className="justify-content-start d-md-none d-flex">
                          <ListGroup.Item action onClick={() => setActiveViewTab('members')} className={`${activeMemberTab === 'members'? 'd-md-none d-flex gap-2 active': 'd-md-none d-flex gap-2'}`}><AiOutlineTeam /> Members</ListGroup.Item>
                          <ListGroup.Item action onClick={() => setActiveViewTab('projects')} className={`${activeMemberTab === 'projects'? 'd-md-none d-flex gap-2 active': 'd-md-none d-flex gap-2'}`}><LuFolderOpen /> Projects</ListGroup.Item>
                        </ListGroup>
                      </ListGroup>
                  </Col>
              </Row>
          </Container>
        </div>
        <div className='page--wrapper daily--reports px-md-2 py-3'>
          {
            spinner &&
              <div className="loading-bar">
                  <img src="images/OnTeam-icon.png" className="flipchar" />
              </div>
          }
          <Container fluid className="py-4">
            {activeMemberTab === 'projects' && (
              <div className="attendance--table projects--view" id="projects--view">               
                <div className='attendance--table--list'>
                    <Table>
                      <thead className="onHide">
                        <tr key="project-table-header">
                          <th scope="col" className="sticky pe-0 py-0" key="project-name-header">Project</th>
                          <th scope="col" key="client-ttime-header" className="onHide ms-auto">Total Hours</th>
                          <th scope="col" key="client-time-header" className="onHide">Members</th>
                          <th scope="col" key="client-action-header" className="onHide">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {
                          (projectReports?.reports && projectReports?.reports?.length > 0) && (
                            projectReports?.reports?.map((reportData, i) => {
                              const result = getProjectTabSummary(reportData); 
                              return (
                                <tr>
                                  <td>
                                    <div className="d-flex justify-content-between">
                                      <div className="project--name d-flex gap-3 align-items-center">
                                          <div className="drag--indicator"><abbr>{i+1}</abbr><MdDragIndicator /></div>
                                          <div className="title--initial">{reportData?.title?.substring(0,2)}</div>
                                          <div className="title--span flex-column d-flex align-items-start gap-0">
                                              <span>{reportData?.title}</span>
                                              <strong>{reportData?.client?.name}</strong>
                                          </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="ms-auto text-start text-xl-center">
                                    <strong className="d-inline-flex text-uppercase fs-small d-xl-none px-2 py-1 bg-light rounded-1">Total Hours</strong>
                                    <br className="d-xl-none"/>
                                    {result?.totalTime || 0}
                                  </td>
                                  <td className="text-start text-xl-center"><strong className="d-inline-flex text-uppercase fs-small d-xl-none px-2 py-1 bg-light rounded-1">Members</strong>
                                    <br className="d-xl-none"/>
                                    {reportData?.members?.length || 0}
                                  </td>
                                  <td>
                                    <Button variant="dark" className="ms-auto px-3 py-2 d-flex align-items-center gap-2" onClick={() => { setSingleMemberReport(reportData);setIsActive(1);}}><FaEye/> Details</Button>
                                  </td>
                                </tr>
                              )
                            })
                          )
                        }
                        
                        
                      </tbody>
                    </Table>
                    {
                      (projectReports?.totalPages > 1) && (
                        <Pagination>
                          <Pagination.Prev onClick={goToPrevious} disabled={filters?.page === 1} />
                          <Pagination.Next onClick={goToNext} disabled={filters?.page === projectReports?.totalPages} />
                        </Pagination>
                        // <ButtonGroup>
                        //   <Button variant="light" onClick={goToPrevious} disabled={filters?.page === 1}>
                        //     ◀
                        //   </Button>
                        //   <Button variant="light" onClick={goToNext} disabled={filters?.page === projectReports?.totalPages}>
                        //     ▶
                        //   </Button>
                        // </ButtonGroup>
                      )
                    }
                </div>
              </div>
            )}

            {activeMemberTab === 'members' && (
              <>
                <div className="attendance--table members--view" id="members--view">
                  <div className='attendance--table--list'>
                    <Table responsive="lg">
                      <thead className="onHide">
                        <tr key="project-table-header-member">
                          <th scope="col" className="sticky pe-0 py-0" key="project-name-header-member">Member</th>
                          <th scope="col" key="client-time-header-member" className="onHide ms-auto">Total Hours</th>
                          <th scope="col" key="client-projects-header-member" className="onHide">Projects</th>
                          <th scope="col" key="client-action-header-member" className="onHide">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {
                          memberReports && memberReports.length > 0 ? 
                            memberReports.map((report, index) => {
                              const result = getProjectSummary(report.reports, 'both'); 
                              return (
                                <tr key={`report-key-${index}`}>
                                  <td>
                                    <div className="d-flex justify-content-between">
                                      <div className="project--name d-flex gap-3 align-items-center">
                                        <div className="drag--indicator"><abbr>{index + 1}</abbr><MdDragIndicator /></div>
                                        <div className="title--initial">{report?.member?.name.substring(0, 2)}</div>
                                        <div className="title--span flex-column d-flex align-items-start gap-0">
                                            <span>{report?.member?.name}</span>
                                            <strong>{report?.member?.role}</strong>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="ms-auto text-start text-xl-center">
                                    <strong className="d-inline-flex text-uppercase fs-small d-xl-none px-2 py-1 bg-light rounded-1">Total Hours</strong>
                                    <br className="d-xl-none"/>
                                    {result?.totalTime || 0}
                                  </td>
                                  <td className="text-start text-xl-center"><strong className="d-inline-flex text-uppercase fs-small d-xl-none px-2 py-1 bg-light rounded-1">Projects</strong><br className="d-xl-none"/>{result?.totalProjects || 0}</td>
                                  <td><Button variant="dark" className="mt-0 mt-xl-0 px-3 py-2 d-inline-flex align-items-center gap-2" onClick={() => { setSingleMemberReport(report); setIsActive(1);}}><FaEye/> Details</Button></td>
                                </tr>
                              )
                            })
                          :
                          <></>
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
      <div className="details--projects--grid projects--grid common--project--grid">
        <div className="wrapper--title py-2 bg-white border-bottom">
            <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
            <div className="projecttitle">
              {
                (isActive === 1 && activeMemberTab === 'members') ?
                <Dropdown>
                  <Dropdown.Toggle variant="link" id="dropdown-basic">
                      <div className="title--initial">{singleMemberReport?.member?.name?.charAt(0)}</div>
                      <div className="title--span flex-column align-items-start gap-0">
                          <h3>
                            <strong>{singleMemberReport?.member?.name}</strong>
                            <span>{singleMemberReport?.member?.role}</span>
                          </h3>
                      </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                      <div className="drop--scroll">
                        {
                          (memberReports && memberReports.length > 0) && 
                          memberReports.map((report, index) => {
                            return (
                            <Dropdown.Item onClick={() => { setSingleMemberReport(report); setIsActive(1);}} className={(singleMemberReport?.member?._id === report.member?._id) ? 'active-project': ''}>
                              <div className="title--initial">{report?.member?.name.charAt(0)}</div>
                              <div className="title--span flex-column align-items-start gap-0">
                                <strong>{report?.member?.name}</strong>
                                <span>{report?.member?.role}</span>
                              </div>
                            </Dropdown.Item>
                            )
                          })
                        }
                      </div>
                  </Dropdown.Menu>
                </Dropdown>
                :
                  <Dropdown>
                    <Dropdown.Toggle variant="link" id="dropdown-basic">
                      <div className="title--initial">{singleMemberReport?.title?.charAt(0)}</div>
                      <div className="title--span flex-column align-items-start gap-0">
                        <h3>
                          <strong>{singleMemberReport?.title}</strong>
                          <span>{singleMemberReport?.client?.name}</span>
                        </h3>
                      </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <div className="drop--scroll">
                          {
                            (projectReports?.reports && projectReports?.reports?.length > 0) && (
                            projectReports?.reports?.map((reportData, i) => {
                              return (
                                <Dropdown.Item onClick={() => { setSingleMemberReport(reportData); }} className={(singleMemberReport?._id === reportData?._id) ? 'active-project': ''}>
                                  <div className="title--initial">{reportData?.title.charAt(0)}</div>
                                  <div className="title--span flex-column align-items-start gap-0">
                                    <strong>{reportData?.title}</strong>
                                    <span>{reportData?.client?.name}</span>
                                  </div>
                                </Dropdown.Item>
                              )
                              
                            }))
                          }
                        </div>
                    </Dropdown.Menu>
                  </Dropdown>
              }
            </div>
            <ListGroup horizontal>
              <ListGroup.Item onClick={handleToggles} className="d-none d-lg-flex"><GrExpand /></ListGroup.Item>
              <ListGroupItem className="btn btn-primary" key={`closekey`} onClick={() => {setIsActive(0);dispatch(toggleSidebarSmall( false))}}><MdOutlineClose /></ListGroupItem>
            </ListGroup>
        </div>
        {
          (isActive === 1 && activeMemberTab === 'members') ?
        
          <div className={`member--projects attendance--stats ${activeMemberTab === 'members' ? '' : 'd-none'}`}>
            <div className="d-flex align-items-center gap-3 justify-content-between mb-4">
              <h3 className="mb-0 d-flex align-items-center gap-3"><span><LuFolderOpen /></span>Projects ({singleMemberReport?.reports?.length || 0})</h3>
              <div className="d-flex align-items-center gap-2 gap-xl-4 mt-3 mt-xl-0 text-sm">
                <div className="text-center">
                    <div className="text-lg font-bold text--blue">{getProjectSummary(singleMemberReport?.reports, 'time')}</div>
                    <div className="text-slate-600">Total Hours</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text--green">{singleMemberReport?.reports?.length || 0}</div>
                    <div className="text-slate-600">Projects</div>
                </div>
              </div>
            </div>
            
            {
            
            
            singleMemberReport?.reports?.map((report, index) => {
              return (
                      <>
                      <div className="single--project--stack">
                        <div eventKey={`single-member-accord-item-${singleMemberReport?.member?._id}`} key={`single-member-accord-item-${singleMemberReport?.member?._id}`} onClick={() => {setSelectedReport(report)}}>
                          <div className="d-flex align-items-center justify-content-between gap-4">
                            <h4 className="font-bold text-slate-800 text-lg mb-2">{report?.project?.name} 
                              <span>{report?.project?.client?.name}</span>
                              </h4>
                            <Badge bg="warning">{report?.project?.status}</Badge>
                          </div>
                          <Row>
                            <Col sm={12}>
                          <div className="report--info">
                            <p className="p--card">
                              <label>Tracked Time</label>
                              <p>{calculateTotalTime(report?.activities,'tracker')}</p>
                            </p>
                            <p className="p--card">
                              <label>Manual Time</label>
                              <p>{calculateTotalTime(report?.activities, 'manual')}</p>
                            </p>
                            <p className="p--card">
                              <label>Total Time</label>
                              <p>{calculateTotalTime(report?.activities, 'all')}</p>
                            </p>
                          </div>
                          </Col>
                          </Row>
                          <Row>
                            <Col sm={12}>
                              <label>Tasks</label>
                              <TaskList report={report} />
                            </Col>
                          </Row>
                        </div>
                        </div>
                      </>
                      )
                    
                    })}
                  
                {/* :
                <p className="text-center mt-5">No activity available.</p> */}
              {/* }  */}
          </div>
          :
          
        <div className={`member--projects attendance--stats team--members--list ${activeMemberTab === 'projects' ? '' : 'd-none'}`}>
          <div className="d-flex align-items-center gap-3 justify-content-between mb-4">
            <h3 className="mb-0 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Team Members ({singleMemberReport?.members?.length || 0})</h3>
            <div className="d-flex align-items-center gap-2 gap-xl-4 mt-3 mt-xl-0 text-sm">
              {/* <div className="text-center">
                  <div className="text-lg font-bold text--blue">113h 15m</div>
                  <div className="text-slate-600">Total Hours</div>
              </div>
              <div className="text-center">
                  <div className="text-lg font-bold text--green">{singleMemberReport?.members?.length || 0}</div>
                  <div className="text-slate-600">Members</div>
              </div> */}
            </div>
          </div>
          {
            
            singleMemberReport?.members?.map((member, index) => {
              return (
                      <>
                    <div className={`single--project--stack-${member?._id}`}>
                      <div className="d-flex justify-content-between mb-4" key={`single-member-accord-item-${member?._id}`}>
                        <div className="project--name d-flex gap-3 align-items-center">
                            <div className="title--initial">{member?.name?.substring(0,2)}</div>
                            <div className="title--span flex-column d-flex align-items-start gap-0">
                                <span>{member?.name} </span>
                                <strong>{member?.role}</strong>
                            </div>
                        </div>
                      </div>
                      <Row>
                        <Col>
                      <div className="report--info">
                        <p className="p--card">
                          <label>Tracked Time</label>
                          <p>{calculateTotalTime(member?.activities,'tracker')}</p>
                        </p>
                        <p className="p--card">
                          <label>Manual Time</label>
                          <p>{calculateTotalTime(member?.activities, 'manual')}</p>
                        </p>
                        <p className="p--card">
                          <label>Total Time</label>
                          <p>{calculateTotalTime(member?.activities, 'all')}</p>
                        </p>
                      </div>
                      </Col>
                      </Row>
                      <Col sm={12}>
                        <label>Tasks</label>
                        <TaskList report={member} />
                      </Col>
                     
                      {/* <Button variant="info" className="mt-3 ms-3"><TbReport /> View Remarks</Button> */}
                      </div>
                    </>
              )
            })
          }
        </div>
      }
      </div>
      

      
      {/*--=-=Filter Modal**/}
      <Modal show={showFilter} onHide={handleFilterClose} centered size="md" className="filter--modal">
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item>
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success">Sort by</Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option" href="#/action-1">Sort by <FaCheck /></Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Screenshots</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Projects</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              
            </ListGroup.Item>
            <ListGroup.Item>
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success">My Reports</Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option" href="#/action-1">My Reports <FaCheck /></Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Hitesh Kumar</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Tarun Giri</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
             
            </ListGroup.Item>
            <ListGroup.Item>
              <Form>
                <Form.Group className="mb-0 form-group">
                  <Form.Control type="date" name="date" />
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
    </>
  );
}

export default ReportsPage;