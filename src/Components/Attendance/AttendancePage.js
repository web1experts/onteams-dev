import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Form, Dropdown, ListGroup, Table, Modal, Button, Card, ListGroupItem } from "react-bootstrap";
import { FaCheck, FaEye } from "react-icons/fa";
import { FiCheckCircle, FiCoffee, FiClock, FiCalendar, FiDownload, FiLogIn, FiLogOut, FiEdit3, FiSidebar } from "react-icons/fi";
import { MdOutlineCheck, MdOutlineClose } from 'react-icons/md';
import { GrExpand } from "react-icons/gr";
import { LuTimer, LuCircleDot } from "react-icons/lu";
import { BsDash } from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { AiOutlineCloseCircle, AiOutlineTeam } from "react-icons/ai";
import { formatDateinString, selectboxObserver, getAttendanceBadges } from "../../helpers/commonfunctions";
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import { ListAttendance,getAttendanceByMember, getAttendanceSummary, getMonthlyAttendanceExcelView } from "../../redux/actions/attendance.action";
import { Listmembers } from "../../redux/actions/members.action";
import DatePicker from "react-multi-date-picker";
import { currentMemberProfile } from "../../helpers/auth";
import MonthHeader from "./monthheader";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


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

  const bgColors = {
    'Present': 'bg--green',
    'Absent': 'bg--red',
    'Short Leave': 'bg--purple',
    'Half Day': 'bg--blue'
  }

  function getBadgeColor(status){
    return (bgColors[status]) ? bgColors[status] : 'bg--orange'
  }

  const dispatch = useDispatch()
  const memberProfile = currentMemberProfile()
  const attendanceFeed = useSelector(state => state.attendance.attendances)
  const apiResult = useSelector(state => state.attendance)
  const [memberAttendance, setMemberAttendance] = useState([])
  const [ attendances, setAttendances] = useState([])
  const memberFeed = useSelector((state) => state.member.members)
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState({})
  const [isActive, setIsActive] = useState(0);
  const [attendanceSummary, setAttendanceSummary] = useState({})
  const [ excelData, setExcelData] = useState([])
  const [ filters, setFilters] = useState({month: getCurrentMonthValue()});
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
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
        setFilters({ ...filters, [name]: value })
    // }
  }

  const handleAttendanceList = async () => {
    setSpinner(true)
   await dispatch(ListAttendance(filters))
   dispatch(getMonthlyAttendanceExcelView(filters))
   setSpinner(false)
  }

  useEffect(() => {
    // selectboxObserver()
    dispatch(Listmembers(0, '', false));
    handleAttendanceList()
    selectboxObserver()
  },[])

  useEffect(() => { 
    dispatch(getAttendanceSummary({date}))
  },[date])

  useEffect(() => {
    handleAttendanceList()
  },[filters])

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
        setMembers(memberFeed.memberData);
    }
}, [memberFeed, dispatch]);

useEffect(() => {
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
      setAttendances(attendanceFeed)
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

  

  const changeDate = (days) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    setDate(newDate);
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

  return (
    <>
      <div className={ `${isActive === 1 ? 'show--details team--page project-collapse holidays--page' : isActive === 2 ? 'view--project team--page project-collapse holidays--page' :  'team--page holidays--page'} ${projectToggle === true ? 'project-collapse' : ''}`}>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => { handleSidebarSmall(false); setIsActive(0); }}><FiSidebar /></span>
                  Attendance
                  <ListGroup horizontal className="ms-auto">
                    <ListGroup.Item>
                      <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="link" id="dropdown-basic"><FiCalendar /> {getMonthLabel(filters?.month)}</Dropdown.Toggle>
                        <Dropdown.Menu>
                          <div className="drop--scroll">
                            {monthsArray.map((month) => (
                              <Dropdown.Item
                                key={month.value}
                                className={`dropdown-item ${filters.month === month.value ? 'selected--option' : ''}`}
                                as="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFilters((prev) => ({ ...prev, month: month.value }));
                                }}
                              >
                                {month.label}
                                {filters.month === month.value && <MdOutlineCheck />}
                              </Dropdown.Item>
                            ))}
                          </div>
                        </Dropdown.Menu>

                    </Dropdown>
                    </ListGroup.Item>
                    <ListGroup horizontal className="d-none d-md-flex">
                        <ListGroup.Item action onClick={() => setActiveTab('team')} className={`${activeTab === 'team'? 'd-md-flex d-none view--icon active': 'd-md-flex d-none view--icon'}`}><AiOutlineTeam /> Team View</ListGroup.Item>
                        <ListGroup.Item action onClick={() => setActiveTab('excel')} className={`${activeTab === 'excel'? 'd-md-flex d-none view--icon active': 'd-md-flex d-none view--icon'}`}><FiCalendar /> Excel View</ListGroup.Item>
                    </ListGroup>
                    <ListGroup horizontal className='bg-white expand--icon d-none d-lg-flex'>
                      <ListGroup.Item onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                    </ListGroup>
                  </ListGroup>
                </h2>
                <ListGroup horizontal className="d-md-none d-flex">
                    <ListGroup.Item action onClick={() => setActiveTab('team')} className={`${activeTab === 'team'? 'd-lg-none d-flex view--icon active mt-3 mt-lg-0': 'mt-3 mt-lg-0 d-lg-none d-flex view--icon'}`}><AiOutlineTeam /> Team View</ListGroup.Item>
                    <ListGroup.Item action onClick={() => setActiveTab('excel')} className={`${activeTab === 'excel'? 'd-lg-none d-flex mt-3 mt-lg-0 view--icon active': 'd-lg-none d-flex mt-3 mt-lg-0 view--icon'}`}><FiCalendar /> Excel View</ListGroup.Item>
                </ListGroup>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper px-md-2 py-3'>
          {
            spinner &&
            <div className="loading-bar">
                <img src="images/OnTeam-icon.png" className="flipchar" />
            </div>
          }
          <Container fluid className="pb-5 pt-2">
            {activeTab === 'excel' && (
              <div className="attendance--table excel--view" id="excel--view">
                <div className="d-md-flex align-items-center gap-3 justify-content-between mb-4">
                  <h3 className="mb-0 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Attendance Matrix - {getMonthLabel(filters?.month)}</h3>
                  <Button variant="primary" onClick={() => downloadExcel(excelData)}><FiDownload /> Download Excel Excel</Button>
                </div>
                <div className='attendance--excel--table draggable--table new--project--rows table-responsive-xl'>
                    <Table>
                        <thead>
                            <tr key="project-table-header">
                                <th scope="col" className="sticky p-0" key="project-name-header">
                                  <div className="d-flex p-3 border-end">
                                    <div className="project--name py-2">
                                        Team Member
                                    </div>
                                  </div>
                                </th>
                                <MonthHeader month={filters?.month?.split("/")[0]} year={filters?.month?.split("/")[1]} />
                                <th className="bg--green text-center">
                                  <strong>Present</strong>
                                </th>
                                <th className="bg--red text-center">
                                  <strong>Absent</strong>
                                </th>
                                <th className="bg--blue text-center">
                                  <strong>Half Day</strong>
                                </th>
                                <th className="bg--purple text-center">
                                  <strong>Short Leave (6h)</strong>
                                </th>
                                <th className="bg--orange text-center">
                                  <strong>Short (2h)</strong>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                          {
                            (excelData && excelData.length > 0) && 
                              excelData.map((data, i) => {
                                return (
                                  <tr>
                                    <td className="project--title--td sticky">
                                      <div className="d-flex justify-content-between">
                                        <div className="project--name d-flex justify-content-start gap-3 align-items-center border-end">
                                            <div className="title--initial">{data?.name?.substring(0, 2)}</div>
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
                                          if (atten.count !== undefined) {
                                            return (
                                              <td className={`${atten?.bg} text-center`} key={ind}>
                                                <strong>{atten?.count}</strong>
                                              </td>
                                            );
                                          } else {
                                            return (
                                              <td className="text-center" key={ind}>
                                                <span className={`att--badge ${getBadgeColor(atten?.status)}`}>
                                                  {
                                                    atten?.status && atten?.status !== <BsDash />
                                                      ? (atten.status.split(" ").length === 2
                                                          ? atten.status.substring(0, 2)
                                                          : atten.status.charAt(0))
                                                      : <BsDash />
                                                  }
                                                </span>
                                                <strong>{atten?.total_time}</strong>
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
                <div className="pt-4">
                  <div className="d-flex align-items-center gap-3 gap-md-4 flex-wrap att--status--abbr">
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--green">P</span><span className="text-slate-600">Present</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--purple">SL</span><span className="text-slate-600">Short Leave</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--red">A</span><span className="text-slate-600">Absent</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--orange">SL</span><span className="text-slate-600">Short</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--blue">H</span><span className="text-slate-600">Half Day</span></div>
                  </div>
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
                      <Card className="card--green">
                        <Card.Body>
                          <Card.Title><span>Present</span>{attendanceSummary?.present}</Card.Title>
                          <Card.Text><FiCheckCircle /></Card.Text>
                        </Card.Body>
                      </Card>
                      <Card className="card--red">
                        <Card.Body>
                          <Card.Title><span>Absent</span>{attendanceSummary?.absent}</Card.Title>
                          <Card.Text><AiOutlineCloseCircle /></Card.Text>
                        </Card.Body>
                      </Card>
                      <Card className="card--orange">
                        <Card.Body>
                          <Card.Title><span>Short (2h)</span>{attendanceSummary?.other}</Card.Title>
                          <Card.Text><FiCoffee /></Card.Text>
                        </Card.Body>
                      </Card>
                      <Card className="card--blue">
                        <Card.Body>
                          <Card.Title><span>Half Day</span>{attendanceSummary?.half_day}</Card.Title>
                          <Card.Text><FiClock /></Card.Text>
                        </Card.Body>
                      </Card>
                      <Card className="card--purple">
                        <Card.Body>
                          <Card.Title><span>Short Leave (6h)</span>{attendanceSummary?.short_leave}</Card.Title>
                          <Card.Text><LuTimer /></Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
                <div className="attendance--table team--view" id="team--view">
                  <h3 className="mb-4 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Team Attendance Overview - June 2025</h3>
                  <div className='attendance--table--list'>
                    <Table responsive="lg">
                      <tbody className="bg-white">
                        {attendances &&
                          attendances.map((attendanceData, dateIndex) => (
                            <tr key={`attendance-row-${dateIndex}`}>
                              <td>
                                <div className="d-flex justify-content-between">
                                  <div className="project--name d-flex gap-3 align-items-center">
                                      <div className="title--initial">{attendanceData?.name?.substring(0, 2)}</div>
                                      <div className="title--span flex-column d-flex align-items-start gap-0">
                                          <span>{attendanceData?.name}</span>
                                          <strong>{attendanceData?.role}</strong>
                                      </div>
                                  </div>
                                </div>
                              </td>
                              <td className="ms-lg-auto">
                                <div className="d-flex align-items-center gap-3 gap-xl-4 mt-3 mt-xl-0 flex-wrap">
                                  <div className="text-center">
                                    <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">{attendanceData?.attendance?.present || 0} <small>Present</small></h4>
                                  </div>
                                  <div className="text-center">
                                    <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">{attendanceData?.attendance?.other || 0} <small>Short (2h)</small></h4>
                                  </div>
                                  <div className="text-center">
                                    <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">{attendanceData?.attendance?.short_leave || 0} <small>Short Leave (6h)</small></h4>
                                  </div>
                                  <div className="text-center">
                                    <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">{attendanceData?.attendance?.half_day || 0} <small>Half Day</small></h4>
                                  </div>
                                  <div className="text-center">
                                    <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">{attendanceData?.attendance?.absent || 0} <small>Absent</small></h4>
                                  </div>
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
        </div>
      </div>
      {isActive === 1 &&
        <div className="details--projects--grid projects--grid common--project--grid">
          <div className="wrapper--title py-2 bg-white border-bottom">
              <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
              <div className="projecttitle">
                <Dropdown key={'member-filter'}>
                  <Dropdown.Toggle variant="link" id="dropdown-basic" key={'member-filter-toggle'}>
                    <h3>
                      <strong>{selectedMember?.name}</strong>
                      <span>{ selectedMember?.role?.name || selectedMember?.role || ''}</span>
                    </h3>
                  </Dropdown.Toggle>
                  <Dropdown.Menu key={`member-drop`}>
                      <div className="drop--scroll">
                          {members.map((member, index) => {
                              return (
                                  <Dropdown.Item key={`drop-item-${member._id}`} value={member._id} onClick={() => { handleMemberAttendance(member) }}>
                                      <strong>{member.name}</strong>
                                      
                                  </Dropdown.Item>
                              
                              )
                          })}
                      </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <ListGroup horizontal>
                  <ListGroup.Item key={'toggle-handle'} onClick={handleToggles} className="d-none d-lg-flex"><GrExpand /></ListGroup.Item>
                  <ListGroupItem className="btn btn-primary" key={`closekey`} onClick={() => {setIsActive(0);dispatch(toggleSidebarSmall( false))}}><MdOutlineClose /></ListGroupItem>
              </ListGroup>
          </div>
          <div className="bg-white attendance--table daily--attendance--table">
            <h3 className="mb-4 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Daily Attendance - June 2025</h3>
            <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr>
                      <th className="px-3 text-uppercase py-3" scope="col"><FiCalendar className="me-1" /> Date & Day</th>
                      <th className="px-3 text-uppercase py-3 text-center" scope="col"><FiLogIn className="me-1 color--green" /> Check In</th>
                      <th className="px-3 text-uppercase py-3 text-center" scope="col"><FiLogOut className="me-1 color--red" /> Check Out</th>
                      <th className="px-3 text-uppercase py-3 text-center" scope="col"><FiClock className="me-1 color--blue" /> Logged Hours</th>
                      <th className="px-3 text-uppercase py-3 text-center" scope="col"><FiEdit3 className="me-1 color--purple" /> Manual Entry</th>
                      <th className="px-3 text-uppercase py-3 text-center" scope="col"><FiClock className="me-1 color--moove" /> Total Hours</th>
                      <th className="px-3 text-uppercase py-3 text-center" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {memberAttendance &&
                      memberAttendance.map((attendanceDate, dateIndex) => (
                        attendanceDate.dailyAttendance.length === 0 ? (
                          <tr key={dateIndex}>
                            <td className="px-3 py-3"><strong>{formatDateinString(attendanceDate.date)}</strong></td>
                            <td className="px-3 py-3 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                            <td className="px-3 py-3 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                            <td className="px-3 py-3 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                            <td className="px-3 py-3 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                            <td className="px-3 py-3 text-center"><span className="att--badge badge--gray"><LuCircleDot /></span></td>
                            <td className="px-3 py-3 text-center"><span className="att--badge badge--gray"><BsDash /></span></td>
                          </tr>
                        ) : (
                          attendanceDate.dailyAttendance.map((attendance, attendanceIndex) => (
                            <tr key={`${dateIndex}-${attendanceIndex}`}>
                              <td className="px-3 py-3"><strong>{attendanceIndex === 0 ? formatDateinString(attendanceDate.date) : ''}</strong></td>
                              <td className="px-3 py-3 text-center"><span className="d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--green" title="check In"><GoDotFill /> {attendance.time_in}</span></td>
                              <td className="px-3 py-3 text-center"><span className="d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--red" title="check Out"><GoDotFill /> {attendance.time_out}</span></td>
                              <td className="px-3 py-3 text-center"><span className="d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--blue" title="Logged Hours"><GoDotFill /> {attendance.tracked_time}</span></td>
                              <td className="px-3 py-3 text-center"><span className="d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--purple" title="Manual Entry"><FiEdit3 /> {attendance.manual_time}</span></td>
                              <td className="px-3 py-3 text-center"><span className="d-inline-flex mx-auto align-items-center gap-2 status--badge rounded-3 bg--moove" title="Total Hours"><GoDotFill /> {attendance.total_time}</span></td>
                              <td className="px-3 py-3 text-center">{getAttendanceBadges(attendance?.status)}</td>
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
              <Form>
                <Form.Group className="mb-0 form-group">
                  <Dropdown className="select--dropdown">
                    <Dropdown.Toggle variant="success">Members</Dropdown.Toggle>
                    <Dropdown.Menu>
                    <div className="drop--scroll">
                      <Form>
                        <Form.Group className="form-group mb-3">
                          <Form.Control type="text" placeholder="Search here.." />
                        </Form.Group>
                      </Form>
                      <Dropdown.Item className="selected--option" href="#/action-1">Members <FaCheck /></Dropdown.Item>
                        {
                          members.map((member, index) => {
                              return <Dropdown.Item key={`member-projects-${index}`} onClick={() => handlefilterchange('member', member._id)}>{member.name}</Dropdown.Item>
                          })
                        }
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                 
                </Form.Group>
                <Form.Group className="mb-0 form-group">
                  <DatePicker 
                    key={'month-filter'}
                    name="month"
                    onlyMonthPicker={true}
                    value=""
                    open={true}
                    onChange={async (value) => {
                        handlefilterchange('month', value)
                      }
                    }    
                    editable={false}      
                    className="form-control"
                    placeholder="Select month"
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
    </>
  );
}

export default AttendancePage;