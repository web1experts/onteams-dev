import React, { useState } from "react";
import Select2 from 'react-select2-wrapper';
import { Container, Row, Col, Button, Form, ListGroup, Table, Modal, Card, Dropdown } from "react-bootstrap";
import { FaPlus, FaCheck } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";

function InvoicePage() {

  const [isActive, setIsActive] = useState(false);
  const handleClick = event => {
    setIsActive(current => !current);
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [AddClient, setAddClient] = useState(false);
  const handleClientClose = () => setAddClient(false);
  const handleAddClient = () => setAddClient(true);
  const [selectedClient, setSelectedClient] = useState(null)

  return (
    <>

      <div className={isActive ? 'show--details team--page' : 'team--page'}>
        <div className='page--title p-md-3 py-3 pb-0'>
          <Container fluid>
            <Row>
              <Col sm={12}>
                <h2>Invoice <Button variant="primary" onClick={handleClick}><FaPlus /></Button></h2>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper p-md-3 py-3'>
          <Container fluid>
            <Table responsive="lg" className="invoice--table">
              <thead>
                <tr>
                  <th width={30}>
                    <Form.Check type='checkbox' name="check" className="form-check" />
                  </th>
                  <th scope="col">Invoice #</th>
                  <th scope="col" className="onHide">Client Name</th>
                  <th scope="col" className="onHide">Start Date</th>
                  <th scope="col" className="onHide">Due Date</th>
                  <th scope="col" className="onHide">Amount</th>
                  <th scope="col" className="onHide" width={30}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
                <tr>
                  <td><Form.Check type='checkbox' name="check" className="form-check" /></td>
                  <td data-label="Invoice #">INV-31333</td>
                  <td data-label="Client Name" className="onHide">Andrew Cole</td>
                  <td data-label="Start Date" className="onHide">07-04-2024</td>
                  <td data-label="Due Date" className="onHide">07-05-2024</td>
                  <td data-label="Amount" className="onHide">$200</td>
                  <td className="onHide">
                    <Button variant="primary" onClick={handleClick}>View</Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Container>
        </div>
      </div>
      <div className="details--wrapper">
        <div className="wrapper--title">
          <h3>Add/Edit Invoice</h3>
          <ListGroup horizontal>
            <ListGroup.Item onClick={() => setIsActive(false)}>
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>
        <div className="rounded--box client--box">
          <Form>
            <Row>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice #</Form.Label>
                  <Form.Control type="text" value='INV-10232' readOnly />
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client Name</Form.Label>
                  <div className="d-flex align-items-center">
                    <Dropdown className="select--dropdown">
                      <Dropdown.Toggle variant="success">Select</Dropdown.Toggle>
                      <Dropdown.Menu>
                      <div className="drop--scroll">
                        <Form>
                          <Form.Group className="form-group mb-3">
                            <Form.Control type="text" placeholder="Search here.." />
                          </Form.Group>
                        </Form>
                        <Dropdown.Item className="selected--option" href="#/action-1">Select <FaCheck /></Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Michael</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Andrew Cole</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Drew Scott</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Daniel</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Franklin</Dropdown.Item>
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Button variant="primary" className="ms-3" onClick={handleAddClient}>Add Client</Button>
                  </div>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency<sup>*</sup></Form.Label>
                  <Dropdown className="select--dropdown">
                    <Dropdown.Toggle variant="success">USD</Dropdown.Toggle>
                    <Dropdown.Menu>
                    <div className="drop--scroll">
                      <Form>
                        <Form.Group className="form-group mb-3">
                          <Form.Control type="text" placeholder="Search here.." />
                        </Form.Group>
                      </Form>
                      <Dropdown.Item className="selected--option" href="#/action-1">USD <FaCheck /></Dropdown.Item>
                      <Dropdown.Item href="#/action-2">EUR</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">AUD</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">AED</Dropdown.Item>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice Date <sup>*</sup></Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date <sup>*</sup></Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col sm={12} lg={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes <sup>*</sup></Form.Label>
                  <Form.Control as='textarea' rows='5' placeholder="Add notes here" />
                </Form.Group>
              </Col>
              <Col sm={12} lg={12}>
                <Table responsive="lg">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Project</th>
                      <th scope="col">Task</th>
                      <th scope="col">Time Spent</th>
                      <th scope="col">Rate</th>
                      <th scope="col">Unit Price</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label="Project Name">1</td>
                      <td data-label="Project Name">Membership Site</td>
                      <td data-label="Project Name">Design landing page</td>
                      <td data-label="Project Name">3 hrs 30 mins</td>
                      <td data-label="Project Name">Hourly</td>
                      <td data-label="Project Name">$30/hr</td>
                      <td data-label="Project Name">$100</td>
                    </tr>
                    <tr>
                      <td data-label="Project Name">2</td>
                      <td data-label="Project Name">Membership Site</td>
                      <td data-label="Project Name">Checkout process fixes</td>
                      <td data-label="Project Name">3 hr 00 mins</td>
                      <td data-label="Project Name">Fixed</td>
                      <td data-label="Project Name">$100</td>
                      <td data-label="Project Name">$100</td>
                    </tr>
                    <tr>
                      <td data-label="Project Name" colspan="7" class="text-center">
                        <button type="button" class="btn btn-success" onClick={handleShow} title="Add Item"><FaPlus /> Add Item</button>
                      </td>
                    </tr>
                    <tr>
                      <td data-label="Project Name" colspan="6" class="text-right"><strong>Total</strong></td>
                      <td data-label="Project Name"><strong>$130</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col sm={12} className="text-end">
                <Button variant="primary" type="submit">Save Changes</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Project</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Task</Form.Label>
                  <Form.Control type="text" />
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rate</Form.Label>
                  <Dropdown className="select--dropdown">
                    <Dropdown.Toggle variant="success">Hourly</Dropdown.Toggle>
                    <Dropdown.Menu>
                    <div className="drop--scroll">
                      <Form>
                        <Form.Group className="form-group mb-3">
                          <Form.Control type="text" placeholder="Search here.." />
                        </Form.Group>
                      </Form>
                      <Dropdown.Item className="selected--option" href="#/action-1">Hourly <FaCheck /></Dropdown.Item>
                      <Dropdown.Item href="#/action-2">Fixed</Dropdown.Item>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* <Select2
                    defaultValue={1}
                    data={[
                      { text: 'Hourly', id: 1 },
                      { text: 'Fixed', id: 2 },
                    ]}
                    options={{
                      placeholder: 'Rate',
                    }}
                  /> */}
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time Spent<sup>*</sup></Form.Label>
                  <Row>
                    <Col sm={12} lg={6}>
                      <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="success">Hours</Dropdown.Toggle>
                        <Dropdown.Menu>
                        <div className="drop--scroll">
                          <Form>
                            <Form.Group className="form-group mb-3">
                              <Form.Control type="text" placeholder="Search here.." />
                            </Form.Group>
                          </Form>
                          <Dropdown.Item className="selected--option" href="#/action-1">Hours <FaCheck /></Dropdown.Item>
                          <Dropdown.Item href="#/action-2">01</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">02</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">03</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">04</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">05</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">06</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">07</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">08</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">09</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">10</Dropdown.Item>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                      {/* <Select2
                        defaultValue={1}
                        data={[
                          { text: 'Hours', id: 1 },
                          { text: '1', id: 2 },
                          { text: '2', id: 3 },
                          { text: '3', id: 4 },
                        ]}
                        options={{
                          placeholder: 'Hours',
                        }}
                      /> */}
                    </Col>
                    <Col sm={12} lg={6}>
                      <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="success">Minutes</Dropdown.Toggle>
                        <Dropdown.Menu>
                        <div className="drop--scroll">
                          <Form>
                            <Form.Group className="form-group mb-3">
                              <Form.Control type="text" placeholder="Search here.." />
                            </Form.Group>
                          </Form>
                          <Dropdown.Item className="selected--option" href="#/action-1">Minutes <FaCheck /></Dropdown.Item>
                          <Dropdown.Item href="#/action-2">00</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">15</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">20</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">25</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">30</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">35</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">40</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">45</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">50</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">55</Dropdown.Item>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                      {/* <Select2
                        defaultValue={1}
                        data={[
                          { text: 'Minutes', id: 1 },
                          { text: '00', id: 2 },
                          { text: '15', id: 3 },
                          { text: '20', id: 4 },
                          { text: '25', id: 5 },
                          { text: '30', id: 6 },
                        ]}
                        options={{
                          placeholder: 'Minutes',
                        }}
                      /> */}
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit Price</Form.Label>
                  <Form.Control type="text" placeholder="$10" />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary">Add</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={AddClient} onHide={handleClientClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="rounded--box client--box">
            <Card>
              <div className="card--img">
                <Form.Control type="file" id="upload--img" hidden />
                <Form.Label for="upload--img">
                  <Card.Img variant="top" src="./images/default.jpg" />
                  <span>Add Photo</span>
                </Form.Label>
              </div>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Client Name</Form.Label>
                    <Form.Control type="text" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control type="text" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                      <Dropdown className="select--dropdown">
                        <Dropdown.Toggle variant="success">Afghanistan</Dropdown.Toggle>
                        <Dropdown.Menu>
                        <div className="drop--scroll">
                          <Form>
                            <Form.Group className="form-group mb-3">
                              <Form.Control type="text" placeholder="Search here.." />
                            </Form.Group>
                          </Form>
                          <Dropdown.Item className="selected--option" href="#/action-1">Afghanistan <FaCheck /></Dropdown.Item>
                          <Dropdown.Item href="#/action-2">Australia</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">Austria</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">Canada</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">China</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">France</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">Germany</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">India</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">New Zealand</Dropdown.Item>
                          <Dropdown.Item href="#/action-2">United Arab Emirates</Dropdown.Item>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    {/* <Select2
                      defaultValue={1}
                      data={[
                        { text: 'Select Country', id: 1 },
                        { text: 'Afghanistan', id: 2 },
                        { text: 'Australia', id: 3 },
                        { text: 'Austria', id: 4 },
                        { text: 'Canada', id: 5 },
                        { text: 'China', id: 6 },
                        { text: 'France', id: 7 },
                        { text: 'Germany', id: 8 },
                        { text: 'India', id: 9 },
                        { text: 'New Zealand', id: 10 },
                        { text: 'United Arab Emirates', id: 11 },
                      ]}
                      options={{
                        placeholder: 'Country',
                      }}
                    /> */}
                  </Form.Group>

                </Form>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClientClose}>Cancel</Button>
          <Button variant="primary">Add</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default InvoicePage;