import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, Dropdown, ListGroup, Table } from "react-bootstrap";
import { FaEllipsisV, FaPlus, FaCheck } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { getFieldRules, validateField } from "../../helpers/rules";
import DatePicker from "react-multi-date-picker";
import { formatDateinString } from "../../helpers/commonfunctions";
import { createHoliday, ListHolidays, deleteHoliday, updateHoliday } from "../../redux/actions/holiday.action";
import { currentMemberProfile } from "../../helpers/auth";
function HolidaysPage() {
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
  return (
    <>

      <div className='team--page'>
        <div className='page--title px-md-2 py-3 bg-white border-bottom'>
          <Container fluid>
            <Row className="align-items-center">
              <Col xs={6} md={5}>
                <h2>Holidays
                  <Button variant="primary" className={isActive ? 'd-flex' : 'd-lg-none'} onClick={handleFilterShow}><MdFilterList /></Button>
                </h2>
              </Col>
              <Col xs={6} md={7}>
                <ListGroup horizontal>
                    
                    <ListGroup.Item>
                      {
                        (memberProfile?.permissions?.holidays?.create_edit_delete === true || memberProfile?.role?.slug === 'owner') && ( 
                        <Button variant="primary" className="" onClick={handleShow}><FaPlus /> Add Holidays</Button>
                        )
                      }
                      
                    </ListGroup.Item>
                  </ListGroup>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper px-md-2 py-3'>
        {
            spinner &&
            <div className="loading-bar">
                <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
        }
          <Container fluid>
            <Table responsive="lg" className="holiday--table">
              <thead>
                <tr key={`holiday-table-head`}>
                  <th scope="col"><abbr title="Number">#</abbr> Date</th>
                  <th scope="col">Occasion</th>
                  <th scope="col">Type</th>
                  <th scope="col" width={30}>Action</th>
                </tr>
              </thead>
              <tbody>
              {
                (holidays && holidays.length > 0)
                    ? holidays.map((holiday, index) => {
                      return (<>
                        <tr key={`holiday-row-${index}`}>
                          <td key={`date-td-${index}`} data-label="Date"><abbr>{index + 1 }.</abbr> {formatDateinString(holiday.date)}</td>
                          <td key={`occasion-td-${index}`} data-label="Occasion">{holiday.occasion}</td>
                          <td key={`type-td-${index}`} data-label="Type">{holiday.type.split(' ') // Split the sentence into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter and make the rest lowercase
    .join(' ')}</td>
                          <td key={`action-td-${index}`}>
                            <Dropdown>
                              <Dropdown.Toggle variant="primary"><FaEllipsisV /></Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item key={`edit-item-${index}`} onClick={() => {
                                  if(memberProfile?.permissions?.holidays?.create_edit_delete === true || memberProfile?.role?.slug === 'owner'){
                                    setEditItem(holiday);
                                    handleShow()
                                  }else{
                                    console.log('action not allowed')
                                  }
                                  
                                }}>Edit</Dropdown.Item>
                                <Dropdown.Item key={`delete-item-${index}`}onClick={() => {
                                  if(memberProfile?.permissions?.holidays?.create_edit_delete === true || memberProfile?.role?.slug === 'owner'){
                                    handleDelete(holiday._id)
                                  }else{
                                    console.log('action not allowed')
                                  }
                              
                                }}>Delete</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
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