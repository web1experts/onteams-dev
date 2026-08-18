import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/dist/styles.css";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ListGroup,
  Table,
  Badge,
  CardGroup,
  Card,
  Modal,
  Dropdown,
  Accordion,
  ProgressBar,
} from "react-bootstrap";
import Fullscreen from "yet-another-react-lightbox/dist/plugins/fullscreen";
import {
  FaEye,
  FaPlay,
  FaPlus,
  FaCheck,
  FaHistory,
  FaRegKeyboard,
} from "react-icons/fa";
import { MdClose, MdFilterList } from "react-icons/md";
import {
  FiSidebar,
  FiUserX,
  FiMonitor,
  FiCoffee,
  FiClock,
  FiVideo,
  FiBriefcase,
  FiTarget,
  FiPause,
  FiUsers,
  FiCalendar,
  FiUser,
  FiTrash2,
  FiCheckCircle,
  FiCamera,
  FiSettings,
} from "react-icons/fi";
import { GrExpand } from "react-icons/gr";
import { TbScreenshot } from "react-icons/tb";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { BsDash } from "react-icons/bs";
import { LuTimer, LuUsers, LuFileText, LuMouse, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";
import { GoPulse } from "react-icons/go";
import {
  BsArrowsFullscreen,
  BsFullscreen,
  BsFullscreenExit,
  BsArrowClockwise,
  BsArrowLeftCircleFill,
  BsArrowRightCircleFill,
} from "react-icons/bs";
import {
  MdOutlineClose,
  MdOutlineSearch,
  MdOutlineVideoLibrary,
} from "react-icons/md";
import {
  toggleSidebar,
  toggleSidebarSmall,
} from "../../redux/actions/common.action";
import {
  getliveActivity,
  getRecoredActivity,
  deleteRecoredActivity,
  getMemberRecoredActivity,
} from "../../redux/actions/activity.action";
import {
  selectboxObserver,
  groupSelectboxObserver,
} from "../../helpers/commonfunctions";
import {
  socket,
  refreshSocket,
  currentMemberProfile,
} from "../../helpers/auth";
import {
  getMemberdata,
  showAmPmtime,
  generateTimeRange,
  convertSecondstoTime,
  timeStringToDate,
  timezonesData,
} from "../../helpers/commonfunctions";
import DatePicker from "react-multi-date-picker";
import "media-chrome";
import "media-chrome/dist/menu";
import ManualTime from "./ManualTime";
import { addManualTime } from "../../redux/actions/report.action";
import { ListTasks } from "../../redux/actions/task.action";
import { getSingleProjectReport } from "../../redux/actions/report.action";
import {
  ListProjectsByMembers,
  ListMemberProjects,
} from "../../redux/actions/project.action";
import debounce from "lodash.debounce";
import { getActiveSubscription } from "../../redux/actions/subscription.action";
import {
  Listmembers,
  updateMemberRecordingSettings,
  getRecordingTypes,
} from "../../redux/actions/members.action";
import { getTeams } from "../../redux/actions/team.action";
import { getAssignedTeamsOrMembersByRole } from "../../redux/actions/permission.action";
import ActivityOverviewChart from "./ActivityOverviewChart";
import PaginatedList from "./PaginatedList";

function TimeTrackingPage() {
  const inputRef = useRef(null);
  const filterDisplayLabels = {
    today: "Today",
    yesterday: "Yesterday",
    "7days": "Last 7 days",
    "last-week": "Last week",
    "last2-weeks": "Last 2 weeks",
    "this-month": "This month",
    "last-month": "Last month",
    custom: "Custom",
  };
  const [memberTimezone, setMemberTimezone] = useState("company");
  const [selected, setSelected] = useState(null);
  const subscriptionState = useSelector((state) => state.subscription);
  const [projectFilter, setProjectFilter] = useState({ status: "in-progress" });
  const apiPermission = useSelector((state) => state.permissions);
  const [showRecordSettings, setShowRecordSettings] = useState(false);
  const memberProfile = currentMemberProfile();
  const [recordingSettings, setRecordingSettings] = useState({});
  let totalhours = 0;
  let totalProjecthours = 0;
  const currentMember = getMemberdata();
  const [spinner, setSpinner] = useState(true);
  const [activityspinner, setActSpinner] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [cardNumbers, setCardNumbers] = useState({
    activeCount: 0,
    pauseCount: 0,
    inactiveCount: 0,
    totalHours: 0,
  });
  const [showEvents, setShowEvents] = useState(false);
  const [eventsData, setEventsData] = useState(false);
  const memberState = useSelector((state) => state.member);
  //  const [allMembers, setAllmembers] = useState([]);
  const handleShow = () => setShow(true);
  const [totalTaskDuration, setTotalTaskDuration] = useState(0);
  const handleProjectShow = () => {
    setProjectShow(true);
  };

  const handleRecordSettingsClose = () => {
    setShowRecordSettings(false);
  };
  const [showSelect, setProjectShow] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const MemberprojectFeed = useSelector(
    (state) => state.project.memberProjects,
  );
  const teamsState = useSelector((state) => state.teams);
  const [teamfeed, setTeamFeed] = useState([]);
  const [assignedTeamsOrMembers, setAssignedTeamsOrMembers] = useState({});
  const [isActiveView, setIsActiveView] = useState(2);
  const [liveStreaming, setLiveStreaming] = useState({});
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [recordedRefresh, setRecordedRefresh] = useState(true);
  const handleSidebar = () =>
    dispatch(toggleSidebar(commonState.sidebar_open ? false : true));
  const handleSidebarSmall = () =>
    dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true));
  const options = { day: "2-digit", month: "long", year: "numeric" };
  const [currentActivity, setCurrentActivity] = useState(false);
  const dispatch = useDispatch();
  const fullscreenRef = React.useRef(null);
  const datePickerRef = useRef(null);
  const datePickerRefto = useRef(null);
  const [activeTab, setActiveTab] = useState("Live");
  const [screenshotTab, setScreenshotTab] = useState("Screenshots");
  const [activeInnerTab, setActiveInnerTab] = useState("InnerLive");
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [entries, setEntries] = useState([]);
  const [timings, setTimings] = useState({
    start_time: "",
    end_time: "",
    date: "",
  });
  const [memberprojects, setMemberProjects] = useState([]);
  const [occupiedRanges, setOccupiedRanges] = useState([]);
  const [timeSlots, setTimeslots] = useState([]);
  const [fields, setFields] = useState({
    date: new Date().toLocaleDateString("en-CA"),
  });
  const [searchEntries, setSearchEntries] = useState([]);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loader, setLoader] = useState(false);
  const [selectedproject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState({});
  const [selectedWorkflow, setWorkflow] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const taskFeed = useSelector((state) => state.task.tasks);
  const [taskslists, setTasksLists] = useState([]);
  const reportState = useSelector((state) => state.reports);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const manuldatePickerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postMedia, setPostMedia] = useState([]);
  const [liveactivities, setLiveactivities] = useState([]);
  const [recordedactivities, setRecordedActivities] = useState([]);
  const [memberActivities, setMemberActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setsearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "live",
    member:
      memberProfile?.role?.permissions?.assigned_teams
        ?.specific_peoples_only === true ||
      memberProfile?.role?.permissions?.assigned_teams?.specific_teams_only ===
        true
        ? "all"
        : memberProfile?._id,
    timezone: "company",
  });
  const filtersRef = useRef(filters);
  const [date, setDate] = useState("");
  const [showFilter, setFilterShow] = useState(false);
  const [showInnerFilter, setInnerFilterShow] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("today");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [reportPickerOpen, setReportPickerOpen] = useState(false);
  const [showSearch, setSearchShow] = useState(false);
  const [selectedScreenshots, setSelectedScreenshots] = useState({});
  const activitystate = useSelector((state) => state.activity);
  const [manualListCount, setManualListCount] = useState(0);

  const crntDashboard = (() => {
    try {
      const data = localStorage.getItem("current_dashboard");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  })();

  const crntUser = (() => {
    try {
      const data = localStorage.getItem("current_loggedin_user");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  })();

  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);

  const handleInnerFilterClose = () => setInnerFilterShow(false);
  const handleInnerFilterShow = () => setInnerFilterShow(true);

  const [filtereddate, setFilteredDate] = useState([
    new Date().toISOString().split("T")[0],
  ]);
  const [currentVideoPage, setCurrentVideoPage] = useState({});
  const videosPerPage = 12; // Adjust as needed

  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);
  const [projectToggle, setProjectToggle] = useState(false);
  const activeTabRef = useRef(activeTab);
  const currentActivityTabRef = useRef(currentActivity);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    currentActivityTabRef.current = currentActivity;
  }, [currentActivity]);

  useEffect(() => {
    if (subscriptionState.activeSubscription) {
      setActiveSubscription(subscriptionState.activeSubscription);
    }
  }, [subscriptionState.activeSubscription]);

  const viewEvents = (metas) => {
    if (metas?.length > 0) {
      const eventMeta = metas.find((item) => item.meta_key === "events_data");

      if (eventMeta?.meta_value) {
        setEventsData(eventMeta.meta_value);
      }
      setShowEvents(true);
    }
  };

  useEffect(() => {
    if (teamsState && teamsState.teams) {
      setTeamFeed(teamsState.teams);
    }
  }, [teamsState]);

  useEffect(() => {
    if (memberState?.recordingTypes) {
      console.log(memberState?.recordingTypes);
      setRecordingSettings(
        memberState?.recordingTypes || {
          screenshot_recording: "disabled",
          video_recording: "disabled",
          live_streaming: "disabled",
        },
      );
    }
  }, [memberState?.recordingTypes]);

  const maxMouse = Math.max(
    ...(eventsData?.[0]?.events_count || []).map(
      (l) => l?.mouse_click_count || 0,
    ),
    1,
  );

  const maxKeyboard = Math.max(
    ...(eventsData?.[0]?.events_count || []).map((l) => l?.keyboard_count || 0),
    1,
  );

  const handleToggles = () => {
    if (commonState.sidebar_small === false) {
      handleSidebarSmall();
    } else {
      setProjectToggle(false);
      handleSidebarSmall();
    }
  };
  const handleClose = () => {
    setShow(false);
    setFields({});
    setEntries([]);
    setSelectedProject("");
    setErrors([]);
    setTimings({ start_time: "", end_time: "", date: "" });
  };
  const commonState = useSelector((state) => state.common);

  const handleProjectClose = () => {
    setWorkflow("");
    setSelectedProject("");
    setFilteredTasks([]);
    setTimings({ start_time: "", end_time: "", date: "" });
    setProjectShow(false);
  };

  const handleClick = (activity) => {
    setIsActive(true);
    setRecordedRefresh(true);

    socket.emit("get-tracker-status-update", { userID: activity._id });
    setCurrentActivity(activity);

    if (activeTab === "Recordings" || activeInnerTab === "InnerRecorded") {
      setActiveInnerTab("InnerRecorded");
    } else {
      setActiveInnerTab("InnerLive");
    }
  };

  const handleCloseNew = () => {
    setShowNew(false);
  };
  const handleNewShow = () => setShowNew(true);
  const videoRef = useRef(null);
  const videoPlyrRef = useRef(null);

  const handleSelectRecording = (activityId, index) => {
    setSelectedScreenshots((prev) => {
      const selectedForActivity = prev[activityId] || [];
      const isSelected = selectedForActivity.includes(index);

      return {
        ...prev,
        [activityId]: isSelected
          ? selectedForActivity.filter((i) => i !== index)
          : [...selectedForActivity, index],
      };
    });
  };

  const deleteRecordedData = () => {
    dispatch(
      deleteRecoredActivity({
        type: screenshotTab.toLowerCase(),
        data: selectedScreenshots,
      }),
    );
  };

  const peerConnections = {};
  function startsharing(userID, status) {
    socket.emit("joinRoom", userID);
    if (status === true) {
      setActSpinner(true);
      setTimeout(function () {
        setStreamError("");
        socket.emit(
          "watcher",
          socket.id,
          userID,
          userID,
          currentMember.role?.slug,
        );
      }, 800);
    }
  }

  function leaveRoom(room) {
    socket.emit("leaveRoom", socket.id, room);
  }

  const updateRecodingType = async (payload) => {
    dispatch(updateMemberRecordingSettings(currentActivity?._id, payload));
  };

  const handleLiveActivityListInterval = async () => {
    const currentFilters = filtersRef.current;

    if (
      activeTabRef.current === "Live" &&
      currentActivityTabRef.current === false
    ) {
      // setSpinner(true);
      let selectedfilters = {
        currentPage: currentPage,
        status: currentFilters.status,
      };

      if (Object.keys(currentFilters).length > 0) {
        selectedfilters = { ...selectedfilters, ...currentFilters };
      }
      await dispatch(getliveActivity(selectedfilters));
    }
  };

  const handleLiveActivityList = async () => {
    setSpinner(true);
    const currentFilters = filtersRef.current;

    let selectedfilters = {
      currentPage: currentPage,
      status: currentFilters.status,
      date_range: filtereddate,
    };

    if (Object.keys(currentFilters).length > 0) {
      selectedfilters = { ...selectedfilters, ...currentFilters };
    }

    await dispatch(getliveActivity(selectedfilters));
  };

  const handleFilteredLiveActivityList = async () => {
    setSpinner(true);
    const currentFilters = filtersRef.current;
    const cleanedFilteredDate = filtereddate.filter(
      (d) => d && d.trim() !== "",
    );
    let selectedfilters = {
      currentPage: currentPage,
      date_range: cleanedFilteredDate,
    };

    if (Object.keys(currentFilters).length > 0) {
      selectedfilters = { ...selectedfilters, ...currentFilters };
    }

    selectedfilters = { ...selectedfilters, ["status"]: "recordings" };
    await dispatch(getliveActivity(selectedfilters));
    console.log("one");
    setSpinner(false);
  };

  const handleRecordedActivity = async () => {
    setRecordedActivities([]);
    setActSpinner(true);
    const cleanedFilteredDate = filtereddate.filter(
      (d) => d && d.trim() !== "",
    );
    await dispatch(
      getRecoredActivity({
        id: currentActivity._id,
        status: "recorded",
        date_range: cleanedFilteredDate,
        timezone: memberTimezone,
      }),
    );
    // setActSpinner(false);
  };

  const memberTodaysActivity = async (date = null) => {
    setOccupiedRanges([]);
    await dispatch(
      getMemberRecoredActivity(memberProfile._id, "recorded", date),
    );
  };

  useEffect(() => {
    // if (selectedFilter !== "custom" && isActive === true) {

    if (selectedFilter !== "custom" && isActive === true) {
      handleRecordedActivity();
    } else if (selectedFilter !== "custom" && activeTab === "Recordings") {
      handleFilteredLiveActivityList();
    }
  }, [filtereddate]);

  useEffect(() => {
    handleListProjects();
    dispatch(getActiveSubscription());
    dispatch(getAssignedTeamsOrMembersByRole(memberProfile?.role?._id));
    // dispatch(Listmembers({currentPage: 0, searchTerm: '', has_limit: false}));
    dispatch(getTeams());
  }, [dispatch]);

  useEffect(() => {
    const check = ["undefined", undefined, "null", null, ""];
    if (MemberprojectFeed && MemberprojectFeed.projectData) {
      setMemberProjects(MemberprojectFeed.projectData);
    }
  }, [MemberprojectFeed]);

  useEffect(() => {
    setLoader(false);
    if (reportState.success) {
      setFields({ date: new Date() });
      handleClose();
    }

    if (reportState.manualTimeList) {
      // setManualListCount(Object.keys(reportState.manualTimeList)?.length);
      setManualListCount(
        Object.values(reportState.manualTimeList || {}).reduce(
          (total, value) => total + (Array.isArray(value) ? value.length : 0),
          0,
        ),
      );
    }
  }, [reportState]);

  const handleToggler = (event) => {
    setIsScreenActive((current) => !current);
  };

  useEffect(() => {
    if (!isScreenActive) {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }

      setIsFullscreen(false);
    }
  }, [isScreenActive]);

  const handleListProjects = async () => {
    if (memberProfile?.role?.slug === "owner") {
      await dispatch(ListProjectsByMembers({ members: "all" }));
    } else {
      await dispatch(ListProjectsByMembers({ members: [memberProfile?._id] }));
    }

    await dispatch(ListMemberProjects(currentMember?._id));
  };

  useEffect(() => {
    setLiveStreaming({
      ...liveStreaming,
      [currentActivity?._id]:
        currentActivity?.memberMeta?.live_streaming?.meta_value || "disabled",
    });
    if (currentActivity?.latestActivity?.status === false) {
      if (activeInnerTab === "InnerLive") {
        setActSpinner(false);
      }
    }
    if (
      (currentActivity !== false &&
        activeInnerTab === "InnerRecorded" &&
        recordedRefresh === true) ||
      (currentActivity !== false &&
        activeTab === "Recordings" &&
        recordedRefresh === true)
    ) {
      // setActiveInnerTab("InnerRecorded")
      setRecordedActivities([]);
      handleRecordedActivity();
    }

    // else{
    //   updateStream()
    // }
  }, [currentActivity]);

  useEffect(() => {
    if (
      liveStreaming[currentActivity?._id] &&
      liveStreaming[currentActivity?._id] !== "disabled"
    ) {
      updateStream();
    }
  }, [liveStreaming]);

  useEffect(() => {
    if (Object.keys(filters).length > 0 && !showFilter) {
      filtersRef.current = filters;
      handleLiveActivityList();
    }
  }, [filters]);

  useEffect(() => {
    if (memberActivities) {
      const data = calculateOccupiedRanges(memberActivities);
      setOccupiedRanges(data);
    }
  }, [memberActivities]);

  const updateStream = () => {
    if (
      (currentActivity !== false &&
        activeTab === "Live" &&
        liveStreaming[currentActivity?._id] &&
        liveStreaming[currentActivity?._id] === "enable") ||
      (currentActivity !== false &&
        activeInnerTab === "InnerLive" &&
        liveStreaming[currentActivity?._id] &&
        liveStreaming[currentActivity?._id] === "enable")
    ) {
      leaveRoom(currentActivity?._id);
      console.log("two");
      setSpinner(false);
      startsharing(
        currentActivity._id,
        currentActivity?.latestActivity?.status,
      );
    }
  };

  const calculateOccupiedRangesOLd = (data) => {
    return data.map((item) => {
      const startUTC = new Date(item.createdAt);
      const endUTC = new Date(startUTC.getTime() + item.duration * 1000);

      // Convert to IST by adding 5.5 hours (19800000 ms)
      const startIST = new Date(startUTC.getTime() + 19800000);
      const endIST = new Date(endUTC.getTime() + 19800000);

      // Return in ISO format with IST offset
      return {
        start: startIST.toISOString().replace("Z", "+05:30"),
        end: endIST.toISOString().replace("Z", "+05:30"),
      };
    });
  };

  const calculateOccupiedRanges = (data) => {
    return data.map((item) => {
      const start = new Date(item.createdAt);
      const end = new Date(start.getTime() + item.duration * 1000);

      return {
        start,
        end,
      };
    });
  };

  useEffect(() => {
    if (occupiedRanges) {
      setTimeslots(generateTimeSlots(10));
    }
  }, [occupiedRanges]);

  useEffect(() => {
    setTimeslots(generateTimeSlots(10));
  }, [timings.date]);

  const generateTimeSlots = (intervalMinutes = 10) => {
    const slots = [];

    const selectedDate =
      timings?.date && timings?.date !== ""
        ? new Date(timings.date)
        : new Date();

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const now = new Date();

    let endTime;
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (isToday) {
      endTime = now;
    } else {
      endTime = new Date(startOfDay);
      endTime.setHours(23, 59, 59, 999);
    }

    let current = new Date(startOfDay);

    while (current <= endTime) {
      const hours24 = current.getHours().toString().padStart(2, "0");
      const minutes = current.getMinutes().toString().padStart(2, "0");

      const ampm = current.getHours() >= 12 ? "PM" : "AM";

      // 24-hour format WITH AM/PM
      slots.push(`${hours24}:${minutes} ${ampm}`);

      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return slots;
  };

  const generateTimeSlotsNew = (intervalMinutes = 10) => {
    const slots = [];

    const selectedDate =
      timings?.date && timings?.date !== ""
        ? new Date(timings.date)
        : new Date();

    // Start of selected day
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Current real time
    const now = new Date();

    // Determine end time
    let endTime;

    const isToday = selectedDate.toDateString() === now.toDateString();

    if (isToday) {
      // If selected date is today → stop at current time
      endTime = now;
    } else {
      // If past date → allow full day
      endTime = new Date(startOfDay);
      endTime.setHours(23, 59, 59, 999);
    }

    let current = new Date(startOfDay);

    while (current <= endTime) {
      let hours = current.getHours();
      const minutes = current.getMinutes().toString().padStart(2, "0");

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      const formattedHours = hours.toString().padStart(2, "0");

      slots.push(`${formattedHours}:${minutes} ${ampm}`);

      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return slots;
  };

  // Generate time slots for the day
  const generateTimeSlotsOld = (intervalMinutes = 10) => {
    const slots = [];
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

    let current = new Date(startOfDay);
    while (current <= endOfDay) {
      const hours = current.getHours().toString().padStart(2, "0"); // Format hours
      const minutes = current.getMinutes().toString().padStart(2, "0"); // Format minutes
      const ampm = hours >= 12 ? "PM" : "AM";
      slots.push(`${hours}:${minutes} ${ampm}`); // Add formatted time
      current.setMinutes(current.getMinutes() + intervalMinutes); // Increment by interval
    }
    return slots;
  };

  // Check if a time slot is occupied
  // const isTimeSlotOccupied = (time, ranges) => {
  //   if (!ranges || ranges.length === 0) {
  //     // If ranges is null, undefined, or empty, return false (time slot is not occupied)
  //     return false;
  //   }

  //   // Convert time string (HH:mm) to a Date object on the same day
  //   const timeDate = new Date();
  //   const [hours, minutes] = time.split(":");
  //   timeDate.setHours(hours, minutes, 0, 0); // Set time based on HH:mm

  //   return ranges.some(({ start, end }) => {
  //     // Convert start time from ISO string to Date object
  //     const startDate = new Date(start);

  //     // If end time exists, convert it to Date; otherwise, set endDate to null
  //     const endDate = end ? new Date(end) : null;

  //     // Check if the time falls within the range
  //     if (endDate) {
  //       // If there is an end time, check if time is between start and end
  //       return timeDate >= startDate && timeDate < endDate;
  //     }

  //     // If there's no end time, check if the time is after the start time
  //     return timeDate >= startDate;
  //   });
  // };

  const isTimeSlotOccupied = (time, ranges) => {
    if (!ranges || ranges.length === 0) {
      return false; // no ranges → slot is free
    }

    // Determine base date: timings.date or today
    const baseDate = timings?.date ? new Date(timings.date) : new Date();

    // Create timeDate from baseDate + HH:mm
    const [hours, minutes] = time.split(":");
    const timeDate = new Date(baseDate);
    timeDate.setHours(hours, minutes, 0, 0);

    return ranges.some(({ start, end }) => {
      const startTime = new Date(start);
      const endTime = end ? new Date(end) : null;

      // Normalize start and end to the baseDate
      const startDate = new Date(baseDate);
      startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      const endDate = endTime
        ? new Date(baseDate).setHours(
            endTime.getHours(),
            endTime.getMinutes(),
            0,
            0,
          )
        : null;

      if (endDate) {
        return timeDate >= startDate && timeDate < endDate;
      }
      return timeDate >= startDate;
    });
  };

  useEffect(() => {
    const totalTaskDuration = entries.reduce((total, entry) => {
      const startTime = timeStringToDate(entry.start_time, new Date());
      const endTime = timeStringToDate(entry.end_time, new Date());
      const taskDurationInMilliseconds = endTime - startTime;
      const taskDuration = Math.round(taskDurationInMilliseconds / 1000);
      return total + taskDuration;
    }, 0);
    setTotalTaskDuration(totalTaskDuration);
  }, [entries]);

  // Helper: normalize any date-like to "YYYY-MM-DD"
  const ymd = (dateLike) => {
    if (!dateLike) return null;
    const str = String(dateLike);
    const m = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1]; // already YYYY-MM-DD
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };

  // Helper: HH:mm on a given date → Date (local)
  const parseTimeOnDate = (time, dateLike) => {
    const day = ymd(dateLike);
    if (!day) return null;
    const [Y, M, D] = day.split("-").map(Number);
    const [h, m] = time.split(":").map(Number);
    return new Date(Y, M - 1, D, h, m, 0, 0);
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

      const entryDay = ymd(entry.date);
      if (entry.start_time && entry.end_time && entryDay) {
        const currentStart = parseTimeOnDate(entry.start_time, entry.date);
        const currentEnd = parseTimeOnDate(entry.end_time, entry.date);

        if (currentStart >= currentEnd) {
          entryErrors.end_time = "End time must be greater than start time.";
        }

        // ✅ Only compare with entries on the same YYYY-MM-DD
        entries.forEach((otherEntry, otherIndex) => {
          if (
            otherIndex !== index &&
            otherEntry.start_time &&
            otherEntry.end_time &&
            ymd(otherEntry.date) === entryDay
          ) {
            const otherStart = parseTimeOnDate(
              otherEntry.start_time,
              otherEntry.date,
            );
            const otherEnd = parseTimeOnDate(
              otherEntry.end_time,
              otherEntry.date,
            );

            if (
              otherStart &&
              otherEnd &&
              currentStart < otherEnd &&
              currentEnd > otherStart
            ) {
              entryErrors.start_time =
                "Time range overlaps with another entry.";
              entryErrors.end_time = "Time range overlaps with another entry.";
            }
          }
        });
      }

      return entryErrors;
    });

    const hasErrors = errors.some(
      (entryErrors) => Object.keys(entryErrors).length > 0,
    );

    if (hasErrors) {
      setErrors(errors); // Update the errors state to show errors below each field
      return false; // Prevent form submission
    } else {
      setErrors([]);
      setLoader(true);
      const payload = { entries };

      dispatch(addManualTime({ ...payload, ...fields }));
    }
  };

  useEffect(() => {
    if (apiPermission?.assignedTeamsOrMembers) {
      setAssignedTeamsOrMembers(apiPermission?.assignedTeamsOrMembers);
      setTimeout(() => {
        groupSelectboxObserver();
      }, 700);
    }
  }, [apiPermission?.assignedTeamsOrMembers]);

  useEffect(() => {
    refreshSocket();
    selectboxObserver();
    setTimeout(() => {
      groupSelectboxObserver();
    }, 600);
    // handleLiveActivityList();

    socket.on("receive_record_types", async (record_types = {}) => {
      if (activeTab === "Live") {
        // setLiveStreaming(record_types?.live_streaming || "disabled");
        setLiveStreaming({
          ...liveStreaming,
          [currentActivity?._id]: record_types?.live_streaming || "disabled",
        });
      }
    });

    socket.on("streamingError", (roomId, message) => {
      if (roomId === currentActivity?._id) {
        setStreamError(message);
      }
    });

    socket.on("trackerstateUpdate", (memberData, status = false) => {
      setRecordedRefresh(false);
      // setLiveactivities((prevActivities) => {
      //   if (
      //     memberData &&
      //     memberData._id &&
      //     prevActivities &&
      //     prevActivities.length > 0
      //   ) {
      //     const updatedActivities = prevActivities.map((activity) => {
      //       if (activity._id === memberData._id) {
      //         const updatedMemberData = {
      //           ...memberData,
      //           latestActivity: {
      //             ...memberData.latestActivity,
      //             status: status, // Update the status here
      //           },
      //         };

      //         // Merge updatedMemberData with the activity
      //         return { ...activity, ...updatedMemberData };
      //       }
      //       return activity; // Return unchanged activity if no match
      //     });

      //     return updatedActivities;
      //   }

      //   // If no update is needed, return the previous state
      //   return prevActivities;
      // });

      setLiveactivities((prevActivities) => {
        if (memberData?._id && prevActivities?.length > 0) {
          return prevActivities.map((activity) => {
            if (activity._id === memberData._id) {
              return {
                ...activity,
                ...memberData,
                latestActivity: {
                  ...activity.latestActivity,
                  ...memberData.latestActivity,
                  status, // always update status
                },
              };
            }
            return activity;
          });
        }
        return prevActivities;
      });

      setCurrentActivity((prev) => {
        if (prev && prev._id === memberData._id) {
          return {
            ...prev,
            ...memberData,
            latestActivity: {
              ...prev.latestActivity,
              ...memberData.latestActivity,
              status,
            },
          };
        }
        return prev;
      });

      // handleLiveActivityList() if required
    });

    socket.on("offer", function (id, description, roomId) {
      if (peerConnections[id]) {
        peerConnections[id].close();
        delete peerConnections[id];
      }

      if (!peerConnections[id]) {
        peerConnections[id] = new RTCPeerConnection({
          // User stun server for connection with different networks
          iceServers: [
            {
              urls: "turn:13.51.172.133:3478",
              username: "web1experts", // Optional if using 'lt-cred-mech'
              credential: "PtJJc0FUvuKP3jkn", // Optional if using 'lt-cred-mech'
            },
          ],
        });
      }

      peerConnections[id]
        .setRemoteDescription(new RTCSessionDescription(description))
        .then(() => peerConnections[id].createAnswer())
        .then((sdp) => peerConnections[id].setLocalDescription(sdp))
        .then(function () {
          socket.emit(
            "answer",
            id,
            peerConnections[id].localDescription,
            roomId,
          );
        });
      peerConnections[id].onaddstream = function (event) {
        if (event.stream && videoRef.current) {
          videoRef.current.srcObject = event.stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
        }
      };
      peerConnections[id].onicecandidate = function (event) {
        if (event.candidate) {
          socket.emit("candidate", id, event.candidate, roomId, "viwers");
        }
      };

      // peerConnections[id].addEventListener("iceconnectionstatechange", () => {
      //   if (
      //     peerConnections[id].iceConnectionState === "connected" ||
      //     peerConnections[id].iceConnectionState === "completed" ||
      //     peerConnections[id].iceConnectionState === "disconnected" ||
      //     peerConnections[id].iceConnectionState === "failed"
      //   ) {
      //     if (
      //       peerConnections[id].iceConnectionState === "disconnected" ||
      //       peerConnections[id].iceConnectionState === "failed"
      //     ) {
      //       setActSpinner(false);
      //       setSpinner( false)
      //     }
      //   }
      // });

      peerConnections[id].onconnectionstatechange = () => {
        console.log(
          "Connection state changed:",
          peerConnections[id].connectionState,
        );
        if (
          peerConnections[id].connectionState === "failed" ||
          peerConnections[id].connectionState === "disconnected"
        ) {
          setStreamError(
            "Unable to connect with the desktop app. Please try later.",
          );
          if (activeInnerTab === "InnerLive") {
          }
          socket.emit("tracker-status-update", {
            userID: currentActivity?._id,
            status: false,
          });
        } else if (peerConnections[id].connectionState === "connected") {
          setStreamError("");
        }
      };
      // peerConnections[id].addEventListener("iceconnectionstatechange", () => {
      //   const state = peerConnections[id].iceConnectionState;
      //   console.log('current state:: ', state)
      //   // Handle all relevant states
      //   if (["connected", "completed", "disconnected", "failed"].includes(state)) {
      //     // Stop spinners if disconnected or failed
      //     if (["disconnected", "failed","completed"].includes(state)) {
      //       setActSpinner(false);
      //       setSpinner(false);
      //     }
      //   }
      // });

      peerConnections[id].oniceconnectionstatechange = () => {
        console.log(
          "ICE connection state changed:",
          peerConnections[id].iceConnectionState,
        );
      };
    });

    socket.on("candidate", function (id, candidate, roomId) {
      if (peerConnections[id]) {
        const rtcPeerConnection = peerConnections[id];
        peerConnections[id]
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) => console.error(e));
      }
    });

    // Fires if connection fails
    socket.on("connect_error", (err) => {
      console.error("❌ Connection failed:", err.message);
    });

    // Fires when disconnected
    socket.on("disconnect", (reason) => {
      console.log("⚡ Disconnected:", reason);
    });

    // setSpinner(true);

    setInterval(function () {
      handleLiveActivityListInterval();
    }, 60000);

    memberTodaysActivity([new Date().toISOString().split("T")[0]]);
  }, []);

  useEffect(() => {
    if (activitystate?.liveactivities?.memberData) {
      setLiveactivities(activitystate.liveactivities.memberData);
      if (
        currentActivity &&
        activeTab === "Live" &&
        activeInnerTab !== "InnerLive"
      ) {
        const updatedActivity = activitystate.liveactivities.memberData.find(
          (m) => m._id.toString() === currentActivity._id.toString(),
        );
        setCurrentActivity(updatedActivity);
      }
      setTimeout(() => {
        setActSpinner(false);
        setSpinner(false);
      }, 2500);
    }

    if (activitystate?.recordedActivity) {
      setSelectedScreenshots({});
      setRecordedActivities(activitystate?.recordedActivity);
      setTimeout(() => {
        setActSpinner(false);
        setSpinner(false);
      }, 2500);
    }

    if (activitystate?.MemberrecordedActivity) {
      setMemberActivities(activitystate.MemberrecordedActivity);
      setTimeout(() => {
        setActSpinner(false);
        setSpinner(false);
      }, 2500);
    }

    if (activitystate.success) {
      handleRecordedActivity();
    }
  }, [activitystate]);

  useEffect(() => {
    groupSelectboxObserver();
  }, [activitystate?.recordedActivity]);

  useEffect(() => {
    let activeCount = 0;
    let pauseCount = 0;
    let inactiveCount = 0;
    let totalHours = 0;
    // If liveactivities contains all members and some may have no activity
    liveactivities.forEach((activity) => {
      if (activity?.latestActivity?.status === true) {
        activeCount++;
      } else if (activity?.latestActivity?.status === false) {
        pauseCount++;
      } else {
        inactiveCount++;
      }
      totalHours += activity.totalDuration || 0;
    });
    setCardNumbers({
      activeCount,
      pauseCount,
      inactiveCount,
      totalHours,
    });
  }, [liveactivities]);

  useEffect(() => {
    if (
      activeInnerTab === "InnerRecorded" &&
      currentActivity &&
      activeTab === "Recordings"
    ) {
      setRecordedActivities([]);
      handleRecordedActivity();
    }
  }, [memberTimezone]);
  // Debounced search handler
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
      }, 1000), // 1 sec debounce
    [],
  );

  const handlefilterchange = (name, value) => {
    if (name === "search") {
      // only debounce search
      debouncedUpdateSearch(value);
    } else {
      setFilters((prev) => {
        const updated = { ...prev };

        if (name === "member") {
          delete updated.team; // remove team when member changes
        }

        if (name === "team") {
          delete updated.member; // remove member when team changes
        }

        updated[name] = value;
        return updated;
      });
      // setFilters({ ...filters, [name]: value });
    }
  };

  const handleTimeChange = (name, value) => {
    setTimings({ ...timings, [name]: value });
  };
  const handleEntryChange = () => {
    const updatedEntries = [...entries];
    updatedEntries.push({
      task: selectedTask._id,
      task_title: selectedTask.title,
      project: selectedproject?._id,
      project_title: selectedproject?.title,
      start_time: timings?.start_time,
      end_time: timings?.end_time,
      date: timings?.date,
    });

    setEntries(updatedEntries);
    handleProjectClose();
  };

  const handleSearchChange = (name, index, searchvalue) => {
    setSearchEntries((prevEntries) => {
      const updatedEntries = [...prevEntries]; // Create a shallow copy of the array

      // If the index is within the bounds of the current array, update the entry
      if (index < updatedEntries.length) {
        updatedEntries[index] = {
          ...updatedEntries[index], // Spread the current entry
          [name]: searchvalue, // Update the specific key with the new value
        };
      } else {
        // If the index is out of bounds, create a new entry
        const newEntry = {
          tasksearch: name === "tasksearch" ? searchvalue : "",
          start_time: name === "start_time" ? searchvalue : "",
          end_time: name === "end_time" ? searchvalue : "",
        };
        updatedEntries.push(newEntry); // Add the new entry to the array
      }

      return updatedEntries; // Return the updated array
    });
  };

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
    setPostMedia(slides);
    setOpen(true);
  };

  useEffect(() => {
    selectboxObserver();
    setTimeout(() => {
      groupSelectboxObserver();
    }, 600);
    setFilters({ ...filters, ["status"]: activeTab.toLowerCase() });
    // if (activeTab.toLowerCase() !== "recordings") {
    //   handleLiveActivityList();
    // }
  }, [activeTab]);

  useEffect(() => {
    // setActSpinner( false );
    // setSpinner( false)
    if (activeInnerTab === "InnerRecorded" && currentActivity) {
      setRecordedActivities([]);
      handleRecordedActivity();
      setTimeout(() => {
        groupSelectboxObserver();
      }, 900);
    }
    selectboxObserver();
  }, [activeInnerTab]);

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

  useEffect(() => {
    setSelectedScreenshots({});
  }, [screenshotTab]);

  const handleRemoveEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };

  const handleProjectFilter = ({ target: { name, value } }) => {
    setProjectFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectSelect = async (project) => {
    // const selectedOption = selectedOptions[0];

    // Retrieve the data-project attribute value
    // const projectData = JSON.parse(selectedOption.getAttribute("data-project"));
    setSelectedProject(project);
    if (project?.workflow?.tabs && project.workflow.tabs.length > 0) {
      setWorkflow(project.workflow.tabs[0]?._id);
    }
    setFilteredTasks([]);
    setSelectedTask({});
    await dispatch(ListTasks(project?._id));
    await dispatch(getSingleProjectReport(project?._id));
  };

  useEffect(() => {
    // setEntries([]);
    if (taskFeed?.taskData && Object.keys(taskFeed.taskData).length > 0) {
      setTasksLists(taskFeed.taskData);
      setFilteredTasks(taskFeed?.taskData[selectedWorkflow]?.tasks);
    }
  }, [taskFeed, dispatch]);

  const isMemberSelected = (selectedTeamMembers = {}, memberId) => {
    return Object.values(selectedTeamMembers).some((membersArray) =>
      membersArray.includes(memberId),
    );
  };

  const getMembersFromTeams = (selectedTeamIds) => {
    if (!Array.isArray(teamfeed) || !Array.isArray(selectedTeamIds)) {
      return [];
    }

    const seen = new Set();
    const result = [];

    teamfeed.forEach((team) => {
      if (!selectedTeamIds.includes(String(team?._id))) return;

      if (!Array.isArray(team?.members)) return;

      team.members.forEach((member) => {
        const memberId = String(member?._id);
        if (!memberId || seen.has(memberId)) return;

        seen.add(memberId);
        result.push({
          value: memberId,
          label: member.name,
        });
      });
    });

    return result;
  };

  useEffect(() => {
    setFilteredTasks(taskslists[selectedWorkflow]?.tasks);
  }, [selectedWorkflow]);

  const showTabs = () => {
    if (activeTab === "Recordings") {
      return <>{showDate()}</>;
    } else {
      return <></>;
    }
  };

  const FilterButton = ({ position }) => {
    return (
      <>
        <div className="filter-box">
          <Button
            variant="primary"
            onClick={() => {
              if (isActive === true) {
                handleRecordedActivity();
              } else {
                setIsPickerOpen(false);
                handleFilteredLiveActivityList();
              }
            }}
            className="date-filter-btn me-1"
          >
            Apply
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsPickerOpen(false)}
            className="date-filter-btn ms-1"
          >
            Cancel
          </Button>
        </div>
      </>
    );
  };

  const FiltersDate = ({
    position,
    setFilteredDate,
    setSelectedFilter,
    setIsPickerOpen,
  }) => {
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
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      2,
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the last month
    lastMonthEnd.setHours(23, 59, 59, 999); // Ensure full-day inclusion for the last day

    return (
      <Dropdown className="select--dropdown">
        <Dropdown.Toggle variant="success">
          {filterDisplayLabels[selectedFilter]}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <div className="drop--scroll">
            <Dropdown.Item
              className={selectedFilter === "today" ? "selected--option" : ""}
              key={"date-today"}
              onClick={(e) => {
                setSelectedFilter("today");
                handleDateFilter(e, today);
              }}
            >
              Today
            </Dropdown.Item>
            <Dropdown.Item
              className={
                selectedFilter === "yesterday" ? "selected--option" : ""
              }
              key={"date-yesterday"}
              onClick={(e) => {
                setSelectedFilter("yesterday");
                handleDateFilter(e, yesterday);
              }}
            >
              Yesterday
            </Dropdown.Item>
            <Dropdown.Item
              className={selectedFilter === "7days" ? "selected--option" : ""}
              key={"date-7days"}
              onClick={(e) => {
                setSelectedFilter("7days");
                handleDateFilter(e, last7Days, today);
              }}
            >
              Last 7 days
            </Dropdown.Item>
            <Dropdown.Item
              className={
                selectedFilter === "last-week" ? "selected--option" : ""
              }
              key={"date-last-week"}
              onClick={(e) => {
                setSelectedFilter("last-week");
                handleDateFilter(e, lastWeekStart, lastWeekEnd);
              }}
            >
              Last week
            </Dropdown.Item>
            <Dropdown.Item
              className={
                selectedFilter === "last2-weeks" ? "selected--option" : ""
              }
              key={"date-last2-weeks"}
              onClick={(e) => {
                setSelectedFilter("last2-weeks");
                handleDateFilter(e, last2WeeksStart, lastWeekEnd);
              }}
            >
              Last 2 weeks
            </Dropdown.Item>
            <Dropdown.Item
              className={
                selectedFilter === "this-month" ? "selected--option" : ""
              }
              key={"date-this-month"}
              onClick={(e) => {
                setSelectedFilter("this-month");
                handleDateFilter(e, thisMonthStart, thisMonthEnd);
              }}
            >
              This month
            </Dropdown.Item>
            <Dropdown.Item
              className={
                selectedFilter === "last-month" ? "selected--option" : ""
              }
              key={"date-last-month"}
              onClick={(e) => {
                setSelectedFilter("last-month");
                handleDateFilter(e, lastMonthStart, lastMonthEnd);
              }}
            >
              Last month
            </Dropdown.Item>
            <Dropdown.Item
              className={selectedFilter === "custom" ? "selected--option" : ""}
              key={"date-custom"}
              onClick={(e) => {
                setSelectedFilter("custom");
                setTimeout(() => {
                  setFilteredDate([]);
                }, 700);
              }}
            >
              Custom
            </Dropdown.Item>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const showDate = () => {
    // if (activeInnerTab === 'InnerRecorded') {
    return (
      <>
        <ListGroup.Item className="no--style me-0 px-0">
          <Form className="d-flex align-items-center">
            <Form.Group className="mb-0 form-group pb-0">
              <FiltersDate
                position="left"
                setFilteredDate={setFilteredDate}
                setSelectedFilter={setSelectedFilter}
                setIsPickerOpen={setIsPickerOpen}
              />
            </Form.Group>
            {selectedFilter === "custom" && (
              <>
                <Form.Group className="mb-0 form-group ms-2">
                  <DatePicker
                    key={"date-filter"}
                    ref={datePickerRef}
                    name="date"
                    weekStartDayIndex={1}
                    id="datepicker-filter"
                    value={filtereddate}
                    format="YYYY-MM-DD"
                    range
                    multiple={false}
                    numberOfMonths={2}
                    dateSeparator=" - "
                    onChange={async (value) => {
                      const formatDate = (date) => {
                        const d = new Date(date);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
                        const day = String(d.getDate()).padStart(2, "0");
                        return `${year}-${month}-${day}`;
                      };

                      if (Array.isArray(value)) {
                        const formatted = value.map(formatDate);
                        setFilteredDate(formatted);
                      } else {
                        const formatted = formatDate(value);
                        setFilteredDate(formatted);
                      }
                    }}
                    className="form-control"
                    placeholder="dd/mm/yyyy"
                    open={isPickerOpen} // Control visibility with state
                    onOpen={() => setIsPickerOpen(true)} // Update state when opened
                    onClose={() => setIsPickerOpen(false)} // Update state when closed
                    plugins={[<FilterButton position="bottom" />]}
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </ListGroup.Item>
      </>
    );
  };

  const showTimezoneDrop = () => {
    if (activeInnerTab === "InnerRecorded") {
      return (
        <ListGroup.Item className="no--style timezone--drop d-none d-xl-flex timezone--dropdown">
          <Form.Select
            className="custom-group-selectbox"
            onChange={(event) => setMemberTimezone(event.target.value)}
            value={filters?.["timezone"] || "company"}
          >
            <optgroup label="Organization time zone">
              <option value={"company"}>
                {timezonesData[crntDashboard?.timezone]
                  ?.match(/\(UTC[^\)]+\)/)?.[0]
                  ?.replace(/[()]/g, "") || "UTC+05:30"}
              </option>
            </optgroup>
            <optgroup label="Member's time zone">
              <option value={"member"}>
                {timezonesData[currentActivity?.usermeta?.timezone]
                  ?.match(/\(UTC[^\)]+\)/)?.[0]
                  ?.replace(/[()]/g, "") || "UTC+05:30"}
              </option>
            </optgroup>
            <optgroup label="My time zone">
              <option value={"user"}>
                {timezonesData[crntUser?.timezone]
                  ?.match(/\(UTC[^\)]+\)/)?.[0]
                  ?.replace(/[()]/g, "") || "UTC+05:30"}
              </option>
            </optgroup>
          </Form.Select>
        </ListGroup.Item>
      );
    } else {
      return <></>;
    }
  };

  const showTimezoneModal = () => {
    if (activeInnerTab === "InnerRecorded") {
      return (
        <ListGroup.Item className="no--style timezone--drop d-block d-xl-none">
          <Form.Select
            className="custom-group-selectbox"
            onChange={(event) => setMemberTimezone(event.target.value)}
            value={filters?.["timezone"] || "company"}
          >
            <optgroup label="Organization time zone">
              <option value={"company"}>
                {timezonesData[crntDashboard?.timezone]
                  ?.match(/\(UTC[^\)]+\)/)?.[0]
                  ?.replace(/[()]/g, "") || "UTC+05:30"}
              </option>
            </optgroup>
            <optgroup label="Member's time zone">
              <option value={"member"}>
                {timezonesData[currentActivity?.usermeta?.timezone]
                  ?.match(/\(UTC[^\)]+\)/)?.[0]
                  ?.replace(/[()]/g, "") || "UTC+05:30"}
              </option>
            </optgroup>
            <optgroup label="My time zone">
              <option value={"user"}>
                {timezonesData[crntUser?.timezone]
                  ?.match(/\(UTC[^\)]+\)/)?.[0]
                  ?.replace(/[()]/g, "") || "UTC+05:30"}
              </option>
            </optgroup>
          </Form.Select>
        </ListGroup.Item>
      );
    } else {
      return <></>;
    }
  };

  const showRecordedTabs = () => {
    if (activeInnerTab === "InnerRecorded") {
      return (
        <ListGroup horizontal className="screens--shots">
          <ListGroup horizontal>
            <Button
              variant="secondary"
              className="btn--view"
              key={"activity-tab-key"}
              active={screenshotTab === "Activity"}
              onClick={() => setScreenshotTab("Activity")}
            >
              <TbScreenshot className="me-1" /> Activities
            </Button>
            <Button
              variant="secondary"
              className="btn--view"
              key={"screenshots1-tab-key"}
              active={screenshotTab === "Screenshots"}
              onClick={() => setScreenshotTab("Screenshots")}
            >
              <TbScreenshot className="me-1" /> Screenshots
            </Button>
            {activeSubscription &&
            [
              "price_1Sm6h8SZtJkrH95eYrwqvWQx",
              "price_1Sm6hhSZtJkrH95e3hAKkKBG",
              "price_1Sm6hhSZtJkrH95e3hAKkKBG",
              "price_1T1kNISZtJkrH95epkJdx2QN",
              "price_1T1kNUSZtJkrH95eeWlP2oMU",
              "price_1T1kNhSZtJkrH95eEKKOZ2LG",
              "plan_ReKagUnhkdX86V",
            ].includes(activeSubscription?.planId) ? (
              <Button
                variant="primary"
                className="btn--view"
                key={"videos1-tab-key"}
                active={screenshotTab === "Videos"}
                onClick={() => setScreenshotTab("Videos")}
              >
                <MdOutlineVideoLibrary className="me-1" /> Videos
              </Button>
            ) : (
              <Button
                variant="primary"
                className="btn--view"
                key={"videos1-tab-key"}
                disabled
                onClick={() => {
                  return false;
                }}
              >
                <MdOutlineVideoLibrary className="me-1" /> Videos
              </Button>
            )}
          </ListGroup>
        </ListGroup>
      );
    } else {
      return <></>;
    }
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
        carousel={{ finite: postMedia.length === 1 }}
        on={{
          click: () => fullscreenRef.current?.enter(),
        }}
        render={{
          slide: ({ slide }) => {
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
                    ></video>
                    <media-settings-menu hidden anchor="auto">
                      <media-settings-menu-item>
                        Speed
                        <media-playback-rate-menu
                          slot="submenu"
                          hidden
                          rates="1 1.25 1.5 1.75 2 2.50 3 3.50 4 4.50 5 6 7 8 9 10"
                        >
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

      <div
        className={`${
          isActive ? "show--details team--page project-collapse" : "team--page"
        } ${projectToggle === true ? "project-collapse" : ""}`}
      >
        <div className="page--title px-md-2 py-3 bg-white border-bottom">
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  <span
                    className="open--sidebar me-2"
                    onClick={() => {
                      handleSidebarSmall(false);
                      setIsActive(0);
                    }}
                  >
                    <FiSidebar />
                  </span>
                  Activity
                  <ListGroup horizontal className="activity--tabs ms-auto">
                    <ListGroup horizontal className="d-none d-xl-flex">
                      <ListGroup.Item
                        action
                        active={activeTab === "Live"}
                        onClick={() => {
                          if (currentActivity && Object.keys(currentActivity)) {
                            const cact = currentActivity;
                            leaveRoom(currentActivity?._id);
                            setCurrentActivity(cact);
                          }
                          setActiveTab("Live");
                          setActiveInnerTab("InnerLive");
                        }}
                      >
                        <FiMonitor className="me-1" /> Live
                      </ListGroup.Item>
                      <ListGroup.Item
                        action
                        active={activeTab === "Recordings"}
                        onClick={() => {
                          setActSpinner(false);
                          setSpinner(false);
                          setActiveTab("Recordings");
                          setActiveInnerTab("InnerRecorded");
                        }}
                      >
                        <FiVideo className="me-1" /> Recorded
                      </ListGroup.Item>
                    </ListGroup>

                    {memberProfile?.role?.permissions?.time_tracking
                      ?.view_others === true &&
                    memberProfile?.role?.permissions?.assigned_teams
                      ?.specific_peoples_only === true ? (
                      <ListGroup.Item
                        className={"ms-auto d-none d-xl-flex"}
                        key="member-filter-list"
                      >
                        <Form.Select
                          className="custom-selectbox"
                          onChange={(event) =>
                            handlefilterchange("member", event.target.value)
                          }
                          value={filters?.["member"] || "all"}
                        >
                          <option
                            value={memberProfile?._id}
                            key="my-info-option"
                          >
                            My Time Logs
                          </option>

                          {assignedTeamsOrMembers?.members?.length > 0 && (
                            <option key={`member-info-all`} value={"all"}>
                              All Members
                            </option>
                          )}
                          <>
                            {assignedTeamsOrMembers?.members?.map(
                              (member, index) => (
                                <option
                                  key={`member-projects-${index}`}
                                  value={member._id}
                                >
                                  {member.name}
                                </option>
                              ),
                            )}
                          </>
                        </Form.Select>
                      </ListGroup.Item>
                    ) : memberProfile?.role?.permissions?.time_tracking
                        ?.view_others === true &&
                      memberProfile?.role?.permissions?.assigned_teams
                        ?.specific_teams_only === true ? (
                      <ListGroup.Item
                        className={"ms-auto d-none d-xl-flex timezone--dropdown"}
                        key="teams-filter-list"
                      >
                        <Form.Select
                          className="custom-group-selectbox"
                          onChange={(event) => {
                            const group =
                              event.target.selectedOptions[0].dataset.group;
                            handlefilterchange(group, event.target.value);
                          }}
                          value={filters?.["member"] || "all"}
                        >
                          <>
                            {/* MEMBERS GROUP */}
                            <optgroup label="Members" optgroup>
                              <option
                                value={memberProfile?._id}
                                data-group="member"
                              >
                                My Time Logs
                              </option>
                              <option value="all" data-group="member">
                                All Members
                              </option>
                              {assignedTeamsOrMembers?.members?.map(
                                (member) => (
                                  <option
                                    key={member._id}
                                    value={member._id}
                                    data-group="member"
                                  >
                                    {member.name}
                                  </option>
                                ),
                              )}
                            </optgroup>
                            <optgroup label="Teams">
                              {assignedTeamsOrMembers?.teams?.map(
                                (team, index) => {
                                  return (
                                    <option
                                      key={`team-info-${index}`}
                                      value={team._id}
                                      data-group="team"
                                    >
                                      {team.name}
                                    </option>
                                  );
                                },
                              )}
                            </optgroup>
                          </>
                        </Form.Select>
                      </ListGroup.Item>
                    ) : (
                      <></>
                    )}

                    {showTabs()}

                    {activeTab === "Recordings" && (
                      <ListGroup.Item className="timezone--dropdown">
                        <Form.Select
                          className="custom-group-selectbox"
                          onChange={(event) => {
                            handlefilterchange("timezone", event.target.value);
                            setMemberTimezone(event.target.value);
                          }}
                          value={filters?.["timezone"] || "company"}
                        >
                          <optgroup label="Organization time zone">
                            <option value={"company"}>
                              {timezonesData[crntDashboard?.timezone]
                                ?.match(/\(UTC[^\)]+\)/)?.[0]
                                ?.replace(/[()]/g, "") || "Asia/Kolkata"}
                            </option>
                          </optgroup>
                          <optgroup label="My time zone">
                            <option value={"user"}>
                              {timezonesData[crntUser?.timezone]
                                ?.match(/\(UTC[^\)]+\)/)?.[0]
                                ?.replace(/[()]/g, "") || "Asia/Kolkata"}
                            </option>
                          </optgroup>
                          {/* <option value={'company'}>{timezonesData[crntDashboard?.timezone] || 'Asia/Kolkata'}</option>    
                              <option value={'user'}>{timezonesData[crntUser?.timezone] || 'Asia/Kolkata'}</option>    */}
                        </Form.Select>
                      </ListGroup.Item>
                    )}

                    {activeTab === "Live" && (
                      <ListGroup.Item
                        key="filter-key-6"
                        className={isActive ? "d-none" : "d-none d-xl-flex"}
                      >
                        <Form.Select
                          className="custom-selectbox"
                          onChange={(event) =>
                            handlefilterchange(
                              "tracker_status",
                              event.target.value,
                            )
                          }
                          value={filters["tracker_status"] || "all"}
                        >
                          <option value="all">View All</option>
                          <option value="active">Active</option>
                          <option value="pause">On Break</option>
                          <option value="inactive">Inactive</option>
                        </Form.Select>
                      </ListGroup.Item>
                    )}

                    <ListGroup.Item
                      key="filter-key-7"
                      className={isActive ? "d-none" : "d-none d-xl-flex"}
                    >
                      <Form className="search-filter-list">
                        <Form.Group className="mb-0 form-group">
                          <MdOutlineSearch />
                          <Form.Control
                            type="text"
                            ref={inputRef}
                            readOnly={spinner}
                            name="search"
                            placeholder="Search by name"
                            onChange={(event) =>
                              handlefilterchange("search", event.target.value)
                            }
                          />
                        </Form.Group>
                      </Form>
                    </ListGroup.Item>
                    {(memberProfile?.role?.permissions?.time_tracking
                      ?.add_manual_time === true ||
                      memberProfile?.role?.permissions?.time_tracking
                        ?.update_manual_time === true) && (
                      <Dropdown className="select--dropdown manual--dropdown">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                          <LuTimer />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {memberProfile?.role?.permissions?.time_tracking
                            ?.add_manual_time === true && (
                            <Dropdown.Item onClick={handleShow}>
                              Manual Time
                            </Dropdown.Item>
                          )}
                          {memberProfile?.role?.permissions?.time_tracking
                            ?.update_manual_time === true &&
                            memberProfile?.role?.permissions?.time_tracking
                              ?.view_others === true && (
                              <Dropdown.Item
                                onClick={handleNewShow}
                                to="/manual-time"
                              >
                                Manual Time Approval
                              </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}

                    <ListGroup horizontal className="bg-white expand--icon">
                      <ListGroup.Item
                        className="d-flex d-xl-none"
                        onClick={handleFilterShow}
                      >
                        <MdFilterList />
                      </ListGroup.Item>
                      <ListGroup.Item
                        className="d-none d-lg-flex"
                        onClick={handleToggles}
                      >
                        <GrExpand />
                      </ListGroup.Item>
                      <ListGroup.Item className="refresh--btn btn btn-primary d-none d-md-flex">
                        <BsArrowClockwise
                          onClick={() => {
                            handleLiveActivityList();
                          }}
                        />
                      </ListGroup.Item>
                    </ListGroup>
                  </ListGroup>
                </h2>
              </Col>
            </Row>
          </Container>
        </div>
        <div className="page--wrapper px-md-2 pb-4 pt-4 daily--reports activity--table">
          {spinner ? (
            <div className="loading-bar">
              <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
          ) : (
            <Container fluid>
              {activeTab === "Live" && (
                <>
                  <div className="activity--stats">
                    <Row>
                      <Col className="card--stack">
                        <Card className="text--green">
                          <Card.Body>
                            <Card.Title>
                              <span>Active</span>
                              {cardNumbers?.activeCount}
                            </Card.Title>
                            <Card.Text>
                              <FiMonitor />
                            </Card.Text>
                          </Card.Body>
                        </Card>
                        <Card className="text--orange">
                          <Card.Body>
                            <Card.Title>
                              <span>On Break</span>
                              {cardNumbers?.pauseCount}
                            </Card.Title>
                            <Card.Text>
                              <FiCoffee />
                            </Card.Text>
                          </Card.Body>
                        </Card>
                        <Card className="text--gray">
                          <Card.Body>
                            <Card.Title>
                              <span>Inactive</span>
                              {cardNumbers?.inactiveCount}
                            </Card.Title>
                            <Card.Text>
                              <FiUserX />
                            </Card.Text>
                          </Card.Body>
                        </Card>
                        <Card className="text--blue">
                          <Card.Body>
                            <Card.Title>
                              <span>Total Hours</span>
                              {convertSecondstoTime(cardNumbers?.totalHours)}
                            </Card.Title>
                            <Card.Text>
                              <FiClock />
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                  {/* <p className="d-flex d-lg-none">Total Hours <strong className="ms-auto">50 Hrs</strong></p> */}
                  <div className="attendance--table activity--table--list mb-0">
                    <div className="attendance--table--list">
                      {liveactivities.length > 0 ? (
                        <Table>
                          <thead className="onHide">
                            <tr key="project-table-header">
                              <th
                                scope="col"
                                className="sticky pe-0 py-0"
                                key="project-name-header"
                              >
                                <FiUsers className="me-1" /> Member
                              </th>
                              <th
                                scope="col"
                                key="live-client-pname-header"
                                className="onHide text-start"
                              >
                                <FiBriefcase className="me-1" /> Project Name
                              </th>
                              <th
                                scope="col"
                                key="live-client-project-header"
                                className="onHide ms-auto"
                              >
                                <LuTimer className="me-1" /> Current Session
                              </th>
                              <th
                                scope="col"
                                key="live-client-time-header"
                                className="onHide"
                              >
                                <FiClock className="me-1" /> Total Time
                              </th>
                              <th
                                scope="col"
                                key="live-client-status-header"
                                className="onHide"
                              >
                                <GoPulse className="me-1" /> Status
                              </th>
                              <th
                                scope="col"
                                key="live-client-action-header"
                                className="onHide"
                              >
                                <FiTarget className="me-1" /> Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {liveactivities.map((activity, index) => {
                              // totalhours += Number(activity?.totalTaskDuration || 0)
                              // totalProjecthours += Number(activity?.latestActivity?.duration || 0)
                              return (
                                <>
                                  <tr
                                    key={`activity-row-${index}`}
                                    className={
                                      currentActivity &&
                                      currentActivity?._id === activity._id
                                        ? "project--active"
                                        : ""
                                    }
                                  >
                                    {/* <td key={`index-${index}`}>{index + 1} </td> */}
                                    <td
                                      data-label="Member Name"
                                      className="project--title--td"
                                      onClick={() => {
                                        if (
                                          isActive &&
                                          activeInnerTab !== "InnerRecorded"
                                        ) {
                                          leaveRoom(currentActivity?._id);
                                          socket.emit(
                                            "get-tracker-status-update",
                                            { userID: activity._id },
                                          );
                                          setCurrentActivity(activity);
                                        } else if (
                                          activeInnerTab === "InnerRecorded"
                                        ) {
                                          setRecordedRefresh(true);
                                          setCurrentActivity(activity);
                                          // await dispatch(getRecoredActivity(currentActivity._id, 'recorded'))
                                        }
                                      }}
                                    >
                                      <div className="d-flex justify-content-between">
                                        <div className="project--name d-flex gap-3 align-items-center">
                                          <div className="drag--indicator">
                                            <abbr>{index + 1}</abbr>
                                          </div>
                                          <div className="title--initial">
                                            {activity?.avatar &&
                                            activity?.avatar !== null ? (
                                              <span>
                                                <img
                                                  src={activity?.avatar}
                                                  alt={"member-avatar"}
                                                />
                                              </span>
                                            ) : (
                                              activity?.name?.charAt(0)
                                            )}
                                            {activity?.latestActivity
                                              ?.status ? (
                                              <p className="anim--circle">
                                                <small className="status--circle active--color"></small>
                                              </p>
                                            ) : activity?.latestActivity
                                                ?.status === false ? (
                                              <p className="anim--circle">
                                                <small className="status--circle idle--color"></small>
                                              </p>
                                            ) : (
                                              <p className="anim--circle">
                                                <small className="status--circle inactive--color"></small>
                                              </p>
                                            )}
                                          </div>
                                          <div className="title--span flex-column d-flex align-items-start gap-0">
                                            <span>{activity.name}</span>
                                            <strong
                                              key={`project-title-${activity?._id}`}
                                              className="project--title--td"
                                            >
                                              {activity?.role?.name || (
                                                <FiClock className="text-muted" />
                                              )}
                                            </strong>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-start">
                                      <strong className="d-inline-flex text-uppercase fs-small d-xl-none mb-1">
                                        Project Name
                                      </strong>
                                      <span
                                        key={`project-title-${activity?._id}`}
                                        className="project--title--td"
                                      >
                                        {activity?.latestActivity?.project
                                          ?.title || (
                                          <FiBriefcase className="text-muted" />
                                        )}
                                      </span>
                                    </td>
                                    <td className="ms-md-auto text-start text-xl-center">
                                      <strong className="d-inline-flex text-uppercase fs-small d-xl-none mb-1">
                                        Project Time
                                      </strong>
                                      <div
                                        key={`task-time-${activity?._id}`}
                                        className="onHide project--time--badge px-2 py-1 rounded-3 d-inline-flex gap-2 align-items-center"
                                      >
                                        <LuTimer className="me-1" />{" "}
                                        {convertSecondstoTime(
                                          activity?.latestActivity?.duration ||
                                            0,
                                        ) || "00:00"}
                                      </div>
                                    </td>
                                    <td
                                      className="text-start text-xl-center"
                                      key={`total-time-${activity?._id}`}
                                    >
                                      <strong className="d-inline-flex text-uppercase fs-small d-xl-none mb-1">
                                        Total Time
                                      </strong>
                                      <span className="total--time--badge bg--blue px-2 py-1 rounded-3 d-inline-flex gap-2 align-items-center">
                                        <FiClock className="me-1" />{" "}
                                        {convertSecondstoTime(
                                          activity?.totalDuration || 0,
                                        ) || "00:00"}
                                      </span>
                                    </td>
                                    <td
                                      key={`status-title-${activity?._id}`}
                                      className="onHide"
                                    >
                                      {activity?.latestActivity?.status ? (
                                        <Badge bg="success">
                                          <FaPlay /> Active
                                        </Badge>
                                      ) : activity?.latestActivity?.status ===
                                        false ? (
                                        <Badge bg="warning">
                                          <FiCoffee /> Break
                                        </Badge>
                                      ) : (
                                        <Badge bg="secondary">
                                          <FiPause /> Inactive
                                        </Badge>
                                      )}
                                    </td>
                                    <td
                                      key={`view-act-${activity?._id}`}
                                      className="onHide text-lg-end"
                                    >
                                      <Button
                                        variant="dark"
                                        onClick={() => {
                                          setActiveInnerTab("InnerLive");
                                          handleClick(activity);
                                        }}
                                      >
                                        <FaEye /> Details
                                      </Button>
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                          </tbody>
                        </Table>
                      ) : (
                        <></>
                      )}
                      {!spinner &&
                        liveactivities &&
                        liveactivities.length === 0 && (
                          <div className="mt-2 text-center py-3">
                            <h2>No Activities Found</h2>
                          </div>
                        )}
                    </div>
                  </div>
                </>
              )}
              {activeTab === "Recordings" && (
                <>
                  {/* <p className="d-flex d-lg-none">Total Hours <strong className="ms-auto">50 Hrs</strong></p> */}
                  <div className="attendance--table activity--table--list mb-0">
                    <div className="attendance--table--list">
                      {liveactivities.length > 0 ? (
                        <Table>
                          <thead className="onHide">
                            <tr key="project-table-header-recordings">
                              <th
                                scope="col"
                                className="sticky pe-0 py-0"
                                key="record-project-name-header"
                              >
                                <FiUsers className="me-1" /> Member
                              </th>
                              {/* <th scope="col" key="client-time-header" className="onHide text-start"><FiBriefcase className="me-1" /> Project Name</th> */}
                              <th
                                scope="col"
                                key="record-client-time-header"
                                className="onHide ms-auto"
                              >
                                <FiClock className="me-1" /> Total Time
                              </th>
                              <th
                                scope="col"
                                key="record-client-action-header"
                                className="onHide"
                              >
                                <FiTarget className="me-1" /> Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {liveactivities.map((activity, index) => {
                              totalhours += Number(
                                activity?.totalTaskDuration || 0,
                              );

                              return (
                                <>
                                  <tr
                                    key={`recording-activity-row-${index}`}
                                    className={
                                      currentActivity &&
                                      currentActivity?._id === activity._id
                                        ? "active"
                                        : ""
                                    }
                                  >
                                    {/* <td key={`index-${index}`}>{index + 1} </td> */}
                                    <td
                                      data-label="Member Name"
                                      className="project--title--td"
                                      onClick={() => {
                                        // if (isActive) {
                                        //   setCurrentActivity(activity);
                                        // }
                                        if (
                                          (isActive &&
                                            activeInnerTab !==
                                              "InnerRecorded") ||
                                          (isActive &&
                                            activeTab !== "Recordings")
                                        ) {
                                          leaveRoom(currentActivity?._id);
                                          socket.emit(
                                            "get-tracker-status-update",
                                            { userID: activity._id },
                                          );
                                          setCurrentActivity(activity);
                                        } else if (
                                          activeInnerTab === "InnerRecorded" ||
                                          activeTab === "Recordings"
                                        ) {
                                          setRecordedRefresh(true);
                                          setCurrentActivity(activity);
                                        }
                                      }}
                                    >
                                      <div className="d-flex justify-content-between">
                                        <div className="project--name d-flex gap-3 align-items-center">
                                          <div className="drag--indicator">
                                            <abbr>{index + 1}</abbr>
                                          </div>
                                          <div className="title--initial">
                                            {activity?.avatar &&
                                            activity?.avatar !== null ? (
                                              <span>
                                                <img
                                                  src={activity?.avatar}
                                                  alt={"member-avatar"}
                                                />
                                              </span>
                                            ) : (
                                              activity?.name?.charAt(0)
                                            )}
                                            {activity?.latestActivity
                                              ?.status ? (
                                              <p className="anim--circle">
                                                <small className="status--circle active--color"></small>
                                              </p>
                                            ) : activity?.latestActivity
                                                ?.status === false ? (
                                              <p className="anim--circle">
                                                <small className="status--circle idle--color"></small>
                                              </p>
                                            ) : (
                                              <p className="anim--circle">
                                                <small className="status--circle inactive--color"></small>
                                              </p>
                                            )}
                                          </div>
                                          <div className="title--span flex-column d-flex align-items-start gap-0">
                                            <span>{activity.name}</span>
                                            <strong
                                              key={`project-title-${activity?._id}`}
                                              className="project--title--td"
                                            >
                                              {activity?.role?.name || ""}
                                            </strong>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    {/* <td className="text-start">
                                      <strong className="d-inline-flex text-uppercase fs-small d-xl-none mb-1">Project Name</strong>
                                      
                                    </td> */}
                                    <td
                                      className="text-start text-xl-center ms-md-auto"
                                      key={`total-time-${activity?._id}`}
                                    >
                                      <strong className="d-inline-flex text-uppercase fs-small d-xl-none mb-1">
                                        Total Time
                                      </strong>
                                      <span className="total--time--badge bg--blue px-2 py-1 rounded-3 d-inline-flex gap-2 align-items-center">
                                        <FiClock className="me-1" />{" "}
                                        {convertSecondstoTime(
                                          activity?.totalDuration || 0,
                                        ) || "00:00"}
                                      </span>
                                    </td>
                                    <td className="onHide text-lg-end">
                                      <Button
                                        variant="dark"
                                        onClick={() => {
                                          handleClick(activity);
                                        }}
                                      >
                                        <FaEye /> Details
                                      </Button>
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                          </tbody>
                        </Table>
                      ) : (
                        !spinner &&
                        liveactivities.length === 0 && (
                          <div className="text-center">
                            <h2>No Results</h2>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </Container>
          )}
        </div>
      </div>
      {isActive === true && (
        <div className="details--wrapper common--project--grid">
          <div className="wrapper--title py-2 bg-white border-bottom">
            <span
              className="open--sidebar"
              onClick={() => {
                handleSidebarSmall(false);
                setIsActive(0);
              }}
            >
              <FiSidebar />
            </span>
            <div className="projecttitle">
              <Dropdown>
                {liveactivities && liveactivities.length === 1 ? (
                  <>
                    <button
                      type="button"
                      id="dropdown-basic-single"
                      className="dropdown-toggle btn btn-link"
                    >
                      <div className="title--initial">
                        {currentActivity?.name?.charAt(0)}
                        {currentActivity?.latestActivity?.status ? (
                          <p className="anim--circle">
                            <small className="status--circle active--color"></small>
                          </p>
                        ) : currentActivity?.latestActivity?.status ===
                          false ? (
                          <p className="anim--circle">
                            <small className="status--circle idle--color"></small>
                          </p>
                        ) : (
                          <p className="anim--circle">
                            <small className="status--circle inactive--color"></small>
                          </p>
                        )}
                      </div>
                      <div className="title--span flex-column align-items-start gap-0">
                        <h3>
                          <strong>{currentActivity?.name}</strong>
                          <span>{currentActivity?.role?.name || ""}</span>
                        </h3>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Dropdown.Toggle variant="link" id="dropdown-basic">
                      <div className="title--initial">
                        {currentActivity?.avatar &&
                        currentActivity?.avatar !== null ? (
                          <span>
                            <img
                              src={currentActivity?.avatar}
                              alt={"member-avatar"}
                            />
                          </span>
                        ) : (
                          currentActivity?.name?.charAt(0)
                        )}
                        {currentActivity?.latestActivity?.status ? (
                          <p className="anim--circle">
                            <small className="status--circle active--color"></small>
                          </p>
                        ) : currentActivity?.latestActivity?.status ===
                          false ? (
                          <p className="anim--circle">
                            <small className="status--circle idle--color"></small>
                          </p>
                        ) : (
                          <p className="anim--circle">
                            <small className="status--circle inactive--color"></small>
                          </p>
                        )}
                      </div>
                      <div className="title--span flex-column align-items-start gap-0">
                        <h3>
                          <strong>{currentActivity?.name}</strong>
                          <span>{currentActivity?.role?.name || ""}</span>
                        </h3>
                      </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <div className="drop--scroll">
                        {liveactivities.length > 0 &&
                          liveactivities.map((activity, index) => {
                            return (
                              <Dropdown.Item
                                onClick={() => {
                                  handleClick(activity);
                                }}
                                className={
                                  currentActivity?._id === activity?._id
                                    ? "active-project"
                                    : ""
                                }
                              >
                                <div className="title--initial">
                                  {activity?.avatar &&
                                  activity?.avatar !== null ? (
                                    <span>
                                      <img
                                        src={activity?.avatar}
                                        alt={"member-avatar"}
                                      />
                                    </span>
                                  ) : (
                                    activity?.name?.charAt(0)
                                  )}
                                  {activity?.latestActivity?.status ? (
                                    <p className="anim--circle">
                                      <small className="status--circle active--color"></small>
                                    </p>
                                  ) : activity?.latestActivity?.status ===
                                    false ? (
                                    <p className="anim--circle">
                                      <small className="status--circle idle--color"></small>
                                    </p>
                                  ) : (
                                    <p className="anim--circle">
                                      <small className="status--circle inactive--color"></small>
                                    </p>
                                  )}
                                </div>
                                <div className="title--span flex-column align-items-start gap-0">
                                  <strong>{activity?.name}</strong>
                                  <span>{activity?.role?.name || ""}</span>
                                </div>
                              </Dropdown.Item>
                            );
                          })}
                      </div>
                    </Dropdown.Menu>
                  </>
                )}
              </Dropdown>
            </div>
            <ListGroup
              horizontal
              className="live--tabs ms-auto d-none d-xxl-flex"
            >
              <ListGroup horizontal>
                <Button
                  variant="secondary"
                  className="btn--view"
                  key={"live-key"}
                  active={activeInnerTab === "InnerLive"}
                  onClick={() => {
                    setActiveInnerTab("InnerLive");
                    if (currentActivity && Object.keys(currentActivity)) {
                      const cact = currentActivity;
                      leaveRoom(currentActivity?._id);
                      setTimeout(() => {
                        startsharing(
                          currentActivity?._id,
                          currentActivity?.latestActivity?.status,
                        );
                      }, 700);
                    }
                  }}
                >
                  <FiMonitor className="me-1" /> Live
                </Button>
                <Button
                  variant="primary"
                  className="btn--view"
                  key={"recored-key"}
                  active={activeInnerTab === "InnerRecorded"}
                  onClick={() => {
                    setActiveInnerTab("InnerRecorded");
                    if (currentActivity && Object.keys(currentActivity)) {
                      leaveRoom(currentActivity?._id);
                    }
                  }}
                >
                  <FiVideo className="me-1" /> Recorded
                </Button>
              </ListGroup>

              {activeInnerTab === "InnerRecorded" && showDate()}
            </ListGroup>
            <ListGroup horizontal className="p-0 ms-auto ms-xxl-0">
              {showTimezoneDrop()}
              {((currentActivity && activeInnerTab === "InnerRecorded") ||
                (currentActivity && activeInnerTab === "InnerLive")) && (
                <ListGroup
                  horizontal
                  className="bg-white expand--icon p-0 b-0 rounded-0 align-items-center"
                >
                  <ListGroup.Item
                    onClick={() => {
                      dispatch(getRecordingTypes(currentActivity?._id));
                      setShowRecordSettings(true);
                    }}
                  >
                    <FiSettings />
                  </ListGroup.Item>
                </ListGroup>
              )}
              <ListGroup
                horizontal
                className="bg-white expand--icon p-0 b-0 rounded-0 align-items-center"
              >
                <ListGroup.Item
                  className="d-flex d-xxl-none"
                  onClick={handleInnerFilterShow}
                >
                  <MdFilterList />
                </ListGroup.Item>
                <ListGroup.Item
                  onClick={handleToggles}
                  className="d-none d-lg-flex"
                >
                  <GrExpand />
                </ListGroup.Item>
                <ListGroup.Item className="list-group-item refresh--btn list-group-item-action d-none d-md-flex">
                  <BsArrowClockwise
                    onClick={() => {
                      handleRecordedActivity();
                    }}
                  />
                </ListGroup.Item>
                <ListGroup.Item
                  className="btn btn-primary"
                  key={"closekey"}
                  onClick={() => {
                    socket.emit("leaveRoom", socket.id, currentActivity?._id);
                    setCurrentActivity(false);
                    setIsActive(false);
                    dispatch(toggleSidebarSmall(false));
                    if (activeInnerTab === "InnerLive") {
                      setActiveTab("Live");
                    } else {
                      setActiveTab("Recordings");
                    }
                  }}
                >
                  <MdOutlineClose />
                </ListGroup.Item>
              </ListGroup>
            </ListGroup>
          </div>
          <div
            className={
              isScreenActive
                ? "rounded--box activity--box fullscreen--box"
                : "rounded--box activity--box"
            }
          >
            {activityspinner && (
              <div className="loading-bar">
                <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
            )}
            {activeInnerTab === "InnerLive" && (
              <>
                <div
                  className="current--player p-3"
                  key={`activity-${currentActivity?._id}`}
                >
                  <div className="timer--task">
                    {currentActivity?.latestActivity?._id && (
                      <h5
                        key={`project-task-title-for-${currentActivity?.latestActivity?._id}`}
                      >
                        {currentActivity?.latestActivity?.project?.title || (
                          <BsDash />
                        )}{" "}
                        {currentActivity?.latestActivity?.project?.client?.name
                          ? `[${currentActivity.latestActivity.project.client.name}]`
                          : ""}
                        -{" "}
                        <small>
                          {currentActivity?.latestActivity?.task?.title || (
                            <BsDash />
                          )}
                        </small>
                      </h5>
                    )}

                    {/* <span className="ms-md-3">
                      {currentActivity?.latestActivity?.app_version}
                    </span> */}
                    <p className="task--timer">
                      <span>
                        <strong>
                          {convertSecondstoTime(
                            currentActivity?.totalDuration,
                          ) || "00:00"}
                        </strong>
                      </span>
                    </p>
                    <div
                      className={
                        isScreenActive
                          ? "expand--button exit--fullscreen"
                          : "expand--button"
                      }
                    >
                      <Button
                        variant="secondary"
                        className="enter--screen"
                        onClick={toggleFullscreen}
                      >
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
                      <Button variant="secondary" onClick={handleToggler}>
                        <BsArrowsFullscreen className="open--fullscreen" />
                        <MdClose className="close--fullscreen" />
                      </Button>
                    </div>
                  </div>

                  {currentActivity?.latestActivity?.status === false ? (
                    <p className="text-center">The member is on break.</p>
                  ) : streamError !== "" ? (
                    <p className="text-center">{streamError}</p>
                  ) : liveStreaming[currentActivity?._id] &&
                    liveStreaming[currentActivity?._id] === "disabled" ? (
                    <p className="text-center">Live streaming is disabled.</p>
                  ) : currentActivity?.latestActivity?.status ? (
                    <video
                      ref={videoRef}
                      id="remoteVideo"
                      width="100%"
                      className="video"
                      onLoadedData={() => {
                        setActSpinner(false);
                        setStreamError("");
                      }}
                      preload="auto"
                      autoPlay
                      muted
                      onError={() =>
                        setStreamError("Live stream failed to load")
                      }
                    >
                      Live video is not available right now.
                    </video>
                  ) : currentActivity?.latestActivity?.status === false ? (
                    <p className="text-center">The member is on break.</p>
                  ) : (
                    <p className="text-center">
                      The member is not currently active.
                    </p>
                  )}
                </div>
              </>
            )}
            {activeInnerTab === "InnerRecorded" && (
              <>
                {showRecordedTabs()}
                <Accordion>
                  {recordedactivities && recordedactivities.length > 0
                    ? recordedactivities.map((recording, index) => {
                        return (
                          <>
                            <Accordion.Item
                              eventKey={`screenshot-${recording?._id}-${index}`}
                            >
                              <div className="screens--tabs">
                                <Accordion.Header>
                                  <h4 className="d-flex align-items-center gap-3 justify-content-between">
                                    <strong>
                                      <span>
                                        <LuFileText />
                                      </span>
                                      {recording?.project?.title}
                                    </strong>

                                    <strong className="activity-type-text d-flex align-items-center gap-2">
                                      <HiOutlineLightningBolt />{" "}
                                      {recording?.type}
                                      {recording?.type === "manual" &&
                                      recording.is_approved === true ? (
                                        <>
                                          <FaCheck /> Approved
                                        </>
                                      ) : recording?.type === "manual" &&
                                        recording.is_approved === false ? (
                                        <>
                                          <FaCheck /> Pending
                                        </>
                                      ) : (
                                        <></>
                                      )}
                                    </strong>
                                  </h4>
                                  <p>
                                    <small className="d-flex align-items-center gap-2">
                                      <FiUser />{" "}
                                      {recording?.project?.client?.name}
                                    </small>
                                  </p>
                                  <ListGroup horizontal>
                                    <ListGroup.Item>
                                      <FiCalendar className="me-2" />{" "}
                                      {new Date(
                                        recording?.createdAt,
                                      ).toLocaleDateString("en-GB", options)}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                      <FiClock className="me-2" />{" "}
                                      {generateTimeRange(
                                        recording?.createdAt,
                                        recording?.duration || 0,
                                      )}
                                    </ListGroup.Item>
                                    {recording?.type === "tracker" && (
                                      <ListGroup.Item>
                                        <FaHistory className="me-2" /> Version:{" "}
                                        {recording?.app_version}
                                      </ListGroup.Item>
                                    )}
                                  </ListGroup>
                                </Accordion.Header>
                              </div>
                              <Accordion.Body>
                                <div className="shots--list">
                                  <div className="text-end">
                                    {selectedScreenshots &&
                                      Object.keys(selectedScreenshots).length >
                                        0 &&
                                      Object.values(selectedScreenshots).some(
                                        (arr) => arr.length > 0,
                                      ) && (
                                        <Button
                                          variant="secondary"
                                          className="btn--view mb-3"
                                          key={"delete-group"}
                                          active={true}
                                          onClick={() => deleteRecordedData()}
                                        >
                                          Delete Selected
                                        </Button>
                                      )}
                                  </div>
                                  <CardGroup>
                                    {recording?.activityMeta &&
                                    recording.activityMeta.length > 0 ? (
                                      recording.activityMeta.map((meta, i) => {
                                        // Handle screenshots tab
                                        if (
                                          screenshotTab === "Screenshots" &&
                                          meta.meta_key === "screenshots" &&
                                          meta.meta_value.length > 0
                                        ) {
                                          return meta.meta_value.map(
                                            (screenshotData, j) => (
                                              <Card
                                                key={`screenshot-card-${i}-${j}`}
                                              >
                                                <Card.Body>
                                                  {screenshotData?.is_deleted !==
                                                    true &&
                                                    memberProfile?.role
                                                      ?.permissions
                                                      ?.time_tracking
                                                      ?.delete_recordings ===
                                                      true &&
                                                    memberProfile?._id ===
                                                      recording?.member && (
                                                      <div className="card--checkbox">
                                                        <Form.Check
                                                          type="checkbox"
                                                          checked={
                                                            selectedScreenshots[
                                                              recording?._id
                                                            ]?.includes(j) ||
                                                            false
                                                          }
                                                          key={`screenshot-id-${recording?._id}`}
                                                          onChange={() =>
                                                            handleSelectRecording(
                                                              recording?._id,
                                                              j,
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                    )}
                                                  <img
                                                    className="card-img-top"
                                                    src={screenshotData?.url}
                                                    alt="screenshot"
                                                    onClick={() =>
                                                      handleLightBox(
                                                        "screenshot",
                                                        meta.meta_value,
                                                        j,
                                                      )
                                                    }
                                                  />
                                                  <p>
                                                    <strong>Task Name:</strong>{" "}
                                                    {
                                                      screenshotData?.task_data
                                                        ?.title
                                                    }{" "}
                                                  </p>
                                                  <p>
                                                    <strong>Time:</strong>{" "}
                                                    {showAmPmtime(
                                                      screenshotData?.taken_time,
                                                    )}
                                                  </p>
                                                  <p>
                                                    <strong>Date: </strong>
                                                    {screenshotData?.taken_time
                                                      ? new Date(
                                                          screenshotData.taken_time,
                                                        ).toLocaleDateString(
                                                          "en-GB",
                                                          {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                          },
                                                        )
                                                      : ""}
                                                  </p>
                                                </Card.Body>
                                              </Card>
                                            ),
                                          );
                                        }

                                        // Handle videos tab
                                        if (
                                          screenshotTab === "Videos" &&
                                          meta.meta_key === "videos" &&
                                          meta.meta_value.length > 0
                                        ) {
                                          return (
                                            <>
                                              {meta.meta_value
                                                .slice(
                                                  ((currentVideoPage[
                                                    recording?._id
                                                  ] || 1) -
                                                    1) *
                                                    videosPerPage,
                                                  (currentVideoPage[
                                                    recording?._id
                                                  ] || 1) * videosPerPage,
                                                )
                                                .map((videoData, j) =>
                                                  videoData?.is_deleted ===
                                                  true ? (
                                                    <Card
                                                      key={`blank-card-${
                                                        recording?._id
                                                      }-${
                                                        currentVideoPage[
                                                          recording?._id
                                                        ] || 1
                                                      }-${j}`}
                                                    >
                                                      <Card.Body>
                                                        <img
                                                          className="card-img-top"
                                                          src={videoData.url}
                                                          alt="screenshot"
                                                        />
                                                        <p>
                                                          <strong>
                                                            Task Name:
                                                          </strong>{" "}
                                                          {
                                                            videoData?.task_data
                                                              ?.title
                                                          }{" "}
                                                        </p>
                                                        <p>
                                                          <strong>Time:</strong>{" "}
                                                          {
                                                            videoData?.start_time
                                                          }{" "}
                                                          to{" "}
                                                          {videoData?.end_time}
                                                        </p>
                                                        <p>
                                                          <strong>Date:</strong>
                                                          {videoData?.createdAt
                                                            ? new Date(
                                                                videoData.createdAt,
                                                              ).toLocaleDateString(
                                                                "en-GB",
                                                                {
                                                                  day: "numeric",
                                                                  month: "long",
                                                                  year: "numeric",
                                                                },
                                                              )
                                                            : ""}
                                                        </p>
                                                      </Card.Body>
                                                    </Card>
                                                  ) : videoData?.url ===
                                                    "video_disabled" ? (
                                                    <Card
                                                      key={`blank-card-${
                                                        recording?._id
                                                      }-${
                                                        currentVideoPage[
                                                          recording?._id
                                                        ] || 1
                                                      }-${j}`}
                                                    >
                                                      <Card.Body>
                                                        <img
                                                          className="card-img-top"
                                                          src="https://app.primeteams.ai/images/5H2J6.jpg"
                                                          alt="screenshot"
                                                        />
                                                        <p>
                                                          <strong>
                                                            Task Name:
                                                          </strong>{" "}
                                                          {
                                                            videoData?.task_data
                                                              ?.title
                                                          }{" "}
                                                        </p>
                                                        <p>
                                                          <strong>Time:</strong>{" "}
                                                          {
                                                            videoData?.start_time
                                                          }{" "}
                                                          to{" "}
                                                          {videoData?.end_time}
                                                        </p>
                                                        <p>
                                                          <strong>Date:</strong>
                                                          {videoData?.createdAt
                                                            ? new Date(
                                                                videoData.createdAt,
                                                              ).toLocaleDateString(
                                                                "en-GB",
                                                                {
                                                                  day: "numeric",
                                                                  month: "long",
                                                                  year: "numeric",
                                                                },
                                                              )
                                                            : ""}
                                                        </p>
                                                      </Card.Body>
                                                    </Card>
                                                  ) : (
                                                    <Card
                                                      key={`video-card-${
                                                        recording?._id
                                                      }-${
                                                        currentVideoPage[
                                                          recording?._id
                                                        ] || 1
                                                      }-${j}`}
                                                    >
                                                      <Card.Body>
                                                        {videoData?.is_deleted !==
                                                          true &&
                                                          memberProfile?.role
                                                            ?.permissions
                                                            ?.time_tracking
                                                            ?.delete_recordings ===
                                                            true &&
                                                          memberProfile?._id ===
                                                            recording?.member && (
                                                            <div className="card--checkbox">
                                                              <Form.Check
                                                                type="checkbox"
                                                                checked={
                                                                  selectedScreenshots[
                                                                    recording
                                                                      ?._id
                                                                  ]?.includes(
                                                                    j,
                                                                  ) || false
                                                                }
                                                                onChange={() =>
                                                                  handleSelectRecording(
                                                                    recording?._id,
                                                                    j,
                                                                  )
                                                                }
                                                              />
                                                            </div>
                                                          )}
                                                        <video
                                                          onClick={() =>
                                                            handleLightBox(
                                                              "video",
                                                              meta.meta_value,
                                                              j,
                                                            )
                                                          }
                                                          height="175px"
                                                          preload="metadata"
                                                          muted
                                                          onLoadedMetadata={(
                                                            e,
                                                          ) =>
                                                            (e.target.currentTime = 0.1)
                                                          }
                                                          controls={false}
                                                        >
                                                          <source
                                                            src={videoData?.url}
                                                            type="video/webm"
                                                          />
                                                          Your browser does not
                                                          support the video tag.
                                                        </video>
                                                        <p>
                                                          <strong>
                                                            Task Name:
                                                          </strong>{" "}
                                                          {
                                                            videoData?.task_data
                                                              ?.title
                                                          }{" "}
                                                        </p>
                                                        <p>
                                                          <strong>Time:</strong>{" "}
                                                          {
                                                            videoData?.start_time
                                                          }{" "}
                                                          to{" "}
                                                          {videoData?.end_time}
                                                        </p>
                                                        <p>
                                                          <strong>Date:</strong>{" "}
                                                          {videoData?.createdAt
                                                            ? new Date(
                                                                videoData?.createdAt,
                                                              )
                                                                .toISOString()
                                                                .split("T")[0]
                                                            : ""}
                                                        </p>
                                                      </Card.Body>
                                                    </Card>
                                                  ),
                                                )
                                              }

                                              {/* Pagination Controls */}
                                              <div
                                                className="pagination-control"
                                                style={{
                                                  textAlign: "center",
                                                }}
                                              >
                                                <Button
                                                  variant="link"
                                                  disabled={
                                                    (currentVideoPage[
                                                      recording?._id
                                                    ] || 1) === 1
                                                  }
                                                  onClick={() =>
                                                    setCurrentVideoPage(
                                                      (prev) => ({
                                                        ...prev,
                                                        [recording?._id]:
                                                          (prev[
                                                            recording?._id
                                                          ] || 1) - 1,
                                                      }),
                                                    )
                                                  }
                                                >
                                                  <LuChevronsLeft />
                                                </Button>

                                                <span
                                                  style={{ margin: "0 10px" }}
                                                >
                                                  Page{" "}
                                                  {currentVideoPage[
                                                    recording?._id
                                                  ] || 1}{" "}
                                                  of{" "}
                                                  {Math.ceil(
                                                    meta.meta_value.length /
                                                      videosPerPage,
                                                  )}
                                                </span>

                                                <Button
                                                  variant="link"
                                                  disabled={
                                                    (currentVideoPage[
                                                      recording?._id
                                                    ] || 1) >=
                                                    Math.ceil(
                                                      meta.meta_value.length /
                                                        videosPerPage,
                                                    )
                                                  }
                                                  onClick={() =>
                                                    setCurrentVideoPage(
                                                      (prev) => ({
                                                        ...prev,
                                                        [recording?._id]:
                                                          (prev[
                                                            recording?._id
                                                          ] || 1) + 1,
                                                      }),
                                                    )
                                                  }
                                                >
                                                  <LuChevronsRight />
                                                </Button>
                                              </div>
                                            </>
                                          );
                                        }
                                        if (
                                          screenshotTab === "Activity" &&
                                          meta.meta_key === "events_data" &&
                                          meta.meta_value.length > 0
                                        ) {
                                          return (
                                            <>
                                              <div className="row">
                                                <div className="col-md-12">
                                                  <ListGroup>
                                                    <ListGroup.Item className="pb-5 p-0">
                                                      <ActivityOverviewChart
                                                        eventsData={
                                                          meta.meta_value
                                                        }
                                                      />
                                                    </ListGroup.Item>
                                                  </ListGroup>
                                                  <ListGroup className="mt-2">
                                                    <ListGroup.Item className="b-0 p-0 rounded-0 shadow-none text-uppercase fw-semibold fs-6">
                                                      Per-Minute Log
                                                    </ListGroup.Item>
                                                    {/* Header */}
                                                    <ListGroup.Item className="bg-light fw-semibold d-none d-lg-flex py-2">
                                                      <Row className="align-items-center w-100">
                                                        <Col md={2}>TIME</Col>

                                                        <Col md={5}>
                                                          <div className="d-flex align-items-center gap-2">
                                                            <LuMouse />
                                                            MOUSE CLICKS
                                                          </div>
                                                        </Col>

                                                        <Col md={5}>
                                                          <div className="d-flex align-items-center gap-2">
                                                            <FaRegKeyboard />
                                                            KEYSTROKES
                                                          </div>
                                                        </Col>
                                                      </Row>
                                                    </ListGroup.Item>

                                                    <PaginatedList
                                                      data={
                                                        meta.meta_value[0]
                                                          ?.events_count || []
                                                      }
                                                      rowsPerPage={10}
                                                      renderItem={(
                                                        log,
                                                        index,
                                                      ) => (
                                                        <ListGroup.Item
                                                          className="py-2"
                                                          key={index}
                                                        >
                                                          <Row className="align-items-center w-100 gap-2 gap-md-0">
                                                            {/* Time */}
                                                            <Col md={2}>
                                                              <span className="log--span text-uppercase text-muted d-flex d-lg-none">Time</span>
                                                              <span
                                                                style={{
                                                                  fontWeight: 600,
                                                                }}
                                                              >
                                                                {log?.time
                                                                  ? new Date(
                                                                      log.time,
                                                                    ).toLocaleTimeString(
                                                                      "en-GB",
                                                                      {
                                                                        hour: "2-digit",
                                                                        minute:
                                                                          "2-digit",
                                                                        hour12: false,
                                                                      },
                                                                    )
                                                                  : ""}
                                                              </span>
                                                            </Col>

                                                            {/* Mouse */}
                                                            <Col md={5}>
                                                              <div className="d-flex align-items-center gap-3">
                                                                <span className="log--span text-uppercase text-muted d-flex d-lg-none">Mouse Clicks</span>
                                                                <ProgressBar
                                                                  now={
                                                                    log.mouse_click_count /
                                                                    maxMouse
                                                                  }
                                                                  style={{
                                                                    height:"5px",
                                                                    width:"100%",
                                                                    maxWidth: "190px",
                                                                    borderRadius:"20px",
                                                                  }}
                                                                  variant="info"
                                                                />

                                                                <span
                                                                  style={{
                                                                    minWidth:"22px",
                                                                    fontWeight: 600,
                                                                    fontSize:"14px",
                                                                  }}
                                                                >
                                                                  {
                                                                    log.mouse_click_count
                                                                  }
                                                                </span>
                                                              </div>
                                                            </Col>

                                                            {/* Keyboard */}
                                                            <Col md={5}>
                                                              <div className="d-flex align-items-center gap-3">
                                                                <span className="log--span text-uppercase text-muted d-flex d-lg-none">Keystrokes</span>
                                                                <ProgressBar
                                                                  now={
                                                                    log.keyboard_count /
                                                                    maxKeyboard
                                                                  }
                                                                  style={{
                                                                    height:"5px",
                                                                    width:"100%",
                                                                    maxWidth: "190px",
                                                                    borderRadius:"20px",
                                                                  }}
                                                                  variant="success"
                                                                />

                                                                <span
                                                                  style={{
                                                                    minWidth:"22px",
                                                                    fontWeight: 600,
                                                                    fontSize:"14px",
                                                                  }}
                                                                >
                                                                  {
                                                                    log.keyboard_count
                                                                  }
                                                                </span>
                                                              </div>
                                                            </Col>
                                                          </Row>
                                                        </ListGroup.Item>
                                                      )}
                                                    />
                                                  </ListGroup>
                                                </div>
                                              </div>
                                            </>
                                          );
                                        }
                                        return null; // Return null if no condition is met
                                      })
                                    ) : (
                                      <div>No data available</div> // Display if no data is available
                                    )}
                                  </CardGroup>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          </>
                        );
                      })
                    : activityspinner === false && (
                        <p className="text-center mt-5">
                          No activity available.
                        </p>
                      )}
                </Accordion>
              </>
            )}
          </div>
        </div>
      )}

      {showEvents === true && (
        <Modal
          show={showEvents}
          onHide={() => {
            setShowEvents(false);
            setEventsData(false);
          }}
          centered
          size="xl"
          className=""
        >
          <Modal.Header closeButton>
            <Modal.Title>Activity Events</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item className="pb-5">
                    <ActivityOverviewChart eventsData={eventsData} />
                  </ListGroup.Item>
                </ListGroup>
                <ListGroup className="mt-2">
                  <ListGroup.Item>Per-Minute Log</ListGroup.Item>
                  {/* Header */}
                  <ListGroup.Item className="bg-light fw-semibold d-none d-lg-flex">
                    <Row className="d-none d-lg-flex align-items-center">
                      <Col md={2}>TIME</Col>

                      <Col md={4}>
                        <div className="d-flex align-items-center gap-2">
                          <LuMouse />
                          MOUSE CLICKS
                        </div>
                      </Col>

                      <Col md={4}>
                        <div className="d-flex align-items-center gap-2">
                          <FaRegKeyboard />
                          KEYSTROKES
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {/* Rows */}
                  {eventsData[0]?.events_count?.map((log, index) => (
                    <ListGroup.Item>
                      <Row className="d-flex align-items-center gap-3 gap-md-0">
                        {/* Time */}
                        <Col md={2}>
                        <span className="log--span text-uppercase text-muted d-flex d-lg-none">Time</span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "14px",
                            }}
                          >
                            {log?.time
                              ? new Date(log.time).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : ""}
                          </span>
                        </Col>

                        <Col md={4}>
                          <span className="log--span text-uppercase text-muted d-flex d-lg-none">Mouse clicks</span>
                          <div className="d-flex align-items-center gap-3">
                            <ProgressBar
                              now={log.mouse_click_count / maxMouse}
                              style={{
                                height: "5px",
                                width: "100%",
                                maxWidth: "190px",
                                borderRadius: "20px",
                              }}
                              variant="info"
                            />

                            <span
                              style={{
                                minWidth: "30px",
                                fontWeight: 600,
                                fontSize: "14px",
                              }}
                            >
                              {log.mouse_click_count}
                            </span>
                          </div>
                        </Col>

                        {/* Keyboard */}
                        <Col md={4}>
                          <span className="log--span text-uppercase text-muted d-flex d-lg-none">Keystrokes</span>
                          <div className="d-flex align-items-center gap-3">
                            <ProgressBar
                              now={log.keyboard_count / maxKeyboard}
                              style={{
                                height: "5px",
                                width: "100%",
                                maxWidth: "190px",
                                borderRadius: "20px",
                              }}
                              variant="success"
                            />

                            <span
                              style={{
                                minWidth: "30px",
                                fontWeight: 600,
                                fontSize: "14px",
                              }}
                            >
                              {log.keyboard_count}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Modal.Body>
        </Modal>
      )}
      {/*--=-=Filter Modal**/}
      <Modal
        show={showFilter}
        onHide={handleFilterClose}
        centered
        size="md"
        className="filter--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item>
              <Dropdown className="select--dropdown manual--dropdown">
                <Dropdown.Toggle variant="success">{activeTab}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    <Dropdown.Item
                      action
                      active={activeTab === "Live"}
                      onClick={() => {
                        if (currentActivity && Object.keys(currentActivity)) {
                          const cact = currentActivity;
                          leaveRoom(currentActivity?._id);
                          setCurrentActivity(cact);
                        }
                        setActiveTab("Live");
                      }}
                    >
                      <FiMonitor className="me-1" /> Live
                    </Dropdown.Item>
                    <Dropdown.Item
                      action
                      active={activeTab === "Recordings"}
                      onClick={() => {
                        setActiveTab("Recordings");
                      }}
                    >
                      <FiVideo className="me-1" /> Recorded
                    </Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>

            {showTabs()}
            {activeTab === "Live" && (
              <ListGroup.Item key="filter-key-6">
                <Form.Select
                  className="custom-selectbox"
                  onChange={(event) =>
                    handlefilterchange("tracker_status", event.target.value)
                  }
                  value={filters["tracker_status"] || "all"}
                >
                  <option value="all">View All</option>
                  <option value="active">Active</option>
                  <option value="pause">On Break</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </ListGroup.Item>
            )}

            <ListGroup.Item key="filter-key-7">
              <Form className="search-filter-list">
                <Form.Group className="mb-0 form-group">
                  <MdOutlineSearch />
                  <Form.Control
                    type="text"
                    name="search"
                    ref={inputRef}
                    readOnly={spinner}
                    placeholder="Search by name"
                    onChange={(event) =>
                      handlefilterchange("search", event.target.value)
                    }
                  />
                </Form.Group>
              </Form>
            </ListGroup.Item>
            {showTimezoneModal()}
          </ListGroup>
        </Modal.Body>
      </Modal>
      {/*--=-=Inner Filter Modal**/}
      <Modal
        show={showInnerFilter}
        onHide={handleInnerFilterClose}
        centered
        size="md"
        className="filter--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item>
              <Dropdown className="select--dropdown manual--dropdown">
                <Dropdown.Toggle variant="success">
                  {activeInnerTab === "InnerLive" ? "Live" : "Recorded"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    <Dropdown.Item
                      variant="secondary"
                      className="btn--view"
                      key={"live-key"}
                      active={activeInnerTab === "InnerLive"}
                      onClick={() => {
                        setActiveInnerTab("InnerLive");
                        if (currentActivity && Object.keys(currentActivity)) {
                          const cact = currentActivity;
                          leaveRoom(currentActivity?._id);
                          startsharing(
                            currentActivity?._id,
                            currentActivity?.latestActivity?.status,
                          );
                        }
                      }}
                    >
                      <FiMonitor className="me-1" /> Live
                    </Dropdown.Item>
                    <Dropdown.Item
                      variant="primary"
                      className="btn--view"
                      key={"recored-key"}
                      active={activeInnerTab === "InnerRecorded"}
                      onClick={() => {
                        setActiveInnerTab("InnerRecorded");
                        if (currentActivity && Object.keys(currentActivity)) {
                          leaveRoom(currentActivity?._id);
                        }
                      }}
                    >
                      <FiVideo className="me-1" /> Recorded
                    </Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>

            {activeInnerTab === "InnerRecorded" && showDate()}
            {showTimezoneModal()}
            {/* <ListGroup.Item>
              <Dropdown className="select--dropdown manual--dropdown">
                <Dropdown.Toggle variant="success">
                  {screenshotTab}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    <Dropdown.Item
                      variant="secondary"
                      className="btn--view"
                      key={"screenshots1-tab-key"}
                      active={screenshotTab === "Screenshots"}
                      onClick={() => setScreenshotTab("Screenshots")}
                    >
                      <TbScreenshot className="me-1" /> Screenshots
                    </Dropdown.Item>
                    <Dropdown.Item
                      variant="primary"
                      className="btn--view"
                      key={"videos1-tab-key"}
                      active={screenshotTab === "Videos"}
                      onClick={() => setScreenshotTab("Videos")}
                    >
                      <MdOutlineVideoLibrary className="me-1" /> Videos
                    </Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item> */}
          </ListGroup>
        </Modal.Body>
      </Modal>
      {/*--=-=Search Modal**/}
      <Modal
        show={showSearch}
        onHide={handleSearchClose}
        size="md"
        className="search--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item className="border-0 p-0" key="filter-key-5">
              <Form>
                <Form.Group className="mb-0 form-group">
                  <Form.Control
                    type="text"
                    name="search"
                    placeholder="Search by name"
                  />
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
      <Modal
        show={showNew}
        onHide={handleCloseNew}
        centered
        size="lg"
        className="AddEntryModal AddTimeModal theme--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="nav--item--icon">
              <FiCheckCircle />
            </span>
            <strong>
              Manual Time Approval{" "}
              <small>Review and approve manual time entries</small>
            </strong>
          </Modal.Title>
          <span className="pending--badge">Pending ({manualListCount})</span>
        </Modal.Header>
        <Modal.Body>
          <ManualTime />
        </Modal.Body>
      </Modal>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="md"
        className="AddTimeModal theme--modal"
        onShow={() => {
          selectboxObserver();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="nav--item--icon">
              <LuTimer />
            </span>
            <strong>
              Add Manual Time{" "}
              <small>Add time entries manually for completed work.</small>
            </strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="new--entry">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4>Added Entries ({entries?.length || 0})</h4>
              <span className="bg-success px-2 py-1 rounded-3">
                Total: {convertSecondstoTime(totalTaskDuration)}
              </span>
            </div>
            {entries?.length > 0 &&
              entries.map((entry, i) => {
                const baseDate = new Date(entry.date);
                const startTime = timeStringToDate(entry.start_time, baseDate);
                const endTime = timeStringToDate(entry.end_time, baseDate);
                const taskDurationInMilliseconds = endTime - startTime;
                const taskDuration = Math.round(
                  taskDurationInMilliseconds / 1000,
                );
                return (
                  <Card className="p-3 shadow-sm rounded-4 mb-2">
                    <Card.Title className="d-flex align-items-center justify-content-between gap-3">
                      {entry?.project_title}{" "}
                      <FiTrash2
                        className="text-danger"
                        onClick={() => handleRemoveEntry(i)}
                      />
                    </Card.Title>
                    <Card.Body className="p-0 pt-1">
                      <Card.Text className="mb-0">
                        {entry?.task_title}
                      </Card.Text>
                      <Card.Text className="text-muted mb-0">
                        {entry?.date} <br />
                        {entry?.start_time} - {entry?.end_time}
                      </Card.Text>
                      <Card.Text className="text-success mb-0">
                        <strong>{convertSecondstoTime(taskDuration)}</strong>
                      </Card.Text>

                      {errors[i]?.start_time && (
                        <span className="error">{errors[i].start_time}</span>
                      )}
                      {errors[i]?.end_time && (
                        <span className="error">{errors[i].end_time}</span>
                      )}
                      {errors[i]?.task && (
                        <span className="error">{errors[i].task}</span>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
          </div>
          <Form className="bg-light p-3 rounded-4 my-3">
            {
              //entries.map((entry, index) => (
              <Row>
                <Col sm={12}>
                  <h6 className="d-flex align-items-center gap-2">
                    <FaPlus /> Add New Entry
                  </h6>
                </Col>
                <Col md={12} className="mb-3">
                  <DatePicker
                    key={"date-filter-report"}
                    name="date"
                    weekStartDayIndex={1}
                    id="datepicker-report"
                    value={timings?.date || ""}
                    format="YYYY-MM-DD"
                    multiple={false}
                    dateSeparator=" - "
                    onChange={async (value) => {
                      const formatDate = (date) => {
                        const d = new Date(date);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
                        const day = String(d.getDate()).padStart(2, "0");
                        return `${year}-${month}-${day}`;
                      };
                      const formatted = formatDate(value);
                      memberTodaysActivity([formatted]);
                      setTimings({
                        ...timings, // keep other fields if any
                        date: formatted,
                        start_time: "", // reset start_time
                        end_time: "", // reset end_time
                      });

                      // handleTimeChange("date", formatted)
                    }}
                    className="form-control"
                    placeholder="YYYY-MM-DD"
                    open={reportPickerOpen} // Control visibility with state
                    onOpen={() => setReportPickerOpen(true)} // Update state when opened
                    onClose={() => setReportPickerOpen(false)} // Update state when closed
                  />
                </Col>
                <Col md={6} className="mb-3 mb-md-0">
                  <Dropdown
                    className="select--dropdown"
                    key={`dropdown-${timings?.start_time}-${timeSlots.length}`}
                  >
                    <Dropdown.Toggle variant="success" key={"start-timing"}>
                      {timings?.start_time || "Start Time"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <div className="drop--scroll">
                        {timeSlots.map((slot, idx) => {
                          let isOccupied = isTimeSlotOccupied(
                            slot.replace(/\s?(AM|PM)$/i, ""),
                            occupiedRanges,
                          );
                          if (!isOccupied) {
                            isOccupied = entries.some((entry) => {
                              return (
                                (slot.replace(/\s?(AM|PM)$/i, "") >=
                                  entry.start_time &&
                                  slot.replace(/\s?(AM|PM)$/i, "") <=
                                    entry.end_time) || // Between
                                slot.replace(/\s?(AM|PM)$/i, "") ===
                                  entry.start_time || // Equal to start
                                slot.replace(/\s?(AM|PM)$/i, "") ===
                                  entry.end_time // Equal to end
                              );
                            });
                          }
                          return (
                            <Dropdown.Item
                              key={`slot-${slot}-${idx}`}
                              onClick={() =>
                                handleTimeChange(
                                  "start_time",
                                  slot.replace(/\s?(AM|PM)$/i, ""),
                                )
                              }
                              disabled={isOccupied}
                              style={{
                                pointerEvents: isOccupied ? "none" : "auto",
                                opacity: isOccupied ? 0.5 : 1,
                              }}
                            >
                              {slot}{" "}
                            </Dropdown.Item>
                          );
                          // }
                        })}
                        {/* {timeSlots.map((slot, idx) => {
                          const selectedDate = new Date(timings.date);
                          selectedDate.setSeconds(0, 0);

                          // Convert "02:30 PM" to 24hr
                          const [time, modifier] = slot.split(" ");
                          let [hours, minutes] = time.split(":").map(Number);

                          if (modifier === "PM" && hours !== 12) hours += 12;
                          if (modifier === "AM" && hours === 12) hours = 0;

                          const slotDate = new Date(selectedDate);
                          slotDate.setHours(hours, minutes, 0, 0);

                          let isOccupied = occupiedRanges?.some((range) => {
                            const start = new Date(range.start);
                            const end = new Date(range.end);
                            return slotDate >= start && slotDate < end;
                          });

                          if (!isOccupied) {
                            isOccupied = entries.some((entry) => {
                              const entryStart = new Date(`${timings.date}T${entry.start_time}`);
                              const entryEnd = new Date(`${timings.date}T${entry.end_time}`);
                              return slotDate >= entryStart && slotDate <= entryEnd;
                            });
                          }

                          return (
                            <Dropdown.Item
                              key={`slot-${slot}-${idx}`}
                              onClick={() => handleTimeChange("start_time", time)}
                              disabled={isOccupied}
                              style={{
                                pointerEvents: isOccupied ? "none" : "auto",
                                opacity: isOccupied ? 0.5 : 1,
                              }}
                            >
                              {slot}
                            </Dropdown.Item>
                          );
                        })} */}
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* {errors[index]?.start_time && <span className="form-error">{errors[index].start_time}</span>} */}
                </Col>
                <Col md={6}>
                  <Dropdown className="select--dropdown">
                    <Dropdown.Toggle variant="success">
                      {timings?.end_time || "End Time"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <div className="drop--scroll">
                        {/* <Form>
                                  <Form.Group className="form-group mb-3">
                                      <Form.Control type="text" placeholder="Search here.."  value={timings?.end_time} onChange={(e) => {handleSearchChange('end_time', 0, e.target.value)}} />
                                  </Form.Group>
                              </Form> */}
                        {timeSlots.map((slot, idx) => {
                          let isOccupied = isTimeSlotOccupied(
                            slot.replace(/\s?(AM|PM)$/i, ""),
                            occupiedRanges,
                          );
                          if (!isOccupied) {
                            isOccupied =
                              slot.replace(/\s?(AM|PM)$/i, "") <=
                                timings?.start_time || // Between
                              slot.replace(/\s?(AM|PM)$/i, "") ===
                                timings?.start_time;
                          }
                          return (
                            <Dropdown.Item
                              key={`end-slot-${slot}-${idx}`}
                              onClick={() =>
                                handleTimeChange(
                                  "end_time",
                                  slot.replace(/\s?(AM|PM)$/i, ""),
                                )
                              }
                              disabled={isOccupied}
                              style={{
                                pointerEvents: isOccupied ? "none" : "auto",
                                opacity: isOccupied ? 0.5 : 1,
                              }}
                            >
                              {slot}{" "}
                            </Dropdown.Item>
                          );
                          // }
                        })}
                        {/* {timeSlots.map((slot, idx) => {
                          const selectedDate = new Date(timings.date);
                          selectedDate.setSeconds(0, 0);

                          // Convert "02:30 PM" to 24hr
                          const [time, modifier] = slot.split(" ");
                          let [hours, minutes] = time.split(":").map(Number);

                          if (modifier === "PM" && hours !== 12) hours += 12;
                          if (modifier === "AM" && hours === 12) hours = 0;

                          const slotDate = new Date(selectedDate);
                          slotDate.setHours(hours, minutes, 0, 0);

                          let isOccupied = occupiedRanges?.some((range) => {
                            const start = new Date(range.start);
                            const end = new Date(range.end);
                            return slotDate >= start && slotDate < end;
                          });

                          if (!isOccupied) {
                            isOccupied = entries.some((entry) => {
                              const entryStart = new Date(`${timings.date}T${entry.start_time}`);
                              const entryEnd = new Date(`${timings.date}T${entry.end_time}`);
                              return slotDate >= entryStart && slotDate <= entryEnd;
                            });
                          }

                          return (
                            <Dropdown.Item
                              key={`slot-${slot}-${idx}`}
                              onClick={() => handleTimeChange("end_time", time)}
                              disabled={isOccupied}
                              style={{
                                pointerEvents: isOccupied ? "none" : "auto",
                                opacity: isOccupied ? 0.5 : 1,
                              }}
                            >
                              {slot}
                            </Dropdown.Item>
                          );
                        })} */}
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* {errors[index]?.end_time && <span className="form-error">{errors[index].end_time}</span>} */}
                </Col>
              </Row>
              // ))
            }
            <Row>
              <Col md={12} className="mt-3 text-end">
                <Button
                  variant="dark"
                  onClick={handleProjectShow}
                  disabled={
                    !timings?.start_time ||
                    !timings?.end_time ||
                    timings.end_time === "00:00" ||
                    !timings?.date ||
                    timings?.date === ""
                  }
                >
                  Select Project
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="dark"><FaPlus /> Add Time Entry</Button> */}
          <Button
            variant="primary"
            onClick={handleReportSubmit}
            disabled={loader || entries.length === 0}
          >
            {loader === true ? "Please wait..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showSelect}
        onHide={handleProjectClose}
        onShow={() => selectboxObserver()}
        centered
        size="lg"
        className="AddTimeModal theme--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="nav--item--icon">
              <LuTimer />
            </span>
            <strong>
              Add Manual Time{" "}
              <small>Add time entries manually for completed work.</small>
            </strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col sm={12} lg={6} className="order-0 order-lg-0">
                <Form.Group className="mb-3">
                  <Form.Label>Project Status</Form.Label>
                  <div className="drop--scroll">
                    <Form.Select
                      className="custom-selectbox"
                      name="status"
                      onChange={handleProjectFilter}
                      value={projectFilter?.status || "in-progress"}
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6} className="order-2 order-lg-1 mt-3 mt-lg-0">
                <Form.Group className="mb-3">
                  <Form.Label>Select Workflow</Form.Label>
                  <Form.Select
                    className="form-control custom-selectbox"
                    id="projects-tab"
                    value={selectedWorkflow}
                    onChange={(e) => {
                      setWorkflow(e.target.value);
                    }}
                  >
                    <option value={""}>Select Workflow Tab</option>
                    {selectedproject &&
                      Object.keys(selectedproject).length > 0 &&
                      selectedproject?.workflow?.tabs.map((tab) => (
                        <option value={tab._id}>{tab.title}</option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6} className="order-1 order-lg-2">
                <Form.Group className="mb-0 form-group pb-0">
                  <Form.Label>Select Project</Form.Label>
                  <ListGroup key={projectFilter?.status || "in-progress"}>
                    {memberprojects
                      .filter(
                        (project) =>
                          project.status ===
                          (projectFilter?.status || "in-progress"),
                      )
                      .map((project, index) => (
                        <ListGroup.Item
                          key={project._id || index} // Add `key` for React list rendering
                          className={
                            selectedproject?._id === project?._id
                              ? "selected--list--item"
                              : ""
                          }
                          onClick={() => handleProjectSelect(project)}
                        >
                          <strong>
                            {project?.title} {project?.client?.name}
                            <span>
                              <LuUsers /> {project?.client?.name}
                            </span>
                          </strong>
                          <div className="svg--check">
                            <FiCheckCircle />
                          </div>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6} className="order-3 order-lg-3">
                <Form.Group className="mb-0 form-group pb-0">
                  <Form.Label>Select Task</Form.Label>
                  <ListGroup>
                    {filteredTasks &&
                      filteredTasks.length > 0 &&
                      filteredTasks.map((task) => {
                        return (
                          <ListGroup.Item
                            key={`task-${task?._id}`}
                            className={
                              selectedTask?._id === task?._id
                                ? "selected--task--item"
                                : ""
                            }
                            onClick={() => setSelectedTask(task)}
                          >
                            <strong>{task.title}</strong>
                            <div className="svg--check">
                              <FiCheckCircle />
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                  </ListGroup>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            disabled={Object.keys(selectedTask).length === 0}
            onClick={handleEntryChange}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showRecordSettings}
        onHide={handleRecordSettingsClose}
        centered
        size="lg"
        className="AddTimeModal theme--modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="nav--item--icon">
              <LuTimer />
            </span>
            <strong>Desktop App Tracking Settings</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="mb-3 screenshot--card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3 align-items-center">
                <FiCamera />
                <h6 className="mb-1">
                  {" "}
                  Screenshots{" "}
                  <small className="d-block">
                    Capture 3 random screenshots every 10 minutes
                  </small>
                </h6>
              </div>
              <Form.Check
                type="switch"
                key={`screenshot-only`}
                checked={recordingSettings?.screenshot_recording === "enable"}
                value={"enable"}
                name={`custom_field[screenshot_recording]`}
                onChange={(event) => {
                  setRecordingSettings({
                    ...recordingSettings,
                    screenshot_recording: event.target.checked
                      ? "enable"
                      : "disabled",
                  });
                  updateRecodingType({
                    custom_field: {
                      screenshot_recording: event.target.checked
                        ? "enable"
                        : "disabled",
                    },
                  });
                }}
              />
            </Card.Body>
          </Card>

          {/* Screen Recording */}
          <Card className="mb-3 recording--card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3 align-items-center">
                <FiVideo />
                <h6 className="mb-1">
                  Screen Recording{" "}
                  <small className="d-block">
                    Continuous screen recording while time tracking is running
                  </small>
                </h6>
              </div>
              {activeSubscription && activeSubscription?.name === "Elite" ? (
                <Form.Check
                  type="switch"
                  key={`video-only`}
                  checked={recordingSettings?.video_recording === "enable"}
                  value={"enable"}
                  onChange={(event) => {
                    setRecordingSettings({
                      ...recordingSettings,
                      video_recording: event.target.checked
                        ? "enable"
                        : "disabled",
                    });
                    updateRecodingType({
                      custom_field: {
                        video_recording: event.target.checked
                          ? "enable"
                          : "disabled",
                      },
                    });
                  }}
                  name={`custom_field[video_recording]`}
                />
              ) : (
                <Form.Check
                  type="switch"
                  key={`video-only`}
                  disabled
                  checked={false}
                  value={"disabled"}
                  onChange={(event) => {
                    return false;
                  }}
                  name={`custom_field[video_recording]`}
                />
              )}
            </Card.Body>
          </Card>

          {/* Live Screen */}
          <Card className="mb-3 live--card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3 align-items-center">
                <FiMonitor />
                <h6 className="mb-1">
                  Live Screen{" "}
                  <small className="d-block">
                    Real-time screen capture and live view
                  </small>
                </h6>
              </div>
              <Form.Check
                type="switch"
                key={`live-only`}
                checked={recordingSettings?.live_streaming === "enable"}
                value={"enable"}
                onChange={(event) => {
                  setRecordingSettings({
                    ...recordingSettings,
                    live_streaming: event.target.checked
                      ? "enable"
                      : "disabled",
                  });
                  updateRecodingType({
                    custom_field: {
                      live_streaming: event.target.checked
                        ? "enable"
                        : "disabled",
                    },
                  });
                }}
                name={`custom_field[live_streaming]`}
              />
            </Card.Body>
          </Card>

          {/* Privacy Notice */}
          <div className="mt-3">
            <small>
              <strong>Access Notice:</strong> Time tracking data is only
              accessible to authorized users with roles that have{" "}
              <strong>View Team Time</strong> permission for your assigned team.
            </small>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default TimeTrackingPage;
