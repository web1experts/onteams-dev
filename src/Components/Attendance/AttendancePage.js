import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Form, Dropdown, ListGroup, Table, Modal, Button } from "react-bootstrap";
import { FaEllipsisV, FaCheck } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { formatDateinString } from "../../helpers/commonfunctions";
import { ListAttendance } from "../../redux/actions/attendance.action";
import { Listmembers } from "../../redux/actions/members.action";
import DatePicker from "react-multi-date-picker";
function AttendancePage() {
  const dispatch = useDispatch()
  const attendanceFeed = useSelector(state => state.attendance.attendances)
  const apiResult = useSelector(state => state.attendance)
  const [ attendances, setAttendances] = useState([])
  const memberFeed = useSelector((state) => state.member.members)
  const [members, setMembers] = useState([])
  const [isActive, setIsActive] = useState(false);
  const [ filters, setFilters] = useState({});
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
  const handlefilterchange = (name, value) => {
    // if (name === "search" && value === "" || name === "search" && value.length > 1 || name !== "search") {
        setFilters({ ...filters, [name]: value })
    // }
  }

  const handleAttendanceList = async () => {
   await dispatch(ListAttendance(filters))
  }

  useEffect(() => {
    // selectboxObserver()
    dispatch(Listmembers(0, '', false));
    handleAttendanceList()
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

  useEffect(() => {
   console.log("attendances:: ", attendances)
  }, [attendances])

  return (
    <>

      <div className='team--page'>
        <div className='page--title px-md-2 pt-3'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>Attendance
                  <Button variant="primary" className={isActive ? 'd-flex' : 'd-lg-none'} onClick={handleFilterShow}><MdFilterList /></Button>
                  <ListGroup horizontal className='d-none d-lg-block ms-auto'>
                    <ListGroup.Item>
                      <Form className="d-flex align-items-center">
                        <Form.Group className="mb-0 form-group me-3">
                        <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('members', event.target.value)} value={filters['members'] || 'all'}>
                          <option value="all">Members</option>
                          {
                              members.map((member, index) => {
                                  return <option key={`member-projects-${index}`} value={member._id}>{member.name}</option>
                              })
                          }
                        </Form.Select>
                          
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
                  </ListGroup>
                </h2>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper px-md-2 py-3'>
          <Container fluid>
            {/* <div class="perf--badge">
              <h5 class="ms-auto">Attendance: <strong>28.57%</strong></h5>
            </div> */}
            <Table responsive="lg">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  {
                    members && members.length > 0 &&
                    members.map((member, index) => {
                      return (
                        <th scope="col">{member.name}</th>
                      )
                    })
                  }
                  
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
              {attendances && attendances.map((attendanceDate, dateIndex) => (
                <tr key={dateIndex}>
                  <td>{formatDateinString(attendanceDate.date)}</td>
                  {attendanceDate.dailyAttendance.map((attendance, idx) => (
                    <td key={attendance.memberId}>
                      {attendance.status}
                    </td>
                  ))}
                  <td className="text-end">
                    <Dropdown>
                      <Dropdown.Toggle variant="primary"><FaEllipsisV /></Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">Edit</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Delete</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
                
              </tbody>
            </Table>
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
                      <Dropdown.Item href="#/action-2">Hitesh Kumar</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">Tarun Giri</Dropdown.Item>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* <Select2
                    defaultValue={1}
                    data={[
                      { text: 'All Members', id: 1 },
                      { text: 'Hitesh Kumar', id: 2 },
                      { text: 'Tarun Giri', id: 3 },
                      { text: 'Gaurav Sharma', id: 4 },
                    ]}
                    options={{
                      placeholder: 'Members',
                    }}
                  /> */}
                </Form.Group>
                <Form.Group className="mb-0 form-group">
                  <Form.Control type="date" name="holidaydate" />
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