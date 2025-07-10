import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, Dropdown, ListGroup, Table, Card, Badge } from "react-bootstrap";
import dayjs from 'dayjs';
import { FaPlus, FaCheck, FaList } from "react-icons/fa";
import { GrExpand } from "react-icons/gr";
import { BsGrid } from "react-icons/bs";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineCheck } from "react-icons/md";
import { getFieldRules, validateField } from "../../helpers/rules";
import DatePicker from "react-multi-date-picker";
import { formatDateinString } from "../../helpers/commonfunctions";
import { FiCalendar, FiGift, FiSidebar, FiEdit } from 'react-icons/fi';
import { createHoliday, ListHolidays, deleteHoliday, updateHoliday } from "../../redux/actions/holiday.action";
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import { currentMemberProfile } from "../../helpers/auth";
function HolidaysPage() {
  const [isActiveView, setIsActiveView] = useState(2);
  const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
  const commonState = useSelector(state => state.common)
  const dispatch = useDispatch()
  const memberProfile = currentMemberProfile()
  const [ date, setDate] = useState('')
  const holidaysFeed = useSelector(state => state.holiday.holidays)
  const apiResult = useSelector(state => state.holiday)
  const [ holidays, setHolidays] = useState([])
  const [editItem, setEditItem ] = useState(false)
  let fieldErrors = {};
  const [isActive, setIsActive] = useState(false);
  const [fields, setFields] = useState({ date: "", occasion: '', type: ''});
  const [errors, setErrors] = useState({})
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
  const [ loader, setLoader ] = useState( false )
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [spinner, setSpinner] = useState(false)
  const [nextHoliday, setNextHoliday] = useState(null);
  const [currentMonthHolidayCount, setCurrentMonthHolidayCount] = useState(0);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true)
    const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
        // Get rules for the current field
        const rules = getFieldRules('holiday', fieldName);
        // Validate the field
        const error = await validateField('holiday', fieldName, value, rules);
        // If error exists, return it as part of the resolved promise
        return { fieldName, error };
    });

    // Wait for all promises to resolve
    const updatedErrorsArray = await Promise.all(updatedErrorsPromises);
    updatedErrorsArray.forEach(({ fieldName, error }) => {
        if (error) {
            fieldErrors[fieldName] = error;
        }
    });
    // Check if there are any errors
    const hasError = Object.keys(fieldErrors).length > 0;
    // If there are errors, update the errors state
    if (hasError) {
        setLoader(false)
        setErrors(fieldErrors);
    } else {
        const formData = new FormData();
        for (const [key, value] of Object.entries(fields)) {
          formData.append(key, value)
        }
        // let payload = formData;
        if(editItem !== false ){
          await dispatch(updateHoliday(editItem._id, fields))
        }else{
          await dispatch(createHoliday(formData))
        }
        setLoader(false)
    }
}

const handleListHolidays = async () => {
  setSpinner(true)
  await dispatch(ListHolidays());
  setLoader(false)
  setSpinner(false)
}

useEffect(() => {
  if (holidaysFeed && holidaysFeed.length > 0) {
    const today = new Date();
    let nextHoliday = null;
    let minDiff = Infinity;
    let currentMonthCount = 0;

    holidaysFeed.forEach(holiday => {
      const holidayDate = new Date(holiday.date);

      // Count holidays in the current month and year
      if (
        holidayDate.getMonth() === today.getMonth() &&
        holidayDate.getFullYear() === today.getFullYear()
      ) {
        currentMonthCount++;
      }

      // Check for next upcoming holiday
      const diffInTime = holidayDate.getTime() - today.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

      if (diffInDays >= 0 && diffInDays < minDiff) {
        minDiff = diffInDays;
        nextHoliday = holiday.occasion;
      }
    });
    setNextHoliday(nextHoliday); 
    setCurrentMonthHolidayCount(currentMonthCount); 
    setHolidays(holidaysFeed)
  }
}, [holidaysFeed])

useEffect(() => {
 
  if (apiResult.success) {
      setFields({ date: '', occasion: '', type: '' })
      handleClose()
      setEditItem(false )
      setLoader(false)
      handleListHolidays()
  }

}, [apiResult])

useEffect(() => {
  handleListHolidays()
  setLoader(true)
}, [])

useEffect(() => {
  if( editItem !== false ){
    setFields({date: editItem.date, occasion: editItem.occasion, type: editItem.type})
  }
}, [editItem])

const handleChange = ({ target: { name, value, type} }) => {
  setFields({ ...fields, [name]: value })
  setErrors({ ...errors, [name]: '' })
};

const showError = (name) => {
  if (errors[name]) return (<span className="error">{errors[name]}</span>)
  return null
}


const handleDelete = (id) => {
  dispatch(deleteHoliday(id))
}

const getStatusBadge = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();

  // Remove time portion for accurate comparison
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(inputDate, today)) return <Badge bg="primary">today</Badge>;
  if (inputDate < today) return <Badge className="mt-1 mt-xl-0" bg="secondary">past</Badge>;
  return <Badge className="mt-1 mt-xl-0" bg="success">upcoming</Badge>;


};

const getDaysLeft = (date) => {
  const today = dayjs();
  const target = dayjs(date);
  const diff = target.diff(today, 'day');
  return diff >= 0 ? `${diff} days left` : <span className="text-muted">Past Holiday</span>;
};

  return (
    <>

      <div className='team--page'>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
            <Row className="align-items-center">
              <Col md={12}>
                <h2>
                  <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
                  Holidays
                  <ListGroup horizontal className="ms-auto">
                    <ListGroup.Item>
                      <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="link" id="dropdown-basic"><FiCalendar /> 2025</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <div class="drop--scroll">
                              <a href="#" class="dropdown-item" role="button">2023</a>
                              <a href="#" class="dropdown-item" role="button">2024</a>
                              <a href="#" class="selected--option dropdown-item" role="button">2025 <MdOutlineCheck /></a>
                              <a href="#" class="dropdown-item" role="button">2026</a>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                    </ListGroup.Item>
                    <ListGroup horizontal className="d-none d-xl-flex">
                        <ListGroup.Item action className="d-none d-xl-flex view--icon" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                        <ListGroup.Item action className="d-none d-xl-flex view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
                    </ListGroup>
                    <ListGroup horizontal className='bg-white expand--icon d-md-flex'>
                      <ListGroup.Item className="d-none d-lg-flex" onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                      <ListGroup.Item>
                        {
                          (memberProfile?.permissions?.holidays?.create_edit_delete === true || memberProfile?.role?.slug === 'owner') && ( 
                          <ListGroup.Item className="btn btn-primary" onClick={handleShow}><FaPlus /></ListGroup.Item>
                          )
                        }
                      </ListGroup.Item>
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
            <Row className="gap-3 gap-lg-0">
              <Col lg={4}>
                <Card className="card--blue">
                  <Card.Body>
                    <Card.Title><span>Next Holiday</span>{nextHoliday}</Card.Title>
                    <Card.Text><FiCalendar /></Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="card--pink">
                  <Card.Body>
                    <Card.Title><span>This Month</span>{currentMonthHolidayCount}</Card.Title>
                    <Card.Text><HiOutlineLocationMarker /></Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="card--green">
                  <Card.Body>
                    <Card.Title><span>Total Holidays</span>{holidays?.length}</Card.Title>
                    <Card.Text><FiGift /></Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <div className={isActiveView === 1 ? 'project--grid--table holiday--table--grid' : isActiveView === 2 ? 'project--table holiday--table holidays--list bg-white' : 'project--table holiday--table holidays--list bg-white'}>
              <h3 class="mb-4 d-flex align-items-center gap-3"><span><FiCalendar /></span>Holiday Calendar - 2025</h3>
              <Table>
                <tbody>
                {
                  (holidays && holidays.length > 0)
                      ? holidays.map((holiday, index) => {
                        return (<>
                          <tr key={`holiday-row-${index}`} className={''}>
                            <td key={`date-td-${index}`} data-label="Date">
                              <div className="project--name d-flex align-items-center gap-4">
                                <span className="bank">🏛️</span>
                                <div className="title--span d-flex align-items-start gap-1 flex-column">
                                  <h5 className="d-xl-flex gap-3 align-items-start" key={`occasion-td-${index}`} data-label="Occasion">{holiday.occasion} {getStatusBadge(holiday.date)}</h5>
                                  <strong>{formatDateinString(holiday.date)}</strong>
                                  <p className="mb-0">
                                    <span className="me-3" key={`type-td-${index}`} data-label="Type">
                                      {holiday.type
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                        .join(' ')}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="text-end text-primary fw-semibold ms-xl-auto d-flex justify-content-between mt-3 mt-xl-0 align-items-center">
                              <span className="days--left">{getDaysLeft(holiday.date)}</span>
                              <div key={`action-td-${index}`} className="ms-3">
                                <Dropdown>
                                  <Dropdown.Toggle variant="dark"><FiEdit /></Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      key={`edit-item-${index}`}
                                      onClick={() => {
                                        if (memberProfile?.permissions?.holidays?.create_edit_delete === true || memberProfile?.role?.slug === 'owner') {
                                          setEditItem(holiday);
                                          handleShow();
                                        } else {
                                          console.log('action not allowed');
                                        }
                                      }}
                                    >Edit
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      key={`delete-item-${index}`}
                                      onClick={() => {
                                        if (memberProfile?.permissions?.holidays?.create_edit_delete === true || memberProfile?.role?.slug === 'owner') {
                                          handleDelete(holiday._id);
                                        } else {
                                          console.log('action not allowed');
                                        }
                                      }}
                                    >
                                      Delete
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                            </td>
                          </tr>
                        </>)
                      })
                      :
                      <></>
                }
                  
                </tbody>
              </Table>
              {
                holidays && holidays.length == 0 &&
                  <div className="text-center mt-5">
                      <h2>No Holidays Found</h2>
                  </div>
              }
            </div>
            
          </Container>
        </div>
      </div>

      <Modal show={show} onHide={handleClose} centered size="md" className="add--member--modal">
        <Modal.Header closeButton>
          <Modal.Title>Add Holiday</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}> 
            <Form.Group className="mb-3 form-group">
              
                <DatePicker 
                  key={'date-filter'}
                  name="date"
                  weekStartDayIndex={1}
                  id='datepicker'
                  value={fields['date']} 
                  format="YYYY-MM-DD"
                  dateSeparator=" - " 
                  open={true}
                  onChange={async (value) => {
                      setDate(value);
                      const selectedDate = new Date(value);
                      const formattedDate = selectedDate.toLocaleDateString('en-CA'); // 'en-CA' gives "YYYY-MM-DD" format
                      handleChange({ target: { name: 'date', value: formattedDate } });
                      // setFields({ ...fields, ['date']: date })
                    }
                  }    
                  editable={false}      
                  className="form-control"
                  placeholder="YYYY-MM-DD"
                />
                {showError('date')}
            </Form.Group>
            <Form.Group className="mb-3 form-group">
              <FloatingLabel label="Occasion">
                <Form.Control type="text" name="occasion" value={fields['occasion']} placeholder="Occasion" onChange={handleChange} />
              </FloatingLabel>
              {showError('occasion')}
            </Form.Group>
            <Form.Group className="mb-0 form-group">
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success" key="typekey">
                  {
                    fields['type'] === "full day" ? 
                     'Full Day'
                     :
                     fields['type'] === 'half day' ?
                     'Half Day'
                     :
                     'Type'
                  }
                </Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option">Type { (!fields['type'] || fields['type'] === '') ? <FaCheck /> : null}</Dropdown.Item>
                  <Dropdown.Item onClick={() => {
                    handleChange({ target: { name: 'type', value: 'full day' } });
                  }}>Full Day  { fields['type'] === 'full day' ? <FaCheck /> : null}</Dropdown.Item>
                  <Dropdown.Item onClick={() => {
                    handleChange({ target: { name: 'type', value: 'half day' } });
                  }}>Half Day{ fields['type'] === 'half day' ? <FaCheck /> : null}</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              {showError('type')}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {setShow( false)}}>Cancel</Button>
          <Button variant="primary" type="submit" onClick={handleSubmit} disabled={loader}>{loader ? 'Please wait...' : 'Add'}</Button>
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
              <Form>
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

export default HolidaysPage;