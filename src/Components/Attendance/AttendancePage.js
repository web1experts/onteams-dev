import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Form, Dropdown, ListGroup, Table, Modal, Button } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { FiSidebar } from "react-icons/fi";
import { MdFilterList } from "react-icons/md";
import { GrExpand } from "react-icons/gr";
import { formatDateinString, selectboxObserver } from "../../helpers/commonfunctions";
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import { ListAttendance } from "../../redux/actions/attendance.action";
import { Listmembers } from "../../redux/actions/members.action";
import DatePicker from "react-multi-date-picker";
import { currentMemberProfile } from "../../helpers/auth";
function AttendancePage() {
  const dispatch = useDispatch()
  const memberProfile = currentMemberProfile()
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

  return (
    <>

      <div className='team--page'>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>
                  <span className="open--sidebar" onClick={() => {handleSidebarSmall(false);}}><FiSidebar /></span> Attendance
                  <ListGroup horizontal className='d-none d-md-flex ms-auto'>
                    <ListGroup.Item>
                      <Form className="d-flex align-items-center">
                        <Form.Group className="mb-0 form-group me-3">
                        {(memberProfile?.permissions?.members?.view === true && memberProfile?.permissions?.attendance?.view_others === true && memberProfile?.permissions?.attendance?.selected_members?.length > 0 || memberProfile?.role?.slug === "owner") && (
                          <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('member', event.target.value)} value={filters['member'] || 'all'}>
                            {
                              (memberProfile?.permissions?.attendance?.view_others === true || memberProfile?.role?.slug === 'owner') &&
                              <option value="all">All Members</option>
                            }
                           
                            {
                                members.map((member, index) => 
                                  (memberProfile?.permissions?.attendance?.selected_members?.includes(member._id)  || memberProfile?.role?.slug === 'owner') ? (
                                     <option selected={filters['member'] && filters['member'] === member._id ? true : false} key={`member-projects-${index}`} value={member._id}>{member.name}</option>
                                  ) : null)
                            }
                          </Form.Select>
                        )}
                        </Form.Group>
                        <Form.Group className="mb-0 form-group">
                          <DatePicker 
                            key={'month-filter'}
                            name="month"
                            onlyMonthPicker={true}
                            id='datepicker'
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
                    <ListGroup horizontal className={isActive ? 'd-none' : 'd-none d-md-flex bg-white expand--icon ms-3'}>
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
          <Container fluid>
            {/* <div className="perf--badge">
              <h5 className="ms-auto">Attendance: <strong>28.57%</strong></h5>
            </div> */}
            {
              !filters['member'] || filters['member'] === 'all' ?
              <div className="bg-white rounded-3 border attendance--table">
                <div className="px-3 py-4 border-b">
                    <h5 className="mb-0">Monthly Attendance - June 2025</h5>
                </div>
                <div className="overflow-x-auto">
                    <Table responsive="lg">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-uppercase bg-slate left-0">Member</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">1</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">2</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">3</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">4</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">5</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">6</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">7</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">8</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">9</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">10</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">11</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">12</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">13</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">14</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">15</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">16</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">17</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">18</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">19</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">20</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">21</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">22</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">23</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">24</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">25</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">26</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">27</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">28</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">29</th>
                                <th className="px-2 py-3 text-center text-uppercase bg-slate">30</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Gagandeep Singh</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Tarun Giri</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Gaurav Sharma</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Abhishek Jaiswal</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Ram Singh</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Ritika Sharma</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Hitesh Kumar</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Neha Dutt</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4">
                                    <div className="d-flex align-items-center mem--name">
                                        <img variant="top" src="./images/default.jpg" alt="Gagandeep Singh" className="me-3"/>
                                        <div>Nidhi Chandna</div>
                                    </div>
                                </td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                                <td className="px-2 py-4 text-center"><span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span></td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
                <div className="px-3 py-4 border-t">
                  <div className="d-flex align-items-center justify-content-center gap-3 gap-md-4 flex-wrap">
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--emerald">P</span><span className="text-slate-600">Present</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--amber">SL</span><span className="text-slate-600">Short Leave</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--red">A</span><span className="text-slate-600">Absent</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--blue">H</span><span className="text-slate-600">Half Day</span></div>
                  </div>
                </div>
              </div>
              // <Table responsive="lg">
              //   <thead>
              //     <tr>
              //       <th scope="col">Date</th>
              //       {
              //         members && members.length > 0 &&
              //         members.map((member, index) => {
              //           return (
              //             <th scope="col">{member.name}</th>
              //           )
              //         })
              //       }
              //     </tr>
              //   </thead>
              //   <tbody>
              //   {attendances && attendances.map((attendanceDate, dateIndex) => (
              //     <tr key={dateIndex}>
              //       <td>{formatDateinString(attendanceDate.date)}</td>
              //       {attendanceDate.dailyAttendance.length === 0 ? (
              //           members.map((member, i) => (
              //             <td key={`${member._id}-${i}`}>--</td>
              //         ))
              //         ) : (
              //           attendanceDate.dailyAttendance.map((attendance, attendanceIndex) => (
              //               <td key={`${attendance.memberId}-${attendanceIndex}`}>{attendance.status}</td>
              //           ))
              //         )}  
                    
              //     </tr>
              //   ))}
                  
              //   </tbody>
              // </Table>
              :
              <div className="bg-white rounded-3 border attendance--table">
                <div className="px-3 py-4 border-b">
                    <h5 className="mb-0">Monthly Attendance - June 2025</h5>
                </div>
                <div className="overflow-x-auto">
                    <Table responsive="lg">
                      <thead>
                        <tr>
                          <th className="px-3 text-uppercase py-3" scope="col">Date</th>
                          <th className="px-3 text-uppercase py-3 text-center" scope="col">Time In</th>
                          <th className="px-3 text-uppercase py-3 text-center" scope="col">Time Out</th>
                          <th className="px-3 text-uppercase py-3 text-center" scope="col">Logged Time</th>
                          <th className="px-3 text-uppercase py-3 text-center" scope="col">Manual Time</th>
                          <th className="px-3 text-uppercase py-3 text-center" scope="col">Total Time</th>
                          <th className="px-3 text-uppercase py-3 text-center" scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {attendances &&
                          attendances.map((attendanceDate, dateIndex) => (
                            attendanceDate.dailyAttendance.length === 0 ? (
                              <tr key={dateIndex}>
                                <td className="px-3 py-3">{formatDateinString(attendanceDate.date)}</td>
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
                                  <td className="px-3 py-3">{attendanceIndex === 0 ? formatDateinString(attendanceDate.date) : ''}</td>
                                  <td className="px-3 py-3 text-center">{attendance.time_in}</td>
                                  <td className="px-3 py-3 text-center">{attendance.time_out}</td>
                                  <td className="px-3 py-3 text-center">{attendance.tracked_time}</td>
                                  <td className="px-3 py-3 text-center">{attendance.manual_time}</td>
                                  <td className="px-3 py-3 text-center">{attendance.total_time}</td>
                                  <td className="px-3 py-3 text-center">
                                    <span className="d-flex mx-auto align-items-center justify-content-center bg--emerald" title="Present">P</span>
                                    {/* <span className="d-flex mx-auto align-items-center justify-content-center bg--amber" title="Short Leave">SL</span> */}
                                    {/* <span className="d-flex mx-auto align-items-center justify-content-center bg--blue" title="Half Day">H</span> */}
                                    {/* <span className="d-flex mx-auto align-items-center justify-content-center bg--red" title="Absent">A</span> */}
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
                <div className="px-3 py-4 border-t">
                  <div className="d-flex align-items-center justify-content-center gap-3 gap-md-4 flex-wrap">
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--emerald">P</span><span className="text-slate-600">Present</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--amber">SL</span><span className="text-slate-600">Short Leave</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--red">A</span><span className="text-slate-600">Absent</span></div>
                      <div className="d-flex align-items-center gap-2 flex-column flex-md-row"><span className="d-flex align-items-center justify-content-center bg--blue">H</span><span className="text-slate-600">Half Day</span></div>
                  </div>
                </div>
              </div>
              // <Table responsive="lg">
              //   <thead>
              //     <tr>
              //       <th scope="col">Date</th>
              //       <th scope="col">Time In</th>
              //       <th scope="col">Time Out</th>
              //       <th scope="col">Logged Time</th>
              //       <th scope="col">Manual Time</th>
              //       <th scope="col">Total Time</th>
              //       <th scope="col">Status</th>
              //     </tr>
              //   </thead>
              //   <tbody>
              //   {attendances &&
              //     attendances.map((attendanceDate, dateIndex) => (
              //       attendanceDate.dailyAttendance.length === 0 ? (
              //         <tr key={dateIndex}>
              //           <td>{formatDateinString(attendanceDate.date)}</td>
              //           <td>--</td>
              //           <td>--</td>
              //           <td>--</td>
              //           <td>--</td>
              //           <td>--</td>
              //           <td>--</td>
              //         </tr>
              //       ) : (
              //         attendanceDate.dailyAttendance.map((attendance, attendanceIndex) => (
              //           <tr key={`${dateIndex}-${attendanceIndex}`}>
              //             <td>{attendanceIndex === 0 ? formatDateinString(attendanceDate.date) : ''}</td>
              //             <td>{attendance.time_in}</td>
              //             <td>{attendance.time_out}</td>
              //             <td>{attendance.tracked_time}</td>
              //             <td>{attendance.manual_time}</td>
              //             <td>{attendance.total_time}</td>
              //             <td>{attendance.status}</td>
              //           </tr>
              //         ))
              //       )
              //     ))
              //   }

              //   </tbody>
              // </Table>
            
          }
          </Container>
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