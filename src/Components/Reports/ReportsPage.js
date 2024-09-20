import React, { useEffect, useState } from "react";
import Select2 from 'react-select2-wrapper';
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/dist/styles.css";
import { Container, Row, Col, Button, Form, ListGroup, Accordion, Modal, Card, Badge, Dropdown, CardGroup } from "react-bootstrap";
import { Fullscreen } from "yet-another-react-lightbox/dist/plugins/Fullscreen";
import { FaAngleRight, FaPlay, FaCheck } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { selectboxObserver } from "../../helpers/commonfunctions";
function ReportsPage() {

  const fullscreenRef = React.useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("Screenshots");
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [ViewReport, setViewReport] = useState(false);
  const handleReportClose = () => setViewReport(false);
  const handleViewReport = () => setViewReport(true);

  const [open, setOpen] = useState(false);
  const [ filters, setFilters] = useState({});
  const [postMedia, setPostMedia] = useState('');

  const handleLightBox = (media) => {
    const data = [{ src: media }];
    setPostMedia(data)
    setOpen(true)
  }

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
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={postMedia}
        plugins={[Fullscreen]}
        fullscreen={{ ref: fullscreenRef }}
        on={{
          click: () => fullscreenRef.current?.enter(),
        }}
      />

      <div className='team--page'>
        <div className='page--title px-md-2 pt-3'>
          <Container fluid>
            <Row>
              <Col>
                <h2>Reports <Button variant="primary" className='d-flex d-xl-none' onClick={handleFilterShow}><MdFilterList /></Button></h2>
              </Col>
              <Col>
                <ListGroup horizontal>
                  <ListGroup.Item className="d-none d-xl-block">
                  <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('show_for', event.target.value)} value={filters['show_for'] || 'all'}>
                      <option value="">Sort by</option>
                      <option value="screenshots">Screenshots</option>
                      <option value="projects">Projects</option>
                  </Form.Select>
                    
                  </ListGroup.Item>
                  <ListGroup.Item className="d-none d-xl-block">
                  <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('reports', event.target.value)} value={filters['reports'] || 'all'}>
                      <option value="my">My Reports</option>
                      <option value="hitesh">Hitesh Kumar</option>
                      <option value="tarun">Tarun Giri</option>
                  </Form.Select>
                    
                  </ListGroup.Item>
                  <ListGroup.Item className="d-none d-xl-block">
                    <Form>
                      <Form.Group className="mb-0 form-group">
                        <Form.Control type="date" name="date" />
                      </Form.Group>
                    </Form>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Button variant="primary" onClick={handleShow}>Submit Report</Button>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
            </Row>
          </Container>
        </div>
        <div className='page--wrapper daily--reports px-md-2 py-3'>
          <Container fluid>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>The Galaxy <small>Hitesh Kumar</small></Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col sm={12}>
                      <div className="report--info">
                        <p className="p--card">
                          <label>Project Name</label>
                          <p>The Galaxy</p>
                        </p>
                        <p className="p--card">
                          <label>Member Name</label>
                          <p>Gagandeep Singh</p>
                        </p>
                        <p className="p--card">
                          <label>Report Time</label>
                          <p>06:10 PM</p>
                        </p>
                        <p className="p--card">
                          <label>Client Name</label>
                          <p>Daniel</p>
                        </p>
                        <p className="p--card">
                          <label>Time Spent</label>
                          <p>2 hrs 30 Min</p>
                        </p>
                        <p className="p--card">
                          <label>Client Updated</label>
                          <p>Yes I Did</p>
                        </p>
                        <p className="p--card">
                          <label>Time Tested</label>
                          <p>4</p>
                        </p>
                      </div>
                    </Col>
                    <Col sm={12} className="mb-4 border-top border-bottom pt-3 pb-4 bg-light">
                      <label>Remarks</label>
                      <pre>
                        Created below pages

                        https://tempiecomau.wpcomstaging.com
                        https://tempiecomau.wpcomstaging.com/about/
                        https://tempiecomau.wpcomstaging.com/find-a-tempie/
                        https://tempiecomau.wpcomstaging.com/be-a-tempie/
                        https://tempiecomau.wpcomstaging.com/contact-us/
                      </pre>
                    </Col>
                    <Col sm={12}>
                      <label>Tasks</label>
                      <ul>
                        <li>
                          <p className="mb-0"><FaAngleRight /> Search page design changes</p> <strong>00:15 min</strong>
                          <Badge bg="success">Completed</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                        <li>
                          <p className="mb-0"><FaAngleRight /> Remove extra spacing and a slide</p> <strong>00:45 min</strong>
                          <Badge bg="success">Completed</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                        <li>
                          <p className="mb-0"><FaAngleRight /> Search page design changes</p> <strong>00:30 min</strong>
                          <Badge bg="warning">In Progress</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>My Teams <small>Tarun Giri</small></Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col sm={12}>
                      <div className="report--info">
                        <p className="p--card">
                          <label>Project Name</label>
                          <p>The Galaxy</p>
                        </p>
                        <p className="p--card">
                          <label>Member Name</label>
                          <p>Gagandeep Singh</p>
                        </p>
                        <p className="p--card">
                          <label>Report Time</label>
                          <p>06:10 PM</p>
                        </p>
                        <p className="p--card">
                          <label>Client Name</label>
                          <p>Daniel</p>
                        </p>
                        <p className="p--card">
                          <label>Time Spent</label>
                          <p>2 hrs 30 Min</p>
                        </p>
                        <p className="p--card">
                          <label>Client Updated</label>
                          <p>Yes I Did</p>
                        </p>
                        <p className="p--card">
                          <label>Time Tested</label>
                          <p>4</p>
                        </p>
                      </div>
                    </Col>
                    <Col sm={12} className="mb-4 border-top border-bottom pt-3 pb-4 bg-light">
                      <label>Remarks</label>
                      <pre>Created below pages
                        https://tempiecomau.wpcomstaging.com
                        https://tempiecomau.wpcomstaging.com/about/
                        https://tempiecomau.wpcomstaging.com/find-a-tempie/
                        https://tempiecomau.wpcomstaging.com/be-a-tempie/
                        https://tempiecomau.wpcomstaging.com/contact-us/
                      </pre>
                    </Col>
                    <Col sm={12}>
                      <label>Tasks</label>
                      <ul>
                        <li><p className="mb-0"><FaAngleRight /> Search page design changes</p> <strong>00:15 min</strong>
                          <Badge bg="success">Completed</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                        <li><p className="mb-0"><FaAngleRight /> Remove extra spacing and a slide</p> <strong>00:45 min</strong>
                          <Badge bg="success">Completed</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                        <li><p className="mb-0"><FaAngleRight /> Search page design changes</p> <strong>00:30 min</strong>
                          <Badge bg="warning">In Progress</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>TheJugg <small>Gagandeep Singh</small></Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col sm={12}>
                      <div className="report--info">
                        <p className="p--card">
                          <label>Project Name</label>
                          <p>The Galaxy</p>
                        </p>
                        <p className="p--card">
                          <label>Member Name</label>
                          <p>Gagandeep Singh</p>
                        </p>
                        <p className="p--card">
                          <label>Report Time</label>
                          <p>06:10 PM</p>
                        </p>
                        <p className="p--card">
                          <label>Client Name</label>
                          <p>Daniel</p>
                        </p>
                        <p className="p--card">
                          <label>Time Spent</label>
                          <p>2 hrs 30 Min</p>
                        </p>
                        <p className="p--card">
                          <label>Client Updated</label>
                          <p>Yes I Did</p>
                        </p>
                        <p className="p--card">
                          <label>Time Tested</label>
                          <p>4</p>
                        </p>
                      </div>
                    </Col>
                    <Col sm={12} className="mb-4 border-top border-bottom pt-3 pb-4 bg-light">
                      <label>Remarks</label>
                      <pre>Created below pages
                        https://tempiecomau.wpcomstaging.com
                        https://tempiecomau.wpcomstaging.com/about/
                        https://tempiecomau.wpcomstaging.com/find-a-tempie/
                        https://tempiecomau.wpcomstaging.com/be-a-tempie/
                        https://tempiecomau.wpcomstaging.com/contact-us/
                      </pre>
                    </Col>
                    <Col sm={12}>
                      <label>Tasks</label>
                      <ul>
                        <li><p className="mb-0"><FaAngleRight /> Search page design changes</p> <strong>00:15 min</strong>
                          <Badge bg="success">Completed</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                        <li><p className="mb-0"><FaAngleRight /> Remove extra spacing and a slide</p> <strong>00:45 min</strong>
                          <Badge bg="success">Completed</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                        <li><p className="mb-0"><FaAngleRight /> Search page design changes</p> <strong>00:30 min</strong>
                          <Badge bg="warning">In Progress</Badge>
                          <Button variant="primary" onClick={handleViewReport}>View Report</Button>
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Container>
        </div>
      </div>
      <Modal show={show} onHide={handleClose} centered size="lg" className="AddReportModal">
        <Modal.Header closeButton>
          <Modal.Title>Submit Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select your Project</Form.Label>
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
                      <Dropdown.Item href="#/action-2">The Galaxy</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">TheJugg</Dropdown.Item>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* <Select2
                    defaultValue={1}
                    data={[
                      { text: 'Select', id: 1 },
                      { text: 'The Galaxy', id: 2 },
                      { text: 'My Teams', id: 3 },
                      { text: 'TheJugg', id: 4 },
                    ]}
                    options={{
                      placeholder: 'Project',
                    }}
                  /> */}
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time Spent</Form.Label>
                  <p className="mb-0"><strong>4 hours 30 minutes</strong></p>
                </Form.Group>
              </Col>
              <Col sm={12} lg={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Add Manual Time</Form.Label>
                  <Row>
                    <Col xs={6} lg={6}>
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
                          { text: '01', id: 2 },
                          { text: '02', id: 3 },
                          { text: '03', id: 4 },
                          { text: '04', id: 5 },
                          { text: '05', id: 6 },
                          { text: '06', id: 7 },
                          { text: '07', id: 8 },
                          { text: '08', id: 9 },
                          { text: '09', id: 10 },
                          { text: '10', id: 11 },
                        ]}
                        options={{
                          placeholder: 'Hours',
                        }}
                      /> */}
                    </Col>
                    <Col xs={6} lg={6}>
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
                          { text: '35', id: 7 },
                          { text: '40', id: 8 },
                          { text: '45', id: 9 },
                          { text: '50', id: 10 },
                          { text: '55', id: 11 },
                        ]}
                        options={{
                          placeholder: 'Minutes',
                        }}
                      /> */}
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col sm={12} lg={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Task List</Form.Label>
                  <ul>
                    <li>Design project page
                      <Dropdown>
                        <Dropdown.Toggle variant="success">Completed</Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item className="in--progress" href="javacript:;">In progress</Dropdown.Item>
                          <Dropdown.Item className="in--review" href="javacript:;">In Review</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                    <li>Change color scheme
                      <Dropdown>
                        <Dropdown.Toggle variant="info">In Review</Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item className="in--progress" href="javacript:;">In progress</Dropdown.Item>
                          <Dropdown.Item className="completed" href="javacript:;">Completed</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                    <li>change font style
                      <Dropdown>
                        <Dropdown.Toggle variant="warning">In Progress</Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item className="in--review" href="javacript:;">In Review</Dropdown.Item>
                          <Dropdown.Item className="completed" href="javacript:;">Completed</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                    <li>Design project page
                      <Dropdown>
                        <Dropdown.Toggle variant="success">Completed</Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item className="in--progress" href="javacript:;">In progress</Dropdown.Item>
                          <Dropdown.Item className="in--review" href="javacript:;">In Review</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                  </ul>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>How Many Times You Tested Your Work?</Form.Label>
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
                      <Dropdown.Item href="#/action-2">0 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">1 time</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">2 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">3 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">4 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">5 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">6 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">7 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">8 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">9 times</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">10 times</Dropdown.Item>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* <Select2
                    defaultValue={1}
                    data={[
                      { text: 'Select', id: 1 },
                      { text: '0 Times', id: 2 },
                      { text: '1 Times', id: 3 },
                      { text: '2 Times', id: 4 },
                      { text: '3 Times', id: 5 },
                      { text: '4 Times', id: 6 },
                      { text: '5 Times', id: 7 },
                      { text: '6 Times', id: 8 },
                      { text: '7 Times', id: 9 },
                      { text: '8 Times', id: 10 },
                      { text: '9 Times', id: 11 },
                      { text: '10 Times', id: 12 },
                    ]}
                    options={{
                      placeholder: 'Times',
                    }}
                  /> */}
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Did you shared updates with client?</Form.Label>
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
                      <Dropdown.Item href="#/action-2">Yes I did</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">No I didn't</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">Not required</Dropdown.Item>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* <Select2
                    defaultValue={1}
                    data={[
                      { text: 'Select', id: 1 },
                      { text: 'Yes I did', id: 2 },
                      { text: 'No I didn`t', id: 3 },
                      { text: 'Not required', id: 4 },
                    ]}
                    options={{
                      placeholder: 'Hours',
                    }}
                  /> */}
                </Form.Group>
              </Col>
              <Col sm={12} lg={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control as="textarea" placeholder="Please mention the complete details of the project with the Project URL, Screenshots, credentials, or whatever you think is important for the testing of the completed tasks." rows={3} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" disabled>Submit</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={ViewReport} onHide={handleReportClose} centered size="lg" className="timeSheetModal">
        <Modal.Header closeButton>
          <ListGroup horizontal>
            <ListGroup.Item action active={activeTab === "Screenshots"} onClick={() => setActiveTab("Screenshots")}>
              Screenshots
            </ListGroup.Item>
            <ListGroup.Item action active={activeTab === "Videos"} onClick={() => setActiveTab("Videos")}>
              Videos
            </ListGroup.Item>
          </ListGroup>
        </Modal.Header>
        <Modal.Body>
          {activeTab === "Screenshots" && (
            <>
              <h6 class="mb-2">09:00 AM - 10:00 AM</h6>
              <div class="shots--list">
                <CardGroup>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                </CardGroup>
              </div>
              <hr />
              <h6 class="mb-2">10:01 AM - 11:00 AM</h6>
              <div class="shots--list">
                <CardGroup>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img class="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                </CardGroup>
              </div>
            </>
          )}
          {activeTab === "Videos" && (
            <div class="shots--list">
              <CardGroup>
                <Card>
                  <Card.Body>
                    <span class="video--icon"><FaPlay /></span>
                    <img class="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span class="video--icon"><FaPlay /></span>
                    <img class="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span class="video--icon"><FaPlay /></span>
                    <img class="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span class="video--icon"><FaPlay /></span>
                    <img class="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span class="video--icon"><FaPlay /></span>
                    <img class="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span class="video--icon"><FaPlay /></span>
                    <img class="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span class="video--icon"><FaPlay /></span>
                    <img class="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span class="video--icon"><FaPlay /></span>
                    <img class="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
              </CardGroup>
            </div>
          )}
        </Modal.Body>
      </Modal>
      {/*--=-=Filter Modal**/}
      <Modal show={showFilter} onHide={handleFilterClose} centered size="md" className="filter--modal">
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item>
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success">Sort by</Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option" href="#/action-1">Sort by <FaCheck /></Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Screenshots</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Projects</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              {/* <Select2
                defaultValue={1}
                data={[
                  { text: 'Sort By', id: 1 },
                  { text: 'Screenshots', id: 2 },
                  { text: 'Projects', id: 3 },
                ]}
                options={{
                  placeholder: 'Sort By',
                }}
              /> */}
            </ListGroup.Item>
            <ListGroup.Item>
              <Dropdown className="select--dropdown">
                <Dropdown.Toggle variant="success">My Reports</Dropdown.Toggle>
                <Dropdown.Menu>
                <div className="drop--scroll">
                  <Form>
                    <Form.Group className="form-group mb-3">
                      <Form.Control type="text" placeholder="Search here.." />
                    </Form.Group>
                  </Form>
                  <Dropdown.Item className="selected--option" href="#/action-1">My Reports <FaCheck /></Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Hitesh Kumar</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Tarun Giri</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              {/* <Select2
                defaultValue={1}
                data={[
                  { text: 'My Reports', id: 1 },
                  { text: 'Hitesh Kumar', id: 2 },
                  { text: 'Tarun Giri', id: 3 },
                ]}
                options={{
                  placeholder: 'Select Reports',
                }}
              /> */}
            </ListGroup.Item>
            <ListGroup.Item>
              <Form>
                <Form.Group className="mb-0 form-group">
                  <Form.Control type="date" name="date" />
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

export default ReportsPage;