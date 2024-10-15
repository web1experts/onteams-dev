import React, { useState } from "react";
import Select2 from 'react-select2-wrapper';
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, Dropdown, ListGroup, Table } from "react-bootstrap";
import { FaEllipsisV, FaPlus, FaCheck } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";

function HolidaysPage() {

  const inputs = document.querySelectorAll('.form-floating .form-control');

  inputs.forEach(input => {
    input.addEventListener('input', function () {
      if (this.value) {
        this.classList.add('filled');
      } else {
        this.classList.remove('filled');
      }
    });

    // Initial check in case the input is pre-filled
    if (input.value) {
      input.classList.add('filled');
    }
  });

  const [isActive, setIsActive] = useState(false);

  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>

      <div className='team--page'>
        <div className='page--title px-md-2 pt-3'>
          <Container fluid>
            <Row className="align-items-center">
              <Col xs={6} md={5}>
                <h2>Holidays
                  <Button variant="primary" className={isActive ? 'd-flex' : 'd-lg-none'} onClick={handleFilterShow}><MdFilterList /></Button>
                </h2>
              </Col>
              <Col xs={6} md={7}>
                <ListGroup horizontal>
                    <ListGroup.Item className='d-none d-lg-block'>
                      <Form>
                        <Form.Group className="mb-0 form-group">
                          <Form.Control type="date" name="holidaydate" />
                        </Form.Group>
                      </Form>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Button variant="primary" className="" onClick={handleShow}><FaPlus /> Add Holidays</Button>
                    </ListGroup.Item>
                  </ListGroup>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper px-md-2 py-3'>
          <Container fluid>
            <Table responsive="lg" className="holiday--table">
              <thead>
                <tr>
                  {/* <th scope="col" width={20}>#</th> */}
                  <th scope="col"><abbr>#</abbr> Date</th>
                  <th scope="col">Occasion</th>
                  <th scope="col">Type</th>
                  <th scope="col" width={30}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* <td>1</td> */}
                  <td data-label="Date"><abbr>1</abbr> Thursday, Jan 26, 2023</td>
                  <td data-label="Occasion">Republic Day</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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
                  {/* <td>2</td> */}
                  <td data-label="Date"><abbr>2</abbr> Wednessday, Mar 8, 2023</td>
                  <td data-label="Occasion">Holi</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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
                  {/* <td>3</td> */}
                  <td data-label="Date"><abbr>3</abbr> Tuesday, Aug 15, 2023</td>
                  <td data-label="Occasion">Independence Day</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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
                  {/* <td>4</td> */}
                  <td data-label="Date"><abbr>4</abbr> Wednessday, Aug 30, 2023</td>
                  <td data-label="Occasion">Raksha Bandhan</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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
                  {/* <td>5</td> */}
                  <td data-label="Date"><abbr>5</abbr> Monday, Oct 2, 2023</td>
                  <td data-label="Occasion">Mahatma Gandhi Jayanti</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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
                  {/* <td>6</td> */}
                  <td data-label="Date"><abbr>6</abbr> Tuesday, Oct 24, 2023</td>
                  <td data-label="Occasion">Dussehra</td>
                  <td data-label="Type">Half Day</td>
                  <td>
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
                  {/* <td>7</td> */}
                  <td data-label="Date"><abbr>7</abbr> Wednessday, Nov 1, 2023</td>
                  <td data-label="Occasion">Karva Chauth</td>
                  <td data-label="Type">Half Day</td>
                  <td>
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
                  {/* <td>8</td> */}
                  <td data-label="Date"><abbr>8</abbr> Sunday, Nov 12, 2023</td>
                  <td data-label="Occasion">Diwali/Deepavali</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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
                  {/* <td>9</td> */}
                  <td data-label="Date"><abbr>9</abbr> Wednessday, Nov 15, 2023</td>
                  <td data-label="Occasion">Bhai Dooj</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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
                  {/* <td>10</td> */}
                  <td data-label="Date"><abbr>10</abbr> Monday, Nov 27, 2023</td>
                  <td data-label="Occasion">Guru Nanak Jayanti</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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
                  {/* <td>11</td> */}
                  <td data-label="Date"><abbr>11</abbr> Monday, Dec 25, 2023</td>
                  <td data-label="Occasion">Christmas</td>
                  <td data-label="Type">Full Day</td>
                  <td>
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

      <Modal show={show} onHide={handleClose} centered size="md" className="add--member--modal">
        <Modal.Header closeButton>
          <Modal.Title>Add Holiday</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3 form-group">
              <FloatingLabel label="Holiday Date">
                <Form.Control type="date" name="holidaydate" placeholder="dd/mm/yyyy" />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3 form-group">
              <FloatingLabel label="Occasion">
                <Form.Control type="text" name="occasion" placeholder="Occasion" />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-0 form-group">
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success">Type</Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option" href="#/action-1">Type <FaCheck /></Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Full Day</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Half Day</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              {/* <Select2
                defaultValue={1}
                data={[
                  { text: 'Full Day', id: 1 },
                  { text: 'Half Day', id: 2 },
                ]}
                options={{
                  placeholder: 'Type',
                }}
              /> */}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Add</Button>
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