import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/dist/styles.css";
import { Container, Row, Col, Button, Form, ListGroup, Accordion, Modal, Card, Dropdown, CardGroup, Badge } from "react-bootstrap";
import Fullscreen  from "yet-another-react-lightbox/dist/plugins/fullscreen";
import { FaRegEdit, FaCheck, FaAngleRight, FaPlus, FaTrash } from "react-icons/fa";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill} from "react-icons/bs";
import { showAmPmtime, getMemberdata, selectboxObserver } from "../../helpers/commonfunctions";
import { MdFilterList } from "react-icons/md";
import { getReportsByMember, gerReportsByProject, addManualTime, getSingleProjectReport, addRemarkstoProject } from "../../redux/actions/report.action";
import { Listmembers } from "../../redux/actions/members.action";
import { ListProjects, ListMemberProjects } from "../../redux/actions/project.action";
import DatePicker from "react-multi-date-picker";
import { ListTasks } from "../../redux/actions/task.action";
import "media-chrome";
import "media-chrome/dist/menu"
function ReportsPage() {
  const dispatch = useDispatch()
  const datePickerRef = useRef(null)
  const manuldatePickerRef = useRef(null)
  const memberdata = getMemberdata()
  const fullscreenRef = React.useRef(null);
  const [fields, setFields] = useState({date: new Date()})
  const [ remarksActive ,setremarksActive] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [ loader, setLoader] = useState(false)
  const [show, setShow] = useState(false);
  const [spinner, setSpinner] = useState(false)
  const [currentVideoPage, setCurrentVideoPage] = useState({});
  const videosPerPage = 12; // Adjust as needed
  const handleClose = () => {
    setShow(false);
    setFields({})
    setEntries([])
  }
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
  const handleShow = () => setShow(true);
  const memberFeed = useSelector((state) => state.member.members)
  const projectFeed = useSelector(state => state.project.projects);
  const [ projects, setProjects ] = useState([])
  const MemberprojectFeed = useSelector(state => state.project.memberProjects);
  const [ memberprojects, setMemberProjects ] = useState([])
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
  const [occupiedRanges, setOccupiedRanges] = useState([])
  const [timeSlots, setTimeslots] = useState([])
  const [ filtereddate, setFilteredDate ] = useState([new Date().toISOString().split('T')[0]])
  const [selectedFilter, setSelectedFilter ] = useState('today')
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [ searchEntries, setSearchEntries] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postMedia, setPostMedia] = useState([]);
  const [ filters, setFilters] = useState({member: memberdata?._id, sort_by: 'members','project_status': 'in-progress'});
  const [ selectedproject, setSelectedProject] = useState('')
  const [ selectedTask, setSelectedTask] = useState('');
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
  const [entries, setEntries] = useState([]);
  const [ errors, setErrors] = useState([])
  const [ selectedWorkflow, setWorkflow] = useState('')
  const [filteredTasks, setFilteredTasks] = useState([])
  const handleProjectSelect = async ({ target: { name, value, selectedOptions } }) => {
    const selectedOption = selectedOptions[0];
  
  // Retrieve the data-project attribute value
  const projectData = JSON.parse(selectedOption.getAttribute("data-project"));
    setSelectedProject(projectData)
    if(projectData?.workflow?.tabs && projectData.workflow.tabs.length > 0){
      setWorkflow(projectData.workflow.tabs[0]?._id)
    }
    await dispatch(ListTasks(value));
    await dispatch(getSingleProjectReport(value))
  }

  const handleTaskSelect = async ({ target: { name, value } }) => {
    setSelectedTask(value)
  }
  
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

  const handleListProjects = async () => {
      await dispatch(ListProjects({}));
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

  useEffect(() => {
      setEntries([]);
      if (taskFeed?.taskData && Object.keys(taskFeed.taskData).length > 0) {
          setTasksLists(taskFeed.taskData)
          setFilteredTasks(taskFeed?.taskData[selectedWorkflow]?.tasks)
          
      }
  }, [taskFeed, dispatch])
  
  useEffect(() => {
    if (filteredTasks?.length > 0 && entries.length === 0) {
      setEntries([...entries, { task: filteredTasks[0]._id, start_time: "", end_time: "" }]);
    }  
  }, [filteredTasks])

  useEffect(() => {
    setFilteredTasks(taskslists[selectedWorkflow]?.tasks)
  }, [selectedWorkflow])

  useEffect(() => {
    if(occupiedRanges){
      setTimeslots(generateTimeSlots(10))
    }
    
  },[occupiedRanges])

  // Helper function to calculate time ranges
  const calculateOccupiedRanges = (data) => {
    return data.map((item) => {
      const start = new Date(item.createdAt); // Convert createdAt to a Date object
      const end = new Date(item.duration); // Convert duration to a Date object (end time)
      
      return { start, end };
    });
  };
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
    const check = ['undefined', undefined, 'null', null, '']
    if (MemberprojectFeed && MemberprojectFeed.projectData) {
        setMemberProjects(MemberprojectFeed.projectData)
    }
}, [MemberprojectFeed])

  // useEffect(() => { 
  //   // handlefilterchange('date_range', filtereddate)
  // }, [filtereddate])

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
        setOccupiedRanges(calculateOccupiedRanges(reportState.singleProjectReport))
      }
    }, [reportState])

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

      // Generate time slots for the day
      const generateTimeSlots = (intervalMinutes = 15) => {
        const slots = [];
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999); // Set to end of the day
      
        let current = new Date(startOfDay);
        while (current <= endOfDay) {
          const hours = current.getHours().toString().padStart(2, '0'); // Format hours
          const minutes = current.getMinutes().toString().padStart(2, '0'); // Format minutes
          slots.push(`${hours}:${minutes}`); // Add formatted time
          current.setMinutes(current.getMinutes() + intervalMinutes); // Increment by interval
        }
        return slots;
      };

    // Check if a time slot is occupied
    const isTimeSlotOccupied = (time, ranges) => {
      if (!ranges || ranges.length === 0) {
        // If ranges is null, undefined, or empty, return false (time slot is not occupied)
        return false;
      }
    
      // Convert time string (HH:mm) to a Date object on the same day
      const timeDate = new Date();
      const [hours, minutes] = time.split(':');
      timeDate.setHours(hours, minutes, 0, 0); // Set time based on HH:mm
    
      return ranges.some(({ start, end }) => {
        // Convert start time from ISO string to Date object
        const startDate = new Date(start);
        
        // If end time exists, convert it to Date; otherwise, set endDate to null
        const endDate = end ? new Date(end) : null; 
        
        // Check if the time falls within the range
        if (endDate) {
          // If there is an end time, check if time is between start and end
          return timeDate >= startDate && timeDate < endDate;
        }
        
        // If there's no end time, check if the time is after the start time
        return timeDate >= startDate;
      });
    };
    
    

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



  function calculateTotalTime(activities, type= 'all') {
    let totalSeconds = 0;
    for (const activity of activities) {
        const { duration } = activity;
        if(type !== 'all' && activity?.type !== type){
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

    return `${hours} hrs ${minutes} mins`;
}


const handleSearchChange = (name, index, searchvalue) => {
  setSearchEntries((prevEntries) => {
    const updatedEntries = [...prevEntries]; // Create a shallow copy of the array

    // If the index is within the bounds of the current array, update the entry
    if (index < updatedEntries.length) {
      updatedEntries[index] = {
        ...updatedEntries[index], // Spread the current entry
        [name]: searchvalue // Update the specific key with the new value
      };
    } else {
      // If the index is out of bounds, create a new entry
      const newEntry = {
        tasksearch: name === "tasksearch" ? searchvalue : "",
        start_time: name === "start_time" ? searchvalue : "",
        end_time: name === "end_time" ? searchvalue : ""
      };
      updatedEntries.push(newEntry); // Add the new entry to the array
    }

    return updatedEntries; // Return the updated array
  });
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
  

  const handleAddEntry = () => {
    setEntries([...entries, { task: "", task_title: "", start_time: "", end_time: "" }]);
};

const handleReportSubmit = async (e) => {
  e.preventDefault();
  const errors = entries.map((entry, index) => {
    const entryErrors = {};

    // Validation 1: Task is required
    if (!entry.task) entryErrors.task = "Task is required";

    // Validation 2: Start and End Time are required
    if (!entry.start_time) {
        entryErrors.start_time = "Start time is required.";
    }
    if (!entry.end_time) {
        entryErrors.end_time = "End time is required.";
    }

    // Helper function to convert HH:mm to Date object
    const parseTime = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    if (entry.start_time && entry.end_time) {
        const currentStart = parseTime(entry.start_time);
        const currentEnd = parseTime(entry.end_time);

        // Validation 3: End time must be greater than start time
        if (currentStart >= currentEnd) {
            entryErrors.end_time = "End time must be greater than start time.";
        }

        // Validation 4: Start and End times should not overlap with other entries
        entries.forEach((otherEntry, otherIndex) => {
            if (index !== otherIndex && otherEntry.start_time && otherEntry.end_time) {
                const otherStart = parseTime(otherEntry.start_time);
                const otherEnd = parseTime(otherEntry.end_time);

                if (
                    currentStart < otherEnd && currentEnd > otherStart // Overlap condition
                ) {
                    entryErrors.start_time = "Time range overlaps with another entry.";
                    entryErrors.end_time = "Time range overlaps with another entry.";
                }
            }
        });
    }

    return entryErrors;
});


  const hasErrors = errors.some((entryErrors) => Object.keys(entryErrors).length > 0);

  if (hasErrors) {
    setErrors(errors); // Update the errors state to show errors below each field
    return false; // Prevent form submission
  }//return false;
  setErrors([]);
  setLoader( true )
  const payload = { project_id: selectedproject, entries }
  dispatch(addManualTime({...payload,...fields}))

}

useEffect(() => {
  setLoader(false)
  if (reportState.success) {
      setFields({date: new Date()})
      handleReports()
      handleClose()
      setremarksActive( false )
  }
}, [reportState])

const handleRemoveEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
};

const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...entries];
    if( field === 'task'){
      updatedEntries[index][field] = value._id;
      updatedEntries[index]['task_title'] = value.title;
    }else{
      updatedEntries[index][field] = value;
    }
    
    setEntries(updatedEntries);
};

const handlechange = ({ target: { name, value } }) => {
  setFields({...fields, [name]: value})
};

const groupTasksById = (activities) => {
  const groupedTasks = activities.reduce((acc, activity) => {
      activity.tasks.forEach((t) => {
          const taskId = t.task._id;

          if (!acc[taskId]) {
              acc[taskId] = {
                  taskId: t.task._id,
                  title: t.task.title,
                  duration: 0, // Store duration in milliseconds
                  tab: t.task.tab
                  // statuses: [],
              };
          }

          // Calculate duration using `createdAt` and `duration`
          if ( t.duration) {
              // const createdAtTime = new Date(t.createdAt).getTime();
              // const durationTime = new Date(t.duration).getTime();

              // if (!isNaN(createdAtTime) && !isNaN(durationTime)) {
              //     const timeDifferenceInMs = durationTime - createdAtTime;
              //     if (timeDifferenceInMs > 0) {
                      acc[taskId].duration += t.duration;
              //     }
              // }
          }

          // Combine statuses from subtasks
          // acc[taskId].statuses.push(...t.task.subtasks.map((subtask) => subtask.status));
      });

      return acc;
  }, {});

  // Format durations into "hh:mm:ss"
  return Object.values(groupedTasks).map((task) => {
      const totalSeconds = task.duration //Math.round(task.duration / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      task.duration =
          totalSeconds < 60
              ? `${totalSeconds} secs`
              : `${hours}:${minutes.toString().padStart(2, "0")}`;
      return task;
  });
};

const TaskList = ({ report }) => {
  // Group tasks by title and calculate total durations
  const groupedTasks = groupTasksById(report?.activities);
  const [ViewReport, setViewReport] = useState(false);
  const handleReportClose = () => setViewReport(false);
  const fullscreenrefrence = React.useRef(null);
  const [taskId, setTaskId] = useState('')
  const handleViewReport = (taskId) => {
    setTaskId( taskId)
    setViewReport(true);
  }
  const [activeTab, setActiveTab] = useState("screenshots");
  const [reportopen, setReportOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState([]);

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
      return <Badge bg="info">{matchedTabTitle}</Badge>
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
      {groupedTasks.map((task, index) => (
        <li key={`grouped-task-${index}`}>
          <p className="mb-0">
            <FaAngleRight /> {task.title}
          </p>
          <strong>{task.duration}</strong>
          {
            gettaskTab(task.tab)
          }
          <Button variant="primary" onClick={() => {handleViewReport(task.taskId)}}>View Report</Button>
        </li>
      ))}
    </ul>
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
          {
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
                // return meta.meta_value.map((videoData, j) => {
                //   if(videoData.task !== taskId){return null}else{
                //     const currentIdx = idx;
                //     idx++;
                //       return (
                //         <Card key={`video-card-${i}-${j}`}>
                //           <Card.Body 
                //           onClick={() => triggerLightBox('video', meta.meta_value, currentIdx)}
                //           >
                //             <video controls height="175px">
                //               <source src={videoData?.url} type="video/webm" />
                //               Your browser does not support the video tag.
                //             </video>
                //             <p>
                //               <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                //               <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                //             </p>
                //           </Card.Body>
                //         </Card>
                //       )
                //     }
                //   });
                
                return (
                  <>
                    {meta.meta_value
                      .slice(
                        ((currentVideoPage[`single-${report?.project?._id}`] || 1) - 1) * videosPerPage,
                        (currentVideoPage[`single-${report?.project?._id}`] || 1) * videosPerPage
                      )
                      .map((videoData, j) => {
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
              
                    {/* Pagination Controls */}
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
        }
        </CardGroup>
        </div>
        </Modal.Body>
      </Modal>
      </>
  );
};


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

      <div className='team--page'>
        <div className='page--title px-md-2 pt-3'>
          <Container fluid>
            <Row>
              <Col>
                <h2>Reports <Button variant="primary" className='d-flex d-xl-none' onClick={handleFilterShow}><MdFilterList /></Button></h2>
              </Col>
              <Col>
                <ListGroup horizontal>
                  <ListGroup.Item className="d-none d-xl-block">
                  <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('sort_by', event.target.value)} value={filters['sort_by'] || 'members'}>
                      <option value="">Sort by</option>
                      <option value="members">Members</option>
                      <option value="projects">Projects</option>
                  </Form.Select>
                    
                  </ListGroup.Item>
                  {
                    filters['sort_by'] === 'members' ?
                  
                      <ListGroup.Item className="d-none d-xl-block">
                      <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('member', event.target.value)} value={filters['member'] || memberdata?._id}>
                        <option value={memberdata?._id}>My Reports</option>
                        {
                            members.map((member, index) => {
                                return <option key={`member-${index}`} value={member._id}>{member.name}</option>
                            })
                        }
                      </Form.Select>
                        
                      </ListGroup.Item>
                    :
                    <>
                      <ListGroup.Item key="status-filter-list">
                        <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('project_status', event.target.value)} value={filters['project_status'] || 'in-progress'}>
                            <option value="all">View All</option>
                            <option value="in-progress">In Progress</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </Form.Select>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-none d-xl-block">
                        <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('project', event.target.value)} value={filters['project'] || ''}>
                          
                        {projects
                          .filter(project =>
                            filters['project_status'] === 'all' || project.status === filters['project_status']
                          )
                          .map((project, index) => (
                            <option key={`project-${index}`} value={project._id}>
                              {project.title}
                            </option>
                          ))}
                        </Form.Select>
                      </ListGroup.Item>
                      
                      </>
                    }
                  <ListGroup.Item action className="change--view" active={view === 'group' ? true : false} onClick={(e) => {setView('group')}}>
                    Group View
                  </ListGroup.Item>
                  <ListGroup.Item action className="change--view" active={view === 'single' ? true : false} onClick={(e) => {setView('single');}}>
                    Single View
                  </ListGroup.Item>
                  {
                    view === 'group' ? 
                    <ListGroup.Item className="d-none d-xl-block">
                    <Form>
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
                          [<FilterButton position="bottom" />, <FiltersDate position="left" setFilteredDate={setFilteredDate} setSelectedFilter={setSelectedFilter} setIsPickerOpen={setIsPickerOpen} />]
                        } 
                    />
                      </Form.Group>
                    </Form>
                  </ListGroup.Item>
                  :
                  <ListGroup.Item className="d-none d-xl-block">
                    <Form>
                      <Form.Group className="mb-0 form-group">
                      <DatePicker 
                        ref={datePickerRef}
                        key={'date-filter'}
                        name="date"
                        weekStartDayIndex={1}
                        id='datepicker-filter'
                        editable={false}
                        value={filtereddate} 
                        format="YYYY-MM-DD"
                        dateSeparator=" - " 
                        onChange={async (value) => {
                            setFilteredDate(value)
                            datePickerRef.current.closeCalendar()
                            datePickerRef.current.openCalendar()
                          }
                        }          
                        className="form-control"
                        placeholder="dd/mm/yyyy"
                        open={isPickerOpen} // Control visibility with state
                        onOpen={() => setIsPickerOpen(true)} // Update state when opened
                        onClose={() => setIsPickerOpen(false)} // Update state when closed
                        plugins={
                          [<FilterButton position="bottom" />]
                        } 
                        range={false}
                        multiple={false}
                    />
                      </Form.Group>
                    </Form>
                  </ListGroup.Item>
                  }
                  <ListGroup.Item>
                    <Button variant="primary" onClick={handleShow}>Manual Time</Button>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper daily--reports px-md-2 py-3'>
          {
            spinner &&
              <div className="loading-bar">
                  <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
          }
          <Container fluid>
          <div className="reports-section">
          <div className="rounded--box activity--box" key='activity-box'>
            
              {
                filters['sort_by'] === 'members' ?
                  memberReports && memberReports.length > 0 ? 
                  view === 'group' ?
                    <Accordion>
                    {memberReports.map((report, index) => {
                      return (
                      <>
                      
                      <Accordion.Item eventKey={`group-accord-item-${report?.project?._id}`} key={`group-accord-item-${report?.project?._id}`}>
                        <div className="screens--tabs">
                          <Accordion.Header>
                            {report?.project?.title} <br />
                          </Accordion.Header>
                        </div>
                        <Accordion.Body>
                          <div className="shots--list pt-3">
                          <Row>
                            <Col sm={12}>
                              <div className="report--info">
                                <p className="p--card">
                                  <label>Client Name</label>
                                  <p>{report?.project?.client?.name}</p>
                                </p>
                                <p className="p--card">
                                  <label>Track Time</label>
                                  <p>{calculateTotalTime(report?.activities, 'tracker')}</p>
                                </p>
                                <p className="p--card">
                                  <label>Manual Time</label>
                                  <p>{calculateTotalTime(report?.activities, 'manual')}</p>
                                </p>
                                <p className="p--card">
                                  <label>Total Time Spent</label>
                                  <p>{calculateTotalTime(report?.activities, 'all')}</p>
                                </p>
                              </div>
                            </Col>
                            </Row>
                            {showRecordedTabs()}
                            <CardGroup>
                                {
                                  report?.activityMetas && report.activityMetas.length > 0 ? (
                                    report.activityMetas.map((meta, i) => {
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
                                                <strong>Date: {screenshotData?.taken_time.split('T')[0]}</strong><br />
                                                <strong>Time: {showAmPmtime(screenshotData?.taken_time)}</strong>
                                              </p>
                                            </Card.Body>
                                          </Card>
                                        ));
                                      }

                                      // Handle videos tab
                                      if (screenshotTab === "Videos" && meta.meta_key === 'videos' && meta.meta_value.length > 0) {
                                        return (
                                          <>
                                            {meta.meta_value
                                              .slice(
                                                ((currentVideoPage[report?.project?._id] || 1) - 1) * videosPerPage,
                                                (currentVideoPage[report?.project?._id] || 1) * videosPerPage
                                              )
                                              .map((videoData, j) => 
                                                videoData?.url === 'video_disabled' ? (
                                                  <Card key={`blank-card-${report?.project?._id}-${currentVideoPage[report?.project?._id] || 1}-${i}-${j}`}>
                                                    <Card.Body>
                                                      <img
                                                        className="card-img-top"
                                                        src="https://onteams-bucket.s3.eu-north-1.amazonaws.com/images/5H2J6.jpg"
                                                        alt="screenshot"
                                                      />
                                                      <p>
                                                      <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                                                      <strong>Date:{videoData?.start_time.split('T')[0]}</strong><br />
                                                      <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                                      </p>
                                                    </Card.Body>
                                                  </Card>
                                                ) : (
                                                <Card key={`video-card-${report?.project?._id}-${currentVideoPage[report?.project?._id] || 1}-${i}-${j}`}>
                                                  <Card.Body onClick={() => handleLightBox('video', meta.meta_value, j)}>
                                                    <video
                                                      height="175px"
                                                      preload="metadata"
                                                      muted
                                                      onLoadedMetadata={(e) => (e.target.currentTime = 0.1)}
                                                    >
                                                      <source src={videoData?.url} type="video/webm" />
                                                      Your browser does not support the video tag.
                                                    </video>
                                                    <p>
                                                    <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                                                    <strong>Date:{videoData?.start_time.split('T')[0]}</strong><br />
                                                    <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                                    </p>
                                                  </Card.Body>
                                                </Card>
                                              ))}
                                      
                                            {/* Pagination Controls */}
                                            <div style={{ marginTop: "10px", textAlign: "center" }}>
                                              <Button variant="outline-primary"
                                                disabled={(currentVideoPage[report?.project?._id] || 1) === 1}
                                                onClick={() =>
                                                  setCurrentVideoPage((prev) => ({
                                                    ...prev,
                                                    [report?.project?._id]: (prev[report?.project?._id] || 1) - 1,
                                                  }))
                                                }
                                              >
                                                <BsArrowLeftCircleFill />
                                              </Button>
                                      
                                              <span style={{ margin: "0 10px" }}>
                                                Page {currentVideoPage[report?.project?._id] || 1} of {Math.ceil(meta.meta_value.length / videosPerPage)}
                                              </span>
                                      
                                              <Button variant="outline-primary"
                                                disabled={(currentVideoPage[report?.project?._id] || 1) >= Math.ceil(meta.meta_value.length / videosPerPage)}
                                                onClick={() =>
                                                  setCurrentVideoPage((prev) => ({
                                                    ...prev,
                                                    [report?.project?._id]: (prev[report?.project?._id] || 1) + 1,
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
                    }
                    </Accordion>
                    
                    :
                    <Accordion>
                    {memberReports.map((report, index) => {
                      return (
                      <>
                      
                      <Accordion.Item key={`single-accord-item-${report?.project?._id}`} eventKey={`single-accord-item-${report?.project?._id}`} onClick={() => {setSelectedReport(report?.project)}}>
                        <div className="screens--tabs">
                          <Accordion.Header>{report?.project?.title}
                          </Accordion.Header>
                        </div>
                        <Accordion.Body>
                          <Row>
                            <Col sm={12}>
                              <div className="report--info">
                                <p className="p--card">
                                  <label>Client name</label>
                                  <p>{report?.project?.client?.name}</p>
                                </p>
                                <p className="p--card">
                                  <label>Track Time</label>
                                  <p>{calculateTotalTime(report?.activities, 'tracker')}</p>
                                </p>
                                <p className="p--card">
                                  <label>Manual Time</label>
                                  <p>{calculateTotalTime(report?.activities, 'manual')}</p>
                                </p>
                                <p className="p--card">
                                  <label>Total Time Spent</label>
                                  <p>{calculateTotalTime(report?.activities, 'all')}</p>
                                </p>
                              </div>
                            </Col>
                            
                            <Col sm={12}>
                              <label>Tasks</label>
                              <TaskList report={report} />
                              
                            </Col>
                            { memberdata?._id === filters?.member ?
                              <Col sm={12} className="mb-4 border-top border-bottom pt-3 pb-3 bg-light">
                                <label>Remarks</label>
                                
                                {
                                  remarksActive === true ? 
                                  <>
                                    <Form.Group className="mb-0 form-group">
                                      
                                      <textarea class="form-control mt-4" rows={7}  data-r={remarks} defaultValue={remarks} onChange={handleRemarksChange}>
                                        
                                      </textarea>
                                    </Form.Group>
                                    <Button variant="primary" onClick={() => {
                                      saveRemarks(report?.project?._id)
                                    }} disabled={loader}>{loader === true ? 'Please wait...': 'Save'}</Button>
                                    <Button variant="danger" onClick={handleRemarks}>Cancel</Button>
                                  </>
                                  :
                                  <>
                                    <FaRegEdit onClick={handleRemarks} />
                                    {
                                    report?.project?.projectmeta && report?.project?.projectmeta?.length > 0 &&
                                    report?.project?.projectmeta.map((meta) => {
                                      if(meta.meta_key === 'remarks'){
                                        return <pre>{meta.meta_value}</pre>
                                      }else{
                                        return null
                                      }
                                    })
                                  }
                                  </>
                                }
                              </Col>
                              :
                              <Col sm={12} className="mb-4 border-top border-bottom pt-3 pb-3 bg-light">
                                <label>Remarks</label>
                                    {
                                    report?.project?.projectmeta && report?.project?.projectmeta?.length > 0 &&
                                    report?.project?.projectmeta.map((meta) => {
                                      if(meta.meta_key === 'remarks'){
                                        return <pre>{meta.meta_value}</pre>
                                      }else{
                                        return null
                                      }
                                    })
                                  }
                              </Col>
                            }
                          </Row>
                          
                          </Accordion.Body>
                        </Accordion.Item>
                      </>
                      )
                    })}
                    </Accordion>
                  :
                  <p className="text-center mt-5">No activity available.</p>
                  :

                  projectReports && projectReports.length > 0 ? 
                    view === 'group' ?
                    <Accordion>
                    {projectReports.map((report, index) => {
                      return (
                      <>
                      
                      <Accordion.Item eventKey={`member-group-accord-item-${report?.member?._id}`} key={`member-group-accord-item-${report?.member?._id}`}>
                        <div className="screens--tabs">
                          <Accordion.Header>Member: {report?.member?.name}</Accordion.Header>
                        </div>
                        <Accordion.Body>
                          <div className="shots--list pt-3">
                          <Row>
                            <Col sm={12}>
                              <div className="report--info">
                                <p className="p--card">
                                  <label>Client Name</label>
                                  <p>{report?.member?.client?.name}</p>
                                </p>
                                <p className="p--card">
                                  <label>Track Time</label>
                                  <p>{calculateTotalTime(report?.activities,'tracker')}</p>
                                </p>
                                <p className="p--card">
                                  <label>Manual Time</label>
                                  <p>{calculateTotalTime(report?.activities, 'manual')}</p>
                                </p>
                                <p className="p--card">
                                  <label>Total Time Spent</label>
                                  <p>{calculateTotalTime(report?.activities, 'all')}</p>
                                </p>
                              </div>
                            </Col>
                            </Row>
                            {showRecordedTabs()}
                            <CardGroup>
                                {
                                  report?.activityMetas && report.activityMetas.length > 0 ? (
                                    report.activityMetas.map((meta, i) => {
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
                                                <strong>Date:{screenshotData?.taken_time.split('T')[0]}</strong><br />
                                                <strong>Time:{showAmPmtime(screenshotData?.taken_time)}</strong>
                                              </p>
                                            </Card.Body>
                                          </Card>
                                        ));
                                      }

                                      // Handle videos tab
                                      if (screenshotTab === "Videos" && meta.meta_key === 'videos' && meta.meta_value.length > 0) {
                                        return meta.meta_value.map((videoData, j) => 
                                          videoData?.url === 'video_disabled' ? (
                                            <Card key={`video-card-${i}-${j}`}>
                                              <Card.Body>
                                                <img
                                                  className="card-img-top"
                                                  src="https://onteams-bucket.s3.eu-north-1.amazonaws.com/images/5H2J6.jpg"
                                                  alt="screenshot"
                                                />
                                                <p>
                                                  <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                                                  <strong>Date:{videoData?.start_time.split('T')[0]}</strong><br />
                                                  <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                                </p>
                                              </Card.Body>
                                            </Card>
                                          ) : (
                                          <Card key={`video-card-${i}-${j}`}>
                                            <Card.Body onClick={() => handleLightBox('video', meta.meta_value, j)}>
                                              <video controls height="175px">
                                                <source src={videoData?.url} type="video/webm" />
                                                Your browser does not support the video tag.
                                              </video>
                                              <p>
                                                <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                                                <strong>Date:{videoData?.start_time.split('T')[0]}</strong><br />
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
                    })}
                    </Accordion>
                    :
                    <Accordion>
                    {projectReports.map((report, index) => {
                      return (
                      <>
                      <Accordion.Item eventKey={`single-member-accord-item-${report?.member?._id}`} key={`single-member-accord-item-${report?.member?._id}`} onClick={() => {setSelectedReport(report?.project)}}>
                        <div className="screens--tabs">
                          <Accordion.Header>{report?.member?.name} </Accordion.Header>
                        </div>
                        <Accordion.Body>
                          <Row>
                            <Col sm={12}>
                              <div className="report--info">
                                <p className="p--card">
                                  <label>Client name</label>
                                  <p>{report?.member?.client?.name}</p>
                                </p>
                                <p className="p--card">
                                  <label>Track Time</label>
                                  <p>{calculateTotalTime(report?.activities,'tracker')}</p>
                                </p>
                                <p className="p--card">
                                  <label>Manual Time</label>
                                  <p>{calculateTotalTime(report?.activities, 'manual')}</p>
                                </p>
                                <p className="p--card">
                                  <label>Total Time Spent</label>
                                  <p>{calculateTotalTime(report?.activities, 'all')}</p>
                                </p>
                              </div>
                            </Col>
                            
                            <Col sm={12}>
                              <label>Tasks</label>
                              
                               <TaskList report={report} />
                            </Col>
                            <Col sm={12} className="mb-4 border-top border-bottom pt-3 pb-4 bg-light">
                              <label>Remarks</label>
                              
                              {
                                remarksActive === true ? 
                                <>
                                  <Form.Group className="mb-0 form-group">
                                    
                                    <textarea class="form-control mt-4" rows={7} data-r={remarks} defaultValue={remarks} onChange={handleRemarksChange}>
                                      
                                    </textarea>
                                  </Form.Group>
                                  <Button variant="primary" onClick={() => {
                                    saveRemarks(report?.project?._id)
                                  }} disabled={loader}>{loader === true ? 'Please wait...': 'Save'}</Button>
                                  <Button variant="danger" onClick={handleRemarks}>Cancel</Button>
                                </>
                              :
                              <>
                                <FaRegEdit onClick={handleRemarks} />
                                {
                                  report?.project?.projectmeta && report?.project?.projectmeta?.length > 0 &&
                                  report?.project?.projectmeta.map((meta) => {
                                    if(meta.meta_key === 'remarks'){
                                      return <pre>{meta.meta_value}</pre>
                                    }else{
                                      return null
                                    }
                                  })
                                }
                                </>
                              }
                              
                            </Col>
                          </Row>
                          
                          </Accordion.Body>
                        </Accordion.Item>
                      </>
                      )
                    })}
                    </Accordion>
                  :
                  <p className="text-center mt-5">No activity available.</p>
              }
             
            </div>
            </div>
          </Container>
        </div>
      </div>
      <Modal show={show} onHide={handleClose} centered size="lg" className="AddReportModal AddTimeModal" onShow={() => {selectboxObserver();}}>
        <Modal.Header closeButton>
          <Modal.Title>Manual Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReportSubmit}>
            <Row>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-0 form-group">
                  <Form.Label>Select date</Form.Label>
                  <DatePicker 
                    ref={manuldatePickerRef}
                    key={'manual-date-filter'}
                    name="date"
                    weekStartDayIndex={1}
                    id='manual-datepicker'
                    editable={false}
                    value={fields['date']} 
                    format="YYYY-MM-DD"
                    dateSeparator=" - " 
                    onChange={async (value) => {
                      setFields({...fields, ['date']: value})
                      }
                    }          
                    className="form-control"
                    placeholder="dd/mm/yyyy"
                    range={false}
                    multiple={false}
                  />
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select your Project</Form.Label>
                    <div className="drop--scroll">
                      <Form.Select className="form-control custom-selectbox" id="projects"
                        value={selectedproject._id} onChange={handleProjectSelect} name="project">
                          <option value={''}>Select Project</option>
                        {
                          memberprojects.map(project => (
                            <option data-project={JSON.stringify(project)} value={project._id}>{project.title}</option>
                          ))
                        }
                      </Form.Select>
                    </div>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Workflow</Form.Label>
                  <Form.Select className="form-control custom-selectbox" id="projects-tab"
                    value={selectedWorkflow} onChange={(e) => {setWorkflow(e.target.value)}}>
                      <option value={''}>Select Workflow Tab</option>
                    { selectedproject && Object.keys(selectedproject).length > 0 &&
                      selectedproject?.workflow?.tabs.map(tab => (
                        <option value={tab._id}>{tab.title}</option>
                      ))
                    }
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
                {
                  entries.length > 0 &&
                  <Col sm={12} lg={12}>
                    <Form.Group className="mb-0">
                      <Form.Label>Task List</Form.Label>
                    </Form.Group>
                  </Col>
                }
              </Row>
                {
                  entries.map((entry, index) => (
                    <Row className="mb-3">
                      <Col md={4}>
                        <Dropdown className="select--dropdown">
                          <Dropdown.Toggle variant="success">
                            { 
                              
                              entry.task_title ?
                                <>
                                {entry.task_title}
                                </>
                              :
                              'Select'
                            }

                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                              <div className="drop--scroll">
                                  <Form>
                                      <Form.Group className="form-group mb-3">
                                          <Form.Control type="text" placeholder="Search here.."  value={searchEntries[index]?.tasksearch} onChange={(e) => {handleSearchChange('tasksearch', index, e.target.value)}} />
                                      </Form.Group>
                                  </Form>
                                  {
                                    filteredTasks &&  filteredTasks.length > 0  &&
                                    filteredTasks.map((task) => {
                                      if( searchEntries[index]?.tasksearch && searchEntries[index]?.tasksearch !== ""){
                                        if (task?.title?.toLowerCase().includes(searchEntries[index]?.tasksearch?.toLowerCase())) {
                                          return <Dropdown.Item key={`task-${task?._id}`} onClick={() => handleEntryChange(index, "task", task)} className={ (entry.task === task?._id ) ? 'selected--option' : ''} >{task.title} { (entry.task === task._id ) ? <FaCheck /> : null }</Dropdown.Item>
                                        }else{
                                          return null;
                                        }
                                        
                                      }else{
                                        return <Dropdown.Item key={`task-${task?._id}`} onClick={() => handleEntryChange(index, "task", task)} className={ (entry.task === task?._id ) ? 'selected--option' : ''} >{task.title} { (entry.task === task._id ) ? <FaCheck /> : null }</Dropdown.Item>
                                      }
                                      
                                    })
                                  }
                              </div>
                          </Dropdown.Menu>
                      </Dropdown>


                          {/* <Form.Select
                              value={entry.task}
                              onChange={(e) =>
                                  handleEntryChange(index, "task", e.target.value)
                              }
                              key={`taskin-${selectedWorkflow}`}
                              className="custom-selectbox"
                          >
                              <option value="">Select Task</option>
                              {
                                // Object.values(taskslists).map((tab, index) =>
                                  filteredTasks &&  filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => (
                                        <option value={task._id}>{task.title}</option>
                                      ))
                                  ) : (
                                    null
                                  )
                                // )
                              }
                          </Form.Select> */}
                          {errors[index]?.task && <span className="form-error">{errors[index].task}</span>}
                      </Col>
                      <Col md={3}>
                        {/* <Form.Select
                          className="custom-selectbox"
                          value={entry.start_time}
                          onChange={(e) =>
                              handleEntryChange(index, "start_time", e.target.value)
                          }
                        >
                          {timeSlots.map((slot) => {
                            const isOccupied = isTimeSlotOccupied(slot, occupiedRanges);
                            return (
                              <option key={slot} value={slot} disabled={isOccupied}>
                                {slot}
                              </option>
                            );
                          })}
                        </Form.Select> */}

                      <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="success">
                          { 
                            
                            entry.start_time ?
                              <>
                              {entry.start_time}
                              </>
                            :
                            'Select'
                          }
                        </Dropdown.Toggle>
                          <Dropdown.Menu>
                              <div className="drop--scroll">
                                  <Form>
                                      <Form.Group className="form-group mb-3">
                                          <Form.Control type="text" placeholder="Search here.."  value={searchEntries[index]?.start_time} onChange={(e) => {handleSearchChange('start_time', index, e.target.value)}} />
                                      </Form.Group>
                                  </Form>
                                  {
                                    
                                    timeSlots.map((slot) => {
                                      const isOccupied = isTimeSlotOccupied(slot, occupiedRanges);
                                      if( searchEntries[index]?.start_time && searchEntries[index]?.start_time !== ""){
                                        if (slot?.toLowerCase().includes(searchEntries[index]?.start_time?.toLowerCase())) {
                                          return <Dropdown.Item key={`slot-${slot}-${index}`} onClick={() => handleEntryChange(index, "start_time", slot)} className={ (entry.start_time === slot ) ? 'selected--option' : ''} >{slot} { (entry.start_time === slot ) ? <FaCheck /> : null }</Dropdown.Item>
                                        }else{
                                          return null;
                                        }
                                        
                                      }else{
                                        return <Dropdown.Item key={`slot-${slot}-${index}`} onClick={() => handleEntryChange(index, "start_time", slot)} className={ (entry.start_time === slot ) ? 'selected--option' : ''} >{slot} { (entry.start_time === slot ) ? <FaCheck /> : null }</Dropdown.Item>
                                      }
                                      
                                    })
                                  }
                              </div>
                          </Dropdown.Menu>
                        </Dropdown>
                          
                          {errors[index]?.start_time && <span className="form-error">{errors[index].start_time}</span>}
                      </Col>
                      <Col md={3}>
                          
                          {/* <Form.Select
                          value={entry.end_time}
                          className="custom-selectbox"
                          onChange={(e) =>
                              handleEntryChange(index, "end_time", e.target.value)
                          }>
                            {timeSlots.map((slot) => {
                              const isOccupied = isTimeSlotOccupied(slot, occupiedRanges);
                              return (
                                <option key={slot} value={slot} disabled={isOccupied}>
                                  {slot}
                                </option>
                              );
                            })}
                          </Form.Select> */}
                          <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="success">
                          { 
                            
                            entry.end_time ?
                              <>
                              {entry.end_time}
                              </>
                            :
                            'Select'
                          }
                        </Dropdown.Toggle>
                          <Dropdown.Menu>
                              <div className="drop--scroll">
                                  <Form>
                                      <Form.Group className="form-group mb-3">
                                          <Form.Control type="text" placeholder="Search here.."  value={searchEntries[index]?.end_time} onChange={(e) => {handleSearchChange('end_time', index, e.target.value)}} />
                                      </Form.Group>
                                  </Form>
                                  {
                                    
                                    timeSlots.map((slot) => {
                                      const isOccupied = isTimeSlotOccupied(slot, occupiedRanges);
                                      if( searchEntries[index]?.end_time && searchEntries[index]?.end_time !== ""){
                                        if (slot?.toLowerCase().includes(searchEntries[index]?.end_time?.toLowerCase())) {
                                          return <Dropdown.Item key={`slot-${slot}-${index}`} onClick={() => handleEntryChange(index, "end_time", slot)} className={ (entry.end_time === slot ) ? 'selected--option' : ''} >{slot} { (entry.end_time === slot ) ? <FaCheck /> : null }</Dropdown.Item>
                                        }else{
                                          return null;
                                        }
                                        
                                      }else{
                                        return <Dropdown.Item key={`slot-${slot}-${index}`} onClick={() => handleEntryChange(index, "end_time", slot)} className={ (entry.end_time === slot ) ? 'selected--option' : ''} >{slot} { (entry.end_time === slot ) ? <FaCheck /> : null }</Dropdown.Item>
                                      }
                                      
                                    })
                                  }
                              </div>
                          </Dropdown.Menu>
                        </Dropdown>
                          {errors[index]?.end_time && <span className="form-error">{errors[index].end_time}</span>}
                      </Col>
                      <Col md={2} className="text-right">
                        {
                          index > 0 &&
                            <Button
                                variant="danger"
                                onClick={() => handleRemoveEntry(index)}
                            >
                              <FaTrash />
                            </Button>
                        }
                        {index === entries.length - 1 && (
                            <Button variant="success" className="ms-2" onClick={handleAddEntry}>
                                <FaPlus />
                            </Button>
                        )}
                      </Col>
                    </Row>
                  ))
                }
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleReportSubmit} disabled={loader}>{loader === true ? 'Please wait...': 'Submit'}</Button>
        </Modal.Footer>
      </Modal>

      
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
              {/* <Select2
                defaultValue={1}
                data={[
                  { text: 'Sort By', id: 1 },
                  { text: 'Screenshots', id: 2 },
                  { text: 'Projects', id: 3 },
                ]}
                options={{
                  placeholder: 'Sort By',
                }}
              /> */}
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
              {/* <Select2
                defaultValue={1}
                data={[
                  { text: 'My Reports', id: 1 },
                  { text: 'Hitesh Kumar', id: 2 },
                  { text: 'Tarun Giri', id: 3 },
                ]}
                options={{
                  placeholder: 'Select Reports',
                }}
              /> */}
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