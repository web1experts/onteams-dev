import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Form, Dropdown, ListGroup, Table, Modal, Button, Card, ListGroupItem } from "react-bootstrap";
import { FaCheck, FaEye } from "react-icons/fa";
import { FiCheckCircle, FiCoffee, FiClock, FiCalendar } from "react-icons/fi";
import { MdOutlineCheck, MdOutlineClose } from 'react-icons/md';
import { GrExpand } from "react-icons/gr";
import { LuTimer } from "react-icons/lu";
import { AiOutlineCloseCircle, AiOutlineTeam } from "react-icons/ai";
import { formatDateinString, selectboxObserver } from "../../helpers/commonfunctions";
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import { ListAttendance } from "../../redux/actions/attendance.action";
import { Listmembers } from "../../redux/actions/members.action";
import DatePicker from "react-multi-date-picker";
import { currentMemberProfile } from "../../helpers/auth";
function AttendancePage() {
  const dispatch = useDispatch()
  const memberProfile = currentMemberProfile()
  const [isActiveView, setIsActiveView] = useState(1);
  const attendanceFeed = useSelector(state => state.attendance.attendances)
  const apiResult = useSelector(state => state.attendance)
  const [ attendances, setAttendances] = useState([])
  const memberFeed = useSelector((state) => state.member.members)
  const [members, setMembers] = useState([])
  const [isActive, setIsActive] = useState(false);
  const [ filters, setFilters] = useState({member: memberProfile?._id});
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
  const [spinner, setSpinner] = useState(false);
  const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
  const commonState = useSelector(state => state.common)
  const [activeTab, setActiveTab] = useState('team'); 

  const handlefilterchange = (name, value) => {
    // if (name === "search" && value === "" || name === "search" && value.length > 1 || name !== "search") {
        setFilters({ ...filters, [name]: value })
    // }
  }

  const handleAttendanceList = async () => {
    setSpinner(true)
   await dispatch(ListAttendance(filters))
   setSpinner(false)
  }

  useEffect(() => {
    // selectboxObserver()
    dispatch(Listmembers(0, '', false));
    handleAttendanceList()
    selectboxObserver()
  },[])

  useEffect(() => {
    handleAttendanceList()
  },[filters])

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
        setMembers(memberFeed.memberData);
    }
}, [memberFeed, dispatch]);

  useEffect(() => {
    if (attendanceFeed) {
      setAttendances(attendanceFeed)
    }
  }, [attendanceFeed])

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
      <div className={ `${isActive === 1 ? 'show--details team--page project-collapse holidays--page' : isActive === 2 ? 'view--project team--page project-collapse holidays--page' :  'team--page holidays--page'} ${projectToggle === true ? 'project-collapse' : ''}`}>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  Attendance
                  <ListGroup horizontal className="ms-auto">
                    <ListGroup.Item>
                      <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="link" id="dropdown-basic"><FiCalendar /> June 2025</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <div class="drop--scroll">
                              <a href="#" class="dropdown-item" role="button">January 2024</a>
                              <a href="#" class="dropdown-item" role="button">February 2024</a>
                              <a href="#" class="dropdown-item" role="button">March 2024</a>
                              <a href="#" class="dropdown-item" role="button">April 2024</a>
                              <a href="#" class="dropdown-item" role="button">May 2024</a>
                              <a href="#" class="dropdown-item" role="button">June 2024</a>
                              <a href="#" class="dropdown-item" role="button">July 2024</a>
                              <a href="#" class="dropdown-item" role="button">August 2024</a>
                              <a href="#" class="dropdown-item" role="button">September 2024</a>
                              <a href="#" class="dropdown-item" role="button">October 2024</a>
                              <a href="#" class="dropdown-item" role="button">November 2024</a>
                              <a href="#" class="dropdown-item" role="button">December 2024</a>
                              <a href="#" class="dropdown-item" role="button">January 2025</a>
                              <a href="#" class="dropdown-item" role="button">February 2025</a>
                              <a href="#" class="dropdown-item" role="button">March 2025</a>
                              <a href="#" class="dropdown-item" role="button">April 2025</a>
                              <a href="#" class="dropdown-item" role="button">May 2025</a>
                              <a href="#" class="selected--option dropdown-item" role="button">June 2025 <MdOutlineCheck /></a>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                    </ListGroup.Item>
                    <ListGroup horizontal>
                        <ListGroup.Item action onClick={() => setActiveTab('team')} className={`${activeTab === 'team'? 'd-lg-flex view--icon active': 'd-lg-flex view--icon'}`}><AiOutlineTeam /> Team View</ListGroup.Item>
                        <ListGroup.Item action onClick={() => setActiveTab('excel')} className={`${activeTab === 'excel'? 'd-lg-flex view--icon active': 'd-lg-flex view--icon'}`}><FiCalendar /> Excel View</ListGroup.Item>
                    </ListGroup>
                    <ListGroup horizontal className='bg-white expand--icon d-md-flex'>
                      <ListGroup.Item onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                    </ListGroup>
                  </ListGroup>
                </h2>
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
                <h3 class="mb-4 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Attendance Matrix - June 2025</h3>
                <div className='attendance--excel--table draggable--table new--project--rows table-responsive-xl'>
                    <Table>
                        <thead>
                            <tr key="project-table-header">
                                <th scope="col" className="sticky" key="project-name-header">
                                    <div className="d-flex align-items-center justify-content-between">Team Member</div>
                                </th>
                                <th className="text-center">
                                  <small>Sun</small><strong>1</strong>
                                </th>
                                <th className="text-center">
                                  <small>Mon</small><strong>2</strong>
                                </th>
                                <th className="text-center">
                                  <small>Tue</small><strong>3</strong>
                                </th>
                                <th className="text-center">
                                  <small>Wed</small><strong>4</strong>
                                </th>
                                <th className="text-center">
                                  <small>Thu</small><strong>5</strong>
                                </th>
                                <th className="text-center">
                                  <small>Fri</small><strong>6</strong>
                                </th>
                                <th className="text-center">
                                  <small>Sat</small><strong>7</strong>
                                </th>
                                <th className="text-center">
                                  <small>Sun</small><strong>8</strong>
                                </th>
                                <th className="text-center">
                                  <small>Mon</small><strong>9</strong>
                                </th>
                                <th className="text-center">
                                  <small>Tue</small><strong>10</strong>
                                </th>
                                <th className="text-center">
                                  <small>Wed</small><strong>11</strong>
                                </th>
                                <th className="text-center">
                                  <small>Thu</small><strong>12</strong>
                                </th>
                                <th className="text-center">
                                  <small>Fri</small><strong>13</strong>
                                </th>
                                <th className="text-center">
                                  <small>Sat</small><strong>14</strong>
                                </th>
                                <th className="text-center">
                                  <small>Sun</small><strong>15</strong>
                                </th>
                                <th className="text-center">
                                  <small>Mon</small><strong>16</strong>
                                </th>
                                <th className="text-center">
                                  <small>Tue</small><strong>17</strong>
                                </th>
                                <th className="text-center">
                                  <small>Wed</small><strong>18</strong>
                                </th>
                                <th className="text-center">
                                  <small>Thu</small><strong>19</strong>
                                </th>
                                <th className="text-center">
                                  <small>Fri</small><strong>20</strong>
                                </th>
                                <th className="text-center">
                                  <small>Sat</small><strong>21</strong>
                                </th>
                                <th className="text-center">
                                  <small>Sun</small><strong>22</strong>
                                </th>
                                <th className="text-center">
                                  <small>Mon</small><strong>23</strong>
                                </th>
                                <th className="text-center">
                                  <small>Tue</small><strong>24</strong>
                                </th>
                                <th className="text-center">
                                  <small>Wed</small><strong>25</strong>
                                </th>
                                <th className="text-center">
                                  <small>Thu</small><strong>26</strong>
                                </th>
                                <th className="text-center">
                                  <small>Fri</small><strong>27</strong>
                                </th>
                                <th className="text-center">
                                  <small>Sat</small><strong>28</strong>
                                </th>
                                <th className="text-center">
                                  <small>Sun</small><strong>29</strong>
                                </th>
                                <th className="text-center">
                                  <small>Mon</small><strong>30</strong>
                                </th>
                                <th className="hidden text-center">
                                  <small>Tue</small><strong>31</strong>
                                </th>
                                <th className="bg--green text-center">
                                  <strong>Present</strong>
                                </th>
                                <th className="bg--red text-center">
                                  <strong>Absent</strong>
                                </th>
                                <th className="bg--orange text-center">
                                  <strong>Short (2h)</strong>
                                </th>
                                <th className="bg--blue text-center">
                                  <strong>Half Day</strong>
                                </th>
                                <th className="bg--purple text-center">
                                  <strong>Short Leave (6h)</strong>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="project--title--td sticky">
                              <div className="d-flex justify-content-between">
                                <div className="project--name d-flex justify-content-start gap-3 align-items-center">
                                    <div className="title--initial">GS</div>
                                    <div className="title--span flex-column d-flex align-items-start gap-0">
                                        <span>Gagandeep Singh</span>
                                        <strong>UI/UX Designer</strong>
                                    </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="hidden text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="bg--green text-center">
                              <strong>22</strong>
                            </td>
                            <td className="bg--red text-center">
                              <strong>4</strong>
                            </td>
                            <td className="bg--orange text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--blue text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--purple text-center">
                              <strong>3</strong>
                            </td>
                          </tr>
                          <tr>
                            <td className="project--title--td sticky">
                              <div className="d-flex justify-content-between">
                                <div className="project--name d-flex justify-content-start gap-3 align-items-center">
                                    <div className="title--initial">GS</div>
                                    <div className="title--span flex-column d-flex align-items-start gap-0">
                                        <span>Gagandeep Singh</span>
                                        <strong>UI/UX Designer</strong>
                                    </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="hidden text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="bg--green text-center">
                              <strong>22</strong>
                            </td>
                            <td className="bg--red text-center">
                              <strong>4</strong>
                            </td>
                            <td className="bg--orange text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--blue text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--purple text-center">
                              <strong>3</strong>
                            </td>
                          </tr>
                          <tr>
                            <td className="project--title--td sticky">
                              <div className="d-flex justify-content-between">
                                <div className="project--name d-flex justify-content-start gap-3 align-items-center">
                                    <div className="title--initial">GS</div>
                                    <div className="title--span flex-column d-flex align-items-start gap-0">
                                        <span>Gagandeep Singh</span>
                                        <strong>UI/UX Designer</strong>
                                    </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="hidden text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="bg--green text-center">
                              <strong>22</strong>
                            </td>
                            <td className="bg--red text-center">
                              <strong>4</strong>
                            </td>
                            <td className="bg--orange text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--blue text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--purple text-center">
                              <strong>3</strong>
                            </td>
                          </tr>
                          <tr>
                            <td className="project--title--td sticky">
                              <div className="d-flex justify-content-between">
                                <div className="project--name d-flex justify-content-start gap-3 align-items-center">
                                    <div className="title--initial">GS</div>
                                    <div className="title--span flex-column d-flex align-items-start gap-0">
                                        <span>Gagandeep Singh</span>
                                        <strong>UI/UX Designer</strong>
                                    </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="hidden text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="bg--green text-center">
                              <strong>22</strong>
                            </td>
                            <td className="bg--red text-center">
                              <strong>4</strong>
                            </td>
                            <td className="bg--orange text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--blue text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--purple text-center">
                              <strong>3</strong>
                            </td>
                          </tr>
                          <tr>
                            <td className="project--title--td sticky">
                              <div className="d-flex justify-content-between">
                                <div className="project--name d-flex justify-content-start gap-3 align-items-center">
                                    <div className="title--initial">GS</div>
                                    <div className="title--span flex-column d-flex align-items-start gap-0">
                                        <span>Gagandeep Singh</span>
                                        <strong>UI/UX Designer</strong>
                                    </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--red">A</span>
                              <strong>0h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--green">P</span>
                              <strong>9h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--purple">SL</span>
                              <strong>6h 00m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--blue">H</span>
                              <strong>4h 30m</strong>
                            </td>
                            <td className="text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="hidden text-center">
                              <span className="att--badge bg--orange">S</span>
                              <strong>2h 00m</strong>
                            </td>
                            <td className="bg--green text-center">
                              <strong>22</strong>
                            </td>
                            <td className="bg--red text-center">
                              <strong>4</strong>
                            </td>
                            <td className="bg--orange text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--blue text-center">
                              <strong>2</strong>
                            </td>
                            <td className="bg--purple text-center">
                              <strong>3</strong>
                            </td>
                          </tr>
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

            {activeTab === 'team' && (
              <>
                <div className="attendance--stats">
                  <h3 class="mb-4 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Team Daily Totals - June 2025</h3>
                  <Row>
                    <Col>
                      <Card className="card--green">
                        <Card.Body>
                          <Card.Title><span>Present</span>10</Card.Title>
                          <Card.Text><FiCheckCircle /></Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col>
                      <Card className="card--red">
                        <Card.Body>
                          <Card.Title><span>Absent</span>2</Card.Title>
                          <Card.Text><AiOutlineCloseCircle /></Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col>
                      <Card className="card--orange">
                        <Card.Body>
                          <Card.Title><span>Short (2h)</span>2</Card.Title>
                          <Card.Text><FiCoffee /></Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col>
                      <Card className="card--blue">
                        <Card.Body>
                          <Card.Title><span>Half Day</span>5</Card.Title>
                          <Card.Text><FiClock /></Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col>
                      <Card className="card--purple">
                        <Card.Body>
                          <Card.Title><span>Short Leave (6h)</span>2</Card.Title>
                          <Card.Text><LuTimer /></Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
                <div className="attendance--table team--view" id="team--view">
                  <h3 class="mb-4 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Team Attendance Overview - June 2025</h3>
                  <div className='attendance--table--list'>
                    <Table responsive="lg">
                      <tbody className="bg-white">
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">GS</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Gagandeep Singh</span>
                                      <strong>UI/UX Designer</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(1);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">TG</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Tarun Giri</span>
                                      <strong>Project Manager</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">PS</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Paramjeet Singh</span>
                                      <strong>Managing Director</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">AJ</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Abhishek Jaiswal</span>
                                      <strong>Sr. Web Designer</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">RS</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Ritika Sharma</span>
                                      <strong>Sr. Human Resources</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">NC</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Nidhi Chandna</span>
                                      <strong>Sr. Human Resources</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">G</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Hitesh Kumar</span>
                                      <strong>Software Engineer</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">RS</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Ram Singh</span>
                                      <strong>Sr. Software Engineer</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">GS</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Gaurav Sharma</span>
                                      <strong>Sr. Software Engineer</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">ND</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Neha Dutt</span>
                                      <strong>Sr. Business Developer</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between">
                              <div className="project--name d-flex justify-content-between gap-3 align-items-center">
                                  <div className="title--initial">DE</div>
                                  <div className="title--span flex-column d-flex align-items-start gap-0">
                                      <span>Deepak</span>
                                      <strong>Office Assistant</strong>
                                  </div>
                              </div>
                            </div>
                          </td>
                          <td className="ms-auto">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--green">3 <small>Present</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--orange">1 <small>Short (2h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--purple">2 <small>Short Leave (6h)</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--blue">1 <small>Half Day</small></h4>
                              </div>
                              <div className="text-center">
                                <h4 className="mb-0 d-flex flex-column align-items-center justify-content-center text--red">1 <small>Absent</small></h4>
                              </div>
                              <Button variant="primary" className="px-3 py-2 d-flex align-items-center gap-2" onClick={() => {setIsActive(2);}}><FaEye/> Details</Button>
                            </div>
                          </td>
                        </tr>
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
            <div className="projecttitle">
              <h3>
                  <strong>Gagandeep Singh</strong>
                  <span>UI/UX Designer</span>
              </h3>
            </div>
            <ListGroup horizontal>
                <ListGroup.Item onClick={handleToggles} className="d-none d-sm-flex"><GrExpand /></ListGroup.Item>
                <ListGroupItem className="btn btn-primary" key={`closekey`} onClick={() => {setIsActive(0);dispatch(toggleSidebarSmall( false))}}><MdOutlineClose /></ListGroupItem>
            </ListGroup>
        </div>
        <div className="bg-white attendance--table">
          <h3 class="mb-4 d-flex align-items-center gap-3"><span><AiOutlineTeam /></span>Daily Attendance - June 2025</h3>
          <div className="overflow-x-auto">
              <Table responsive="lg">
                <thead>
                  <tr>
                    <th className="px-3 text-capitalize py-3" scope="col">Date</th>
                    <th className="px-3 text-capitalize py-3 text-center" scope="col">Time In</th>
                    <th className="px-3 text-capitalize py-3 text-center" scope="col">Time Out</th>
                    <th className="px-3 text-capitalize py-3 text-center" scope="col">Logged Time</th>
                    <th className="px-3 text-capitalize py-3 text-center" scope="col">Manual Time</th>
                    <th className="px-3 text-capitalize py-3 text-center" scope="col">Total Time</th>
                    <th className="px-3 text-capitalize py-3 text-center" scope="col">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {attendances &&
                    attendances.map((attendanceDate, dateIndex) => (
                      attendanceDate.dailyAttendance.length === 0 ? (
                        <tr key={dateIndex}>
                          <td className="px-3 py-3"><strong>{formatDateinString(attendanceDate.date)}</strong></td>
                          <td className="px-3 py-3 text-center">--</td>
                          <td className="px-3 py-3 text-center">--</td>
                          <td className="px-3 py-3 text-center">--</td>
                          <td className="px-3 py-3 text-center">--</td>
                          <td className="px-3 py-3 text-center">--</td>
                          <td className="px-3 py-3 text-center">--</td>
                        </tr>
                      ) : (
                        attendanceDate.dailyAttendance.map((attendance, attendanceIndex) => (
                          <tr key={`${dateIndex}-${attendanceIndex}`}>
                            <td className="px-3 py-3"><strong>{attendanceIndex === 0 ? formatDateinString(attendanceDate.date) : ''}</strong></td>
                            <td className="px-3 py-3 text-center">{attendance.time_in}</td>
                            <td className="px-3 py-3 text-center">{attendance.time_out}</td>
                            <td className="px-3 py-3 text-center">{attendance.tracked_time}</td>
                            <td className="px-3 py-3 text-center">{attendance.manual_time}</td>
                            <td className="px-3 py-3 text-center"><strong className="text--blue">{attendance.total_time}</strong></td>
                            <td className="px-3 py-3 text-center">
                              <span className="d-inline-flex mx-auto align-items-center gap-2" title="Present"><FiCheckCircle className="text--green" /><span className="status--badge bg--green">Present</span></span>
                              {/* <span className="d-inline-flex mx-auto align-items-center gap-2" title="Present"><LuTimer className="text--purple" /><span className="status--badge bg--purple">Short Leave (6h)</span></span>
                              <span className="d-inline-flex mx-auto align-items-center gap-2" title="Present"><FiCoffee className="text--orange" /><span className="status--badge bg--orange">Short (2h)</span></span>
                              <span className="d-inline-flex mx-auto align-items-center gap-2" title="Present"><FiClock className="text--blue"/><span className="status--badge bg--blue">Half Day</span></span>
                              <span className="d-inline-flex mx-auto align-items-center gap-2" title="Present"><AiOutlineCloseCircle className="text--red" /><span className="status--badge bg--red">Absent</span></span> */}
                              {/* {attendance.status} */}
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