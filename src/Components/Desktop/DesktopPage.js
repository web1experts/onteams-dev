import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Container, Row, Col, ListGroup, Accordion, Dropdown, Tabs, Tab, Button } from "react-bootstrap";
import { FaPlay, FaPause } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { logout } from '../../redux/actions/auth.actions';

function DesktopPage() {

  const dispatch = useDispatch();
  const [showButton, setshowButton] = useState('start--btn');

  return (
    <div className='team--page desktop--page'>
      <div className='page--title p-3 pb-0'>
        <Container>
          <Row>
            <Col sm={5}>
              <h2>My Projects</h2>
            </Col>
            <Col sm={7}>
              <Dropdown align="end">
                <Dropdown.Toggle variant="primary" id="dropdown-basic">WE</Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="menu--scroll">
                    <Dropdown.Item><span className="initial--name">WE</span> Web Experts</Dropdown.Item>
                    <Dropdown.Item><span className="initial--name">DC</span> Workspace 01</Dropdown.Item>
                    <Dropdown.Item><span className="initial--name">RR</span> Workspace 02</Dropdown.Item>
                    <Dropdown.Item><span className="initial--name">SD</span> Workspace 03</Dropdown.Item>
                    <Dropdown.Item><span className="initial--name">KR</span> Workspace 04</Dropdown.Item>
                    <Dropdown.Item onClick={(event) => dispatch(logout())}><FiLogOut /> Logout</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Container>
      </div>
      <div className='page--wrapper p-3'>
        <Container>
          <Row>
            <Col sm={12} lg={6}>
              <Tabs defaultActiveKey="Completed">
                <Tab eventKey="Completed" title="Completed">
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>The Galaxy</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="01" className="p-3">
                          <Accordion.Item eventKey="01">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="02">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="03">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="04">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Ticket</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="02" className="p-3">
                          <Accordion.Item eventKey="001">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="002">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="003">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="004">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                      <Accordion.Header>OnTeams</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="03" className="p-3">
                          <Accordion.Item eventKey="0001">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0002">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0003">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0004">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Tab>
                <Tab eventKey="InProgress" title="In Progress">
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>The Galaxy</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="01" className="p-3">
                          <Accordion.Item eventKey="01">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="02">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="03">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="04">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Ticket</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="02" className="p-3">
                          <Accordion.Item eventKey="001">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="002">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="003">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="004">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                      <Accordion.Header>OnTeams</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="03" className="p-3">
                          <Accordion.Item eventKey="0001">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0002">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0003">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0004">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Tab>
                <Tab eventKey="OnHold" title="On Hold">
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>The Galaxy</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="01" className="p-3">
                          <Accordion.Item eventKey="01">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="02">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="03">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="04">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Ticket</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="02" className="p-3">
                          <Accordion.Item eventKey="001">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="002">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="003">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="004">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                      <Accordion.Header>OnTeams</Accordion.Header>
                      <Accordion.Body>
                        <Accordion defaultActiveKey="03" className="p-3">
                          <Accordion.Item eventKey="0001">
                            <Accordion.Header>Assigned Task</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0002">
                            <Accordion.Header>In Progress</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0003">
                            <Accordion.Header>In Review</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                          <Accordion.Item eventKey="0004">
                            <Accordion.Header>Completed</Accordion.Header>
                            <Accordion.Body>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item>
                                  <span className="pause--timer">
                                    <FaPlay className="d-none" />
                                    <FaPause />
                                  </span>
                                  Design Landing Page
                                  <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                              <ListGroup>
                                <ListGroup.Item className="active--task">
                                  <span className="play--timer">
                                    <FaPlay />
                                    <FaPause className="d-none" />
                                  </span>
                                  Design Landing Page
                                  {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                              </ListGroup>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Tab>
              </Tabs>
            </Col>
            <Col sm={12} lg={6}>
              <div class="timer--task">
                <h5>Web Design <small>Design project page</small></h5>
                <p class="task--timer"><span>Current Session <strong>2:03:34</strong></span></p>
                <Button active={showButton === 'start--btn'} onClick={() => setshowButton('stop--btn')} variant="primary"><FaPlay /> Start Tracking</Button>
                <Button active={showButton === 'stop--btn'} onClick={() => setshowButton('start--btn')} variant="danger"><FaPause /> Stop Tracking</Button>
                <div class="total--timer"><p>Todays Total <strong>2h 40m</strong></p></div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default DesktopPage;