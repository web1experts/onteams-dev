import React, { useState, useEffect } from "react";
import Select2 from 'react-select2-wrapper';
import { Container, Row, Col, Form, Dropdown, ListGroup, Table, Modal, Button } from "react-bootstrap";
import { FaEllipsisV, FaCheck } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { selectboxObserver } from "../../helpers/commonfunctions";
function AttendancePage() {
  const [isActive, setIsActive] = useState(false);
  const [ filters, setFilters] = useState({});
  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);
  const handlefilterchange = (name, value) => {
    if (name === "search" && value === "" || name === "search" && value.length > 1 || name !== "search") {
        setFilters({ ...filters, [name]: value })
    }
  }

  useEffect(() => {
    selectboxObserver()
  },[])
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
                          <option value="hitesh">Hitesh Kumar</option>
                          <option value="tarun">Tarun Giri</option>
                        </Form.Select>
                          
                        </Form.Group>
                        <Form.Group className="mb-0 form-group">
                          <Form.Control type="date" name="holidaydate" />
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
            <div class="perf--badge">
              <h5 class="ms-auto">Attendance: <strong>28.57%</strong></h5>
            </div>
            <Table responsive="lg">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Tarun Giri</th>
                  <th scope="col">Gagandeep Singh</th>
                  <th scope="col">Ram Singh</th>
                  <th scope="col">Abhishek Jaiswal</th>
                  <th scope="col">Hitesh Kumar</th>
                  <th scope="col">Gaurav Sharma</th>
                  <th scope="col">Neha Dutt</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Friday, 01 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 02 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 03 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 04 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 05 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 06 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 07 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 08 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 09 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 10 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 11 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 12 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 13 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 14 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 15 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 16 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 17 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 18 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 19 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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
                <tr>
                  <td>Friday, 20 September</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
                  <td>Half day</td>
                  <td>Present</td>
                  <td>Present</td>
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