import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Form, Dropdown, ListGroup, Table, Modal, Button, Card, ListGroupItem } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { FiCoffee, FiClock, FiCalendar, FiDownload, FiLogIn, FiLogOut, FiEdit3, FiSidebar } from "react-icons/fi";
import { MdOutlineCheck, MdOutlineClose, MdFilterList } from 'react-icons/md';
import { GrExpand } from "react-icons/gr";
import { LuCircleDot } from "react-icons/lu";
import { BsDash } from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { AiOutlineTeam } from "react-icons/ai";
import { FaCog } from "react-icons/fa";
import { formatDateinString, selectboxObserver, groupSelectboxObserver, hexToRgba } from "../../helpers/commonfunctions";
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import { ListAttendance,getAttendanceByMember, getAttendanceSummary, getMonthlyAttendanceExcelView, ListAttendanceStatuses } from "../../redux/actions/attendance.action";
import { currentMemberProfile } from "../../helpers/auth";
import MonthHeader from "./monthheader";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AttendanceStatusManager from "../modals/attendanceStatus";
import { getAssignedTeamsOrMembersByRole } from "../../redux/actions/permission.action";
const today = new Date();

function getMonthLabel(monthYear) {
  const [mm, yyyy] = monthYear.split('/');
  const date = new Date(Number(yyyy), Number(mm) - 1); // month is 0-based
  const monthName = date.toLocaleString('default', { month: 'long' });
  return `${monthName} ${yyyy}`;
}

function AttendancePage() {
  const getCurrentMonthValue = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${mm}/${yyyy}`;
  };

  const dispatch = useDispatch()
  const memberProfile = currentMemberProfile()
  const attendanceFeed = useSelector(state => state.attendance.attendances)
  const apiPermission = useSelector((state) => state.permissions);
  const apiResult = useSelector(state => state.attendance)
  const teamsState = useSelector((state) => state.teams)
  const [memberAttendance, setMemberAttendance] = useState([])
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [statusObject, setStatusObject] = useState({})
  const [ attendances, setAttendances] = useState([])
  const memberFeed = useSelector((state) => state.member.members)
  const [members, setMembers] = useState([])
  const [teamfeed, setTeamFeed] = useState([]);
  const [selectedMember, setSelectedMember] = useState({})
  const [isActive, setIsActive] = useState(0);
  const [attendanceSummary, setAttendanceSummary] = useState({})
  const [ excelData, setExcelData] = useState([])
  const [ showAttendanceStatus, setShowAttendacneStatus] = useState( false )
  const [assignedTeamsOrMembers, setAssignedTeamsOrMembers] = useState({})
  const [ filters, setFilters] = useState({
    month: getCurrentMonthValue(),
    member: (memberProfile?.role?.permissions?.assigned_teams?.specific_peoples_only === true || memberProfile?.role?.permissions?.assigned_teams?.specific_teams_only === true) ? 'all' : memberProfile?._id
  });
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
  const [showDateFilter, setDateFilterShow] = useState(false);
  const handleDateFilterClose = () => setDateFilterShow(false);
  const handleDateFilterShow = () => setDateFilterShow(true);
  const [spinner, setSpinner] = useState(false);
  const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
  const commonState = useSelector(state => state.common)
  const [activeTab, setActiveTab] = useState('team'); 
  const yDate = new Date();
  yDate.setDate(yDate.getDate() - 1);
  const [date, setDate] = useState(yDate);
const currentYear = new Date().getFullYear();

const monthsArray = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(currentYear, i); // month index 0–11
  const month = date.toLocaleString('default', { month: 'long' }); // e.g., "June"
  const value = `${String(i + 1).padStart(2, '0')}/${currentYear}`; // mm/yyyy
  const label = `${month} ${currentYear}`; // "June 2025"
  return { label, value };
});


  const handlefilterchange = (name, value) => {
    // if (name === "search" && value === "" || name === "search" && value.length > 1 || name !== "search") {
        setFilters((prev) => {
          const updated = { ...prev };

          if (name === "member") {
            delete updated.team;   // remove team when member changes
          }

          if (name === "team") {
            delete updated.member;    // remove member when team changes
          }

          updated[name] = value;
          return updated;
        });
    // }
  }

  const handleAttendanceList = async () => {
    setSpinner(true)
    dispatch(ListAttendanceStatuses())
   await dispatch(ListAttendance(filters))
   dispatch(getMonthlyAttendanceExcelView(filters))
   setSpinner(false)
  }

  useEffect(() => {

    dispatch(getAssignedTeamsOrMembersByRole(memberProfile?.role?._id))
    handleAttendanceList()
    selectboxObserver()
    setTimeout(() => {
      groupSelectboxObserver()
    },700)
  },[])

  useEffect(() => { 
    dispatch(getAttendanceSummary({date}))
  },[date])

  useEffect(() => {
    handleAttendanceList()
  },[filters])

  useEffect(() => {
    if(apiPermission?.assignedTeamsOrMembers){
      setAssignedTeamsOrMembers(apiPermission?.assignedTeamsOrMembers)
      setTimeout(() => {
        groupSelectboxObserver()
      },700)
    }
  }, [apiPermission?.assignedTeamsOrMembers])

  useEffect(() => {
    const statusMap = attendanceStatus?.reduce((acc, status) => {
      const key = status?.label?.toLowerCase()?.replace(/\s+/g, '_');
      acc[key] = status;
      return acc;
    }, {});
    
    setStatusObject(statusMap)
  }, [attendanceStatus])

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
        setMembers(memberFeed.memberData);
    }
}, [memberFeed, dispatch]);

useEffect(() => {
  if (teamsState && teamsState.teams) {
    setTeamFeed(teamsState.teams);
  }
}, [teamsState])

useEffect(() => {
  if( apiResult.attendanceStatuses){
    setAttendanceStatus(apiResult.attendanceStatuses)
  }

  if( apiResult.memberAttendance){
    setMemberAttendance(apiResult.memberAttendance)
  }

  if( apiResult.attendanceSummary){
    setAttendanceSummary(apiResult.attendanceSummary)
  }

  if( apiResult.exceldata){
    setExcelData(apiResult.exceldata)
  }
}, [apiResult])

  useEffect(() => {
    if (attendanceFeed) {
      setAttendances(attendanceFeed);

      if(isActive === 1 && selectedMember){
        const matchedResult = attendanceFeed.find(
          (atten) => atten?._id === selectedMember?._id
        );
        
        if (matchedResult) {
          handleMemberAttendance(matchedResult);
          setIsActive(1)
        }
       
      }
    }
  }, [attendanceFeed])

  const [projectToggle, setProjectToggle ] = useState(false)
  const handleToggles = () => {
      if(commonState.sidebar_small === false ){ 
          handleSidebarSmall()
      }else{
          setProjectToggle(false)
          handleSidebarSmall()
            console.log('3')
      }
  }

  const toggleAttendanceStatus = () => {
       setShowAttendacneStatus(prev => !prev);
  }

  const changeDate = (days) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    setDate(newDate);
  };

  const lightenColor = (hex, percent = 30) => {
  // Remove '#' if present
  hex = hex?.replace(/^#/, '');

  // Parse the hex components
  const num = parseInt(hex, 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
  let b = (num & 0x0000FF) + Math.round(2.55 * percent);

  // Clamp values between 0–255
  r = Math.min(255, r);
  g = Math.min(255, g);
  b = Math.min(255, b);

  return `rgb(${r}, ${g}, ${b})`;
};


  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleMemberAttendance = async (member) => {
    
    dispatch(getAttendanceByMember(member._id, filters));
    setSelectedMember(member)
  }

  const downloadExcel = (excelData) => {
  if (!excelData || excelData.length === 0) return;

  const wsData = [];

  // Header row
  const header = ['Name', 'Role'];

  const dates = [];
  const startDate = new Date(filters?.month?.split("/")[1], filters?.month?.split("/")[0] - 1, 1); // month is 1-based
  const endDate = new Date(filters?.month?.split("/")[1], filters?.month?.split("/")[0], 0); // last day of month

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  // Add day numbers or short day labels
  dates.forEach(date => {
    const d = new Date(date);
    const label = `${d.toLocaleString('default', { weekday: 'short' })} ${d.getDate()}`;
    header.push(label);
  });

  // Append count headers
  header.push('Present', 'Absent', 'Short Leave', 'Half Day', 'No Record');

  wsData.push(header);

  // Rows
  excelData.forEach(member => {
    const row = [member.name, member.role];
    const attData = member.attendanceData || [];

    attData.forEach(att => {
      if (att.count !== undefined) {
        // Skip count cells — they are added after all dates
        return;
      } else {
        row.push(att?.status || <BsDash />);
      }
    });

    // Now add the last 5 count objects
    const summaryCounts = attData.slice(-5);
    summaryCounts.forEach(countObj => {
      row.push(countObj.count ?? 0);
    });

    wsData.push(row);
  });

  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  // Create and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileBlob, `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};

  const MemberDropdown = ({ list = [], selected, onSelect }) => {
  if (list?.length === 1) {
    return (
      <button
        type="button"
        id="dropdown-basic-single"
        className="dropdown-toggle btn btn-link"
      >
        <div className="title--span flex-column align-items-start gap-0">
          <h3>
            <strong>{list?.[0]?.name}</strong>
            <span>{list?.[0]?.role || ""}</span>
          </h3>
        </div>
      </button>
    );
  }

  return (
    <Dropdown>
      <Dropdown.Toggle variant="link" id="dropdown-basic">
        <h3>
          <strong>{selected?.name}</strong>
          <span>{selected?.role || ""}</span>
        </h3>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <div className="drop--scroll">
          {list?.map((member) => (
            <Dropdown.Item
              key={member._id}
              onClick={() => onSelect(member)}
            >
              <div className="title--initial">
                {member?.name?.charAt(0)}
              </div>
              <div className="title--span flex-column align-items-start gap-0">
                <strong>{member.name}</strong>
                <span>{member?.role}</span>
              </div>
            </Dropdown.Item>
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

  return (
    <>
      <div className={ `${isActive === 1 ? 'show--details team--page project-collapse holidays--page' : isActive === 2 ? 'view--project team--page project-collapse holidays--page' :  'team--page holidays--page'} ${projectToggle === true ? 'project-collapse' : ''}`}>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  <span className="open--sidebar me-2" onClick={() => { handleSidebarSmall(false); setIsActive(0); }}><FiSidebar /></span>
                  Attendance
                  <ListGroup horizontal className="ms-auto">
                    <ListGroup.Item className="d-none d-md-flex">
                      <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="link" id="dropdown-basic"><FiCalendar /> {getMonthLabel(filters?.month)}</Dropdown.Toggle>
                        <Dropdown.Menu>
                          <div className="drop--scroll">
                            {monthsArray.map((month) => {
                              const isFuture =
                                parseInt(month.value.split('/')[1]) > today.getFullYear() ||
                                (parseInt(month.value.split('/')[1]) === today.getFullYear() &&
                                  parseInt(month.value.split('/')[0]) > today.getMonth() + 1);
                              return (
                                <Dropdown.Item
                                  key={month.value}
                                  className={`dropdown-item ${filters.month === month.value ? 'selected--option' : ''}`}
                                  as="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (!isFuture) {
                                      setFilters((prev) => ({ ...prev, month: month.value }));
                                    }
                                  }}
                                  disabled={isFuture}
                                  style={{ pointerEvents: isFuture ? 'none' : 'auto', opacity: isFuture ? 0.5 : 1 }}
                                >
                                  {month.label}
                                  {filters.month === month.value && <MdOutlineCheck />}
                                </Dropdown.Item>
                              )
                            })}
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    </ListGroup.Item>
                    {                 
                        ( memberProfile?.role?.permissions?.attendance?.view_others === true && memberProfile?.role?.permissions?.assigned_teams?.specific_peoples_only ===  true) ? 
                          (
                            <ListGroup.Item
                              className={
                                "ms-auto d-none d-xl-flex"
                              }
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
                                  My Attendance
                                </option>
                                
                                {(assignedTeamsOrMembers?.members?.length > 0 ) && (
                                  <option key={`member-info-all`} value={"all"}>
                                    All Members
                                  </option>
                                )}
                                <>   
                                  {  assignedTeamsOrMembers?.members?.map((member, index) => (
                                        <option
                                          key={`member-projects-${index}`}
                                          value={member._id}
                                        >
                                          {member.name}
                                        </option>
                                      ))
    
                                  }
                                </>
                                
                              </Form.Select>
                            </ListGroup.Item>
                            )
                            :
                            (memberProfile?.role?.permissions?.attendance?.view_others === true && memberProfile?.role?.permissions?.assigned_teams?.specific_teams_only ===
                                  true) ?
                            <ListGroup.Item 
                            className={
                              "ms-auto d-none d-xl-flex"
                            }
                            key="teams-filter-list">
                          <Form.Select
                              className="custom-group-selectbox"
                              onChange={(event) => {
                                const group = event.target.selectedOptions[0].dataset.group;
                                handlefilterchange(group, event.target.value);
                              }}
                              value={filters?.["member"] || "all"}
                            >
                                <>
                                  {/* MEMBERS GROUP */}
                                  <optgroup label="Members">
                                    <option value={memberProfile?._id} data-group="member">
                                      My Attendance
                                    </option>
                                    <option value="all" data-group="member">
                                      All Members
                                    </option>
                                    {assignedTeamsOrMembers?.members?.map((member) => (
                                          <option
                                            key={member._id}
                                            value={member._id}
                                            data-group="member"
                                          >
                                            {member.name}
                                          </option>
                                        ))}
                                        
                                  </optgroup>
                                  <optgroup label="Teams">
    
                                    {assignedTeamsOrMembers?.teams?.map((team, index) => {
                                        return (
                                          <option
                                            key={`team-info-${index}`}
                                            value={team._id}
                                            data-group="team"
                                          >
                                            {team.name}
                                          </option>
                                        )
                                    })}
                                  </optgroup>
                                </>
                              
                            </Form.Select>
                          </ListGroup.Item>
                          :<></>
                          
                    }
                    
                    <ListGroup horizontal className="d-none d-md-flex">
                      <ListGroup.Item action onClick={() => setActiveTab('team')} className={`${activeTab === 'team'? 'd-md-flex view--icon active': 'd-md-flex view--icon'}`}><AiOutlineTeam /> Team View</ListGroup.Item>
                      <ListGroup.Item action onClick={() => setActiveTab('excel')} className={`${activeTab === 'excel'? 'd-md-flex view--icon active': 'd-md-flex view--icon'}`}><FiCalendar /> Excel View</ListGroup.Item>
                    </ListGroup>
                    <ListGroup horizontal className={'bg-white expand--icon d-flex'}>
                      <ListGroup.Item className='d-flex d-md-none' onClick={handleFilterShow}><MdFilterList /></ListGroup.Item>
                      {
                        (memberProfile?.role?.permissions?.attendance
                            ?.create_edit === true ||
                          memberProfile?.role?.slug === "owner") && (
                             <ListGroup.Item className="d-lg-flex" key={`settingskey`} onClick={toggleAttendanceStatus }><FaCog /></ListGroup.Item>
                          )
                      }
                     
                    </ListGroup>
                    <ListGroup horizontal className='bg-white expand--icon d-none d-lg-flex'>
                      <ListGroup.Item onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                    </ListGroup>
                  </ListGroup>
                </h2>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper px-md-2 pb-4 pt-4'>
          {
            spinner ?
            <div className="loading-bar">
                <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
          :
          <Container fluid>
            {activeTab === 'excel' && (
              <div className="attendance--table excel--view" id="excel--view">
                <div className="d-sm-flex align-items-center gap-3 justify-content-between mb-4">
                  <h3 className="mb-0 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Attendance Matrix - {getMonthLabel(filters?.month)}</h3>
                  <Button variant="primary" className="mt-3 mt-sm-0" onClick={() => downloadExcel(excelData)}><FiDownload /> Download Excel Sheet</Button>
                </div>
                <div className='attendance--excel--table new--project--rows table-responsive-xl'>
                    <Table>
                        <thead>
                            <tr key="project-table-header">
                                <th scope="col" className="sticky p-0" key="project-name-header">
                                  <div className="d-flex p-3 border-end border-bottom border-top">
                                    <div className="project--name py-2">
                                        Team Member
                                    </div>
                                  </div>
                                </th>
                                <MonthHeader month={filters?.month?.split("/")[0]} year={filters?.month?.split("/")[1]} />
                                {
                                  attendanceStatus?.map((status, idx) => {
                                    const rgbaBorder = hexToRgba(status?.color, 0.4);
                                    const rgbaBg = hexToRgba(status?.color, 0.1);
                                    return (
                                      <th key={idx} className="text-center p-0" style={{color: status.color,backgroundColor: rgbaBg}}>
                                        <div className="padd--x" style={{ borderRight: `1px solid ${rgbaBorder}`, borderBottom: `1px solid ${rgbaBorder}`}}>
                                          <strong>{status.label}</strong>
                                        </div>
                                      </th>
                                    );
                                  })
                                }
                            </tr>
                        </thead>
                        <tbody>
                          {
                            (excelData && excelData.length > 0) && 
                              excelData.map((data, i) => {
                                return (
                                  <tr>
                                    <td className="project--title--td sticky border-bottom">
                                      <div className="d-flex justify-content-between">
                                        <div className="project--name d-flex justify-content-start gap-3 align-items-center border-end">
                                            <div className="title--initial">{
                                               (data?.avatar && data?.avatar !== null ) ? 
                                                <span><img src={data?.avatar} alt={'member-avatar'} /></span>
                                              :
                                                data?.name?.substring(0, 1)
                                            }</div>
                                            <div className="title--span flex-column d-flex align-items-start gap-0">
                                                <span>{data?.name}</span>
                                                <strong>{data?.role}</strong>
                                            </div>
                                        </div>
                                      </div>
                                    </td>
                                    {
                                        data.attendanceData && data.attendanceData.length > 0 && 
                                        data.attendanceData.map((atten, ind) => {
                                          const key = atten?.status?.toLowerCase()?.replace(/\s+/g, '_');
                                          const rgbaBorder = hexToRgba(statusObject?.[key]?.color, 0.3);
                                          const rgbaBg = hexToRgba(statusObject?.[key]?.color, 0.1);
                                          function hexToRgba(hex, alpha) {
                                            hex = (typeof hex !== 'undefined') ? hex.replace('#', ''): '';

                                            if (hex.length === 3) {
                                              hex = hex.split('').map(c => c + c).join('');
                                            }

                                            const bigint = parseInt(hex, 16);
                                            const r = (bigint >> 16) & 255;
                                            const g = (bigint >> 8) & 255;
                                            const b = bigint & 255;

                                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                                          }
                                          if (atten.count !== undefined) {
                                            return (
                                              <td className={`${atten?.bg} text-center border-bottom`} key={ind} style={{
                                                    color: statusObject?.[key]?.color,
                                                    backgroundColor: rgbaBg,
                                                    borderRight: `1px solid ${rgbaBorder}`
                                                  }}>
                                                      <strong>{atten?.count}</strong>
                                                    
                                              </td>
                                            );
                                          } else {
                                              

                                            return (
                                              <td className="text-center border-bottom border-end" key={ind}>
                                                <span
                                                  className={`att--badge${atten?.status === '--' ? ' dash--badge' : ''}`}
                                                  style={{
                                                    color: statusObject?.[key]?.color,
                                                    backgroundColor: rgbaBg,
                                                    borderColor: `1px solid ${rgbaBorder}`,
                                                  }}
                                                >
                                                  {
                                                    atten?.status && atten?.status !== '--'
                                                      ? atten?.status
                                                      : <BsDash />
                                                  }
                                                </span>

                                                {
                                                  (atten?.total_time !== '--') &&
                                                  <small className="d-block mt-1 fw-semibold">{ atten?.total_time }</small>
                                                }
                                                
                                                {/* <strong><BsDash /></strong> Replace '--' with this icon */}
                                              </td>
                                            );
                                          }
                                        })
                                      }
                                    </tr>
                                )
                              })
                          }
                        </tbody>
                    </Table>
                </div>
              </div>
            )}

            {activeTab === 'team' && isActive === 0 && (
              <>
                <div className="attendance--stats">
                  <div className="d-md-flex align-items-center gap-3 justify-content-between mb-4">
                    <h3 className="d-flex align-items-center gap-3 mb-0">
                      
                    </h3>
                    <Col md="auto" className="d-flex align-items-center change--date mt-2 mt-md-0">
                      <Button variant="light" className="me-2 shadow-sm" onClick={() => changeDate(-1)}>
                        <MdChevronLeft size={24} />
                      </Button>

                      <div className="date--change">
                        <span>{formatDate(date)}</span>
                      </div>

                      <Button variant="light" className="ms-2 shadow-sm" onClick={() => changeDate(1)}>
                        <MdChevronRight size={24} />
                      </Button>
                    </Col>
                  </div>
                  <Row>
                    <Col className="card--stack">
                      
                      {Object.entries(attendanceSummary).map(([key, count], index) => {
                        const config = { color: 'blue', icon: <FiCoffee /> };
                        const label = key?.replace(/_/g, ' ')  // e.g. short_leave => short leave
                                        .replace(/\b\w/g, char => char.toUpperCase()); // capitalize words
                        
                        return (
                          <Card key={index} style={{background: statusObject?.[key]?.color || '#3b82f6'}}>
                            <Card.Body>
                              <Card.Title>
                                <span>{label}</span> {count}
                              </Card.Title>
                              <Card.Text>{config.icon}</Card.Text>
                            </Card.Body>
                          </Card>
                        );
                      })}

                    </Col>
                  </Row>
                </div>
                <div className="attendance--table team--view" id="team--view">
                  <h3 className="mb-4 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Team Attendance Overview - {getMonthLabel(filters?.month)}</h3>
                  <div className='attendance--table--list'>
                    <Table responsive="lg">
                      <tbody className="bg-white">
                        {attendances &&
                          attendances.map((attendanceData, dateIndex) => (
                            <tr key={`attendance-row-${dateIndex}`}>
                              <td>
                                <div className="d-flex justify-content-between">
                                  <div className="project--name d-flex gap-3 align-items-center">
                                      <div className="title--initial">{
                                         (attendanceData?.avatar && attendanceData?.avatar !== null ) ? 
                                            <span><img src={attendanceData?.avatar} alt={'member-avatar'} /></span>
                                          :
                                          attendanceData?.name?.charAt(0)
                                      }</div>
                                      <div className="title--span flex-column d-flex align-items-start gap-0">
                                          <span>{attendanceData?.name}</span>
                                          <strong>{attendanceData?.role}</strong>
                                      </div>
                                  </div>
                                </div>
                              </td>
                              <td className="ms-xl-auto">
                                <div className="d-flex align-items-center gap-3 gap-xl-4 mt-3 mt-xl-0 flex-wrap">
                                  {attendanceStatus.map((status, index) => (
                                    <div className="text-center">
                                      <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center" style={{color: statusObject?.[status?.label?.toLowerCase()?.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')]?.color || '#16a34a'}}>
                                        {
                                          attendanceData?.attendance?.[status?.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')] || 0
                                        } <small>{status?.label}</small></h4>
                                    </div>
                                  ))}
                                  
                                  <Button variant="dark" className="px-3 py-2 d-flex align-items-center gap-2 justify-content-center" onClick={() => {handleMemberAttendance(attendanceData);setIsActive(1)}}><FaEye/> Details</Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </Container>
        }
        </div>
      </div>
      {isActive === 1 &&
        <div className="details--projects--grid projects--grid common--project--grid">
          <div className="wrapper--title py-2 bg-white border-bottom">
              <span className="open--sidebar" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
              <div className="projecttitle">
                <Dropdown key="member-filter">
                    <MemberDropdown
                      list={attendances}
                      selected={selectedMember}
                      onSelect={handleMemberAttendance}
                    />
                </Dropdown>
                {/* <Dropdown key={'member-filter'}>
                  {
                  (attendances?.length === 1 ) ? 
                    <>
                    <button type="button" id="dropdown-basic-single" class="dropdown-toggle btn btn-link">
                      
                      <div className="title--span flex-column align-items-start gap-0">
                        <h3>
                          <strong>{attendances?.[0]?.name}</strong>
                          <span>{attendances?.[0]?.role?.name || ""}</span>
                        </h3>
                      </div>
                    </button>
                    </>
                  :
                  <>
                  <Dropdown.Toggle variant="link" id="dropdown-basic" key={'member-filter-toggle'}>
                    <h3>
                      <strong>{selectedMember?.name}</strong>
                      <span>{ selectedMember?.role?.name || selectedMember?.role || ''}</span>
                    </h3>
                  </Dropdown.Toggle>
                  <Dropdown.Menu key={`member-drop`}>
                      <div className="drop--scroll">
                        {
                      ( attendances && attendances?.length > 0) && (
                        <>
                            {  
                                attendances.map((member, index) => {
                                  
                                  return (
                                    <Dropdown.Item key={`drop-item-${member._id}`} value={member._id} onClick={() => { handleMemberAttendance(member) }}>
                                      <div className="title--initial">{member?.name.charAt(0)}</div>
                                      <div className="title--span flex-column align-items-start gap-0">
                                        <strong>{member.name}</strong>
                                        <span>{member?.role?.name}</span>
                                      </div>
                                    </Dropdown.Item>
                                  )
                                })

                            }
                            </> 
                          )
                          
                          }
                      </div>
                  </Dropdown.Menu>
                  </>
                  }
                </Dropdown> */}
              </div>
              <ListGroup horizontal className="expand--icon ms-auto">
                <ListGroup.Item className="day--dropdown w-auto h-auto d-none d-xxl-flex">
                  <Dropdown className="select--dropdown">
                    <Dropdown.Toggle variant="link" id="dropdown-basic"><FiCalendar /> {getMonthLabel(filters?.month)}</Dropdown.Toggle>
                    <Dropdown.Menu>
                      <div className="drop--scroll">
                        {monthsArray.map((month) => {
                          const isFuture =
                            parseInt(month.value.split('/')[1]) > today.getFullYear() ||
                            (parseInt(month.value.split('/')[1]) === today.getFullYear() &&
                              parseInt(month.value.split('/')[0]) > today.getMonth() + 1);
                            return (
                          <Dropdown.Item
                            key={month.value}
                            className={`dropdown-item ${filters.month === month.value ? 'selected--option' : ''}`}
                            as="button"
                            disabled={isFuture}
                            style={{ pointerEvents: isFuture ? 'none' : 'auto', opacity: isFuture ? 0.5 : 1 }}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isFuture) {
                                setFilters((prev) => ({ ...prev, month: month.value }));
                              }
                            }}
                          >
                            {month.label}
                            {filters.month === month.value && <MdOutlineCheck />}
                          </Dropdown.Item>
                            )
                          })}
                      </div>
                    </Dropdown.Menu>

                  </Dropdown>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex d-xxl-none" onClick={handleDateFilterShow}><MdFilterList /></ListGroup.Item>
                <ListGroup.Item key={'toggle-handle'} onClick={handleToggles} className="d-none d-lg-flex"><GrExpand /></ListGroup.Item>
                <ListGroupItem className="btn btn-primary" key={`closekey`} onClick={() => {setIsActive(0);dispatch(toggleSidebarSmall( false))}}><MdOutlineClose /></ListGroupItem>
              </ListGroup>
          </div>
          <div className="bg-white attendance--table daily--attendance--table">
            <div className="d-lg-flex align-items-center gap-3 daily--attendance--top">
              <h3 className="d-flex align-items-center gap-3 mb-0"><span><AiOutlineTeam /></span><strong>Daily Attendance <small>{getMonthLabel(filters?.month)}</small></strong></h3>
            </div>
            <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr>
                      <th className="text-uppercase py-3" scope="col"><FiCalendar className="me-1" /> Date & Day</th>
                      <th className="text-uppercase py-3 text-center" scope="col"><FiLogIn className="me-1 color--green" /> Check In</th>
                      <th className="text-uppercase py-3 text-center" scope="col"><FiLogOut className="me-1 color--red" /> Check Out</th>
                      <th className="text-uppercase py-3 text-center" scope="col"><FiClock className="me-1 color--blue" /> Logged Hours</th>
                      <th className="text-uppercase py-3 text-center" scope="col"><FiEdit3 className="me-1 color--purple" /> Manual Entry</th>
                      <th className="text-uppercase py-3 text-center" scope="col"><FiClock className="me-1 color--moove" /> Total Hours</th>
                      <th className="text-uppercase py-3 text-center" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {memberAttendance &&
                      memberAttendance.map((attendanceDate, dateIndex) => (
                        attendanceDate.dailyAttendance.length === 0 ? (
                          <tr key={dateIndex}>
                            <td className="py-2"><strong>{formatDateinString(attendanceDate.date)}</strong></td>
                            <td className="py-2 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                            <td className="py-2 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                            <td className="py-2 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                            <td className="py-2 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                            <td className="py-2 text-center"><span className="att--badge badge--gray"><LuCircleDot /></span></td>
                            <td className="py-2 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                          </tr>
                        ) : (
                          attendanceDate.dailyAttendance.map((attendance, attendanceIndex) => (
                            <tr key={`${dateIndex}-${attendanceIndex}`}>
                              <td className="py-2">
                                {attendanceIndex === 0 ? formatDateinString(attendanceDate.date) : ''}
                              </td>

                              <td className="py-2 text-center">
                                <span
                                  className={`d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--green ${
                                    attendance.time_in === '--' ? 'status--empty' : ''
                                  }`}
                                  title="Check In"
                                >
                                  {attendance.time_in !== '--' ? attendance.time_in : <GoDotFill />}
                                </span>
                              </td>

                              <td className="py-2 text-center">
                                <span
                                  className={`d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--red ${
                                    attendance.time_out === '--' ? 'status--empty' : ''
                                  }`}
                                  title="Check Out"
                                >
                                  {attendance.time_out !== '--' ? attendance.time_out : <GoDotFill />}
                                </span>
                              </td>

                              <td className="py-2 text-center">
                                <span
                                  className={`d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--blue ${
                                    attendance.tracked_time === '--' ? 'status--empty' : ''
                                  }`}
                                  title="Logged Hours"
                                >
                                  {attendance.tracked_time !== '--' ? attendance.tracked_time : <GoDotFill />}
                                </span>
                              </td>

                              <td className="py-2 text-center">
                                <span
                                  className={`d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--purple ${
                                    attendance.manual_time === '--' ? 'status--empty' : ''
                                  }`}
                                  title="Manual Entry"
                                >
                                  {attendance.manual_time !== '--' ? attendance.manual_time : <FiEdit3 />}
                                </span>
                              </td>

                              <td className="py-2 text-center">
                                <span
                                  className={`d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--moove ${
                                    attendance.total_time === '--' ? 'status--empty' : ''
                                  }`}
                                  title="Total Hours"
                                >
                                  {attendance.total_time !== '--' ? attendance.total_time : <GoDotFill />}
                                </span>
                              </td><td className="py-2 text-center">
                                {(() => {
                                  const key = attendance.status
                                    .toLowerCase()
                                    .replace(/\s+/g, '_')
                                    .replace(/[^a-z0-9_]/g, '');

                                  const baseColor = statusObject?.[key]?.color || '#999999';

                                  // Convert hex to rgba
                                  

                                  const borderColor = hexToRgba(baseColor, 0.3);
                                  const backgroundColor = hexToRgba(baseColor, 0.1);

                                  const isEmptyStatus = attendance.status === '--';

                                  return (
                                    <span className="d-inline-flex mx-auto align-items-center gap-2" title={attendance.status}>
                                      <span
                                        className={`status--badge rounded-3 ${isEmptyStatus ? 'status--empty' : ''}`}
                                        style={{
                                          color: baseColor,
                                          border: `1px solid ${borderColor}`,
                                          backgroundColor: backgroundColor,
                                        }}
                                      >
                                        {attendance.status}
                                      </span>
                                    </span>
                                  );
                                })()}
                              </td>

                            </tr>
                          ))
                        )
                      ))
                    }
                  </tbody>
              </Table>
            </div>
          </div>
        </div>
      }
      {/*--=-=Filter Modal**/}
      <Modal show={showFilter} onHide={handleFilterClose} centered size="md" className="filter--modal">
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
                    <Dropdown.Item action onClick={() => setActiveTab('team')} className={`${activeTab === 'team'? 'd-md-flex view--icon active': 'd-md-flex view--icon'}`}><AiOutlineTeam className="me-1" /> Team View</Dropdown.Item>
                    <Dropdown.Item action onClick={() => setActiveTab('excel')} className={`${activeTab === 'excel'? 'd-md-flex view--icon active': 'd-md-flex view--icon'}`}><FiCalendar className="me-1" /> Excel View</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
            <ListGroup.Item>
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="link" id="dropdown-basic"><FiCalendar /> {getMonthLabel(filters?.month)}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    {monthsArray.map((month) => {
                      const isFuture =
                        parseInt(month.value.split('/')[1]) > today.getFullYear() ||
                        (parseInt(month.value.split('/')[1]) === today.getFullYear() &&
                          parseInt(month.value.split('/')[0]) > today.getMonth() + 1);
                      return (
                        <Dropdown.Item
                          key={month.value}
                          className={`dropdown-item ${filters.month === month.value ? 'selected--option' : ''}`}
                          as="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isFuture) {
                              setFilters((prev) => ({ ...prev, month: month.value }));
                            }
                          }}
                          disabled={isFuture}
                          style={{ pointerEvents: isFuture ? 'none' : 'auto', opacity: isFuture ? 0.5 : 1 }}
                        >
                          {month.label}
                          {filters.month === month.value && <MdOutlineCheck />}
                        </Dropdown.Item>
                      )
                    })}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
      <Modal show={showDateFilter} onHide={handleDateFilterClose} centered size="md" className="filter--modal">
        <Modal.Header closeButton>
            <Modal.Title>Select Month</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item className="day--dropdown w-auto h-auto p-0">
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="link" id="dropdown-basic"><FiCalendar /> {getMonthLabel(filters?.month)}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    {monthsArray.map((month) => {
                      const isFuture =
                        parseInt(month.value.split('/')[1]) > today.getFullYear() ||
                        (parseInt(month.value.split('/')[1]) === today.getFullYear() &&
                          parseInt(month.value.split('/')[0]) > today.getMonth() + 1);
                        return (
                      <Dropdown.Item
                        key={month.value}
                        className={`dropdown-item ${filters.month === month.value ? 'selected--option' : ''}`}
                        as="button"
                        disabled={isFuture}
                        style={{ pointerEvents: isFuture ? 'none' : 'auto', opacity: isFuture ? 0.5 : 1 }}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isFuture) {
                            setFilters((prev) => ({ ...prev, month: month.value }));
                          }
                        }}
                      >
                        {month.label}
                        {filters.month === month.value && <MdOutlineCheck />}
                      </Dropdown.Item>
                        )
                      })}
                  </div>
                </Dropdown.Menu>

              </Dropdown>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
      { showAttendanceStatus && 
        <AttendanceStatusManager show={showAttendanceStatus} toggle={toggleAttendanceStatus} />
      }
    </>
  );
}

export default AttendancePage;