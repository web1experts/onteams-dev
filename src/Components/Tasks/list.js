import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  Button, ListGroup, Accordion } from "react-bootstrap";
import { FaPlus, FaPlay, FaPause} from "react-icons/fa";

const TasksList = React.memo(( props ) => {

    const [showProject, setProjectShow] = useState(false);
    const handleProjectClose = () => setProjectShow(false);
    const handleProjectShow = () => setProjectShow(true);
    const [showTask, setTaskShow] = useState(false);
    const handleTaskClose = () => setTaskShow(false);
    const handleTaskShow = () => setTaskShow(true);
    const [currentProject, setCurrentProject] = useState({})

    useEffect(() => {
        if (props.currentProject) {
            setCurrentProject(props.currentProject)
        }

    }, [props.currentProject])

    return (
        <>
    {props.activeTab === 'GridView' && (
        <div className="task--list">
            {
                currentProject && Object.keys(currentProject).length > 0 && currentProject?.workflow?.tabs?.length > 0 &&

                currentProject?.workflow?.tabs.map((tab, index ) => (
                    <>
                        <div className="task--grid">
                            <h5> {tab.title} <Button variant="primary" onClick={handleTaskShow}><FaPlus /></Button></h5>
                            <ul>
                                <li onClick={handleProjectShow} className="task--button">Design project page</li>
                                <li onClick={handleProjectShow} className="task--button">Change color scheme</li>
                                <li onClick={handleProjectShow} className="task--button">change font style</li>
                                <li onClick={handleProjectShow} className="task--button">Sidebar menu change</li>
                                <li onClick={handleProjectShow} className="task--button">Design Profile page</li>
                                <li onClick={handleProjectShow} className="task--button">Design project page</li>
                                <li onClick={handleProjectShow} className="task--button">Change color scheme</li>
                                <li onClick={handleProjectShow} className="task--button">change font style</li>
                                <li onClick={handleProjectShow} className="task--button">Sidebar menu change</li>
                                <li onClick={handleProjectShow} className="task--button">responsive="lg" issues fixes</li>
                            </ul>
                        </div>
                        
                        </>
                ))
            }
            
        </div>
    )}
    {props?.activeTab === 'ListView' && (
        <Accordion defaultActiveKey="0" className="bg-light p-3">
            <Accordion.Item eventKey="0">
                <Accordion.Header>Assigned Task <span type="button" variant="primary" onClick={handleTaskShow}><FaPlus /></span></Accordion.Header>
                <Accordion.Body>
                    <ListGroup>
                        <ListGroup.Item key={"design"} className="active--task">
                            <span className="play--timer">
                                <FaPlay />
                                <FaPause className="d-none" />
                            </span>
                            Design Landing Page
                        </ListGroup.Item>
                    </ListGroup>
                    <ListGroup>
                        <ListGroup.Item key={"designi"}>
                            <span className="pause--timer">
                                <FaPlay className="d-none" />
                                <FaPause />
                            </span>
                            Design Landing Page
                            <span className="time--span">01:22:32</span>
                        </ListGroup.Item>
                    </ListGroup>
                    
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>In Progress</Accordion.Header>
                <Accordion.Body>
                    <ListGroup>
                        <ListGroup.Item key={"design1"} className="active--task">
                            <span className="play--timer">
                                <FaPlay />
                                <FaPause className="d-none" />
                            </span>
                            Design Landing Page
                            {/* <span class="time--span">01:22:32</span> */}
                        </ListGroup.Item>
                    </ListGroup>
                    <ListGroup>
                        <ListGroup.Item key={"design2"}>
                            <span className="pause--timer">
                                <FaPlay className="d-none" />
                                <FaPause />
                            </span>
                            Design Landing Page
                            <span className="time--span">01:22:32</span>
                        </ListGroup.Item>
                    </ListGroup>
                    
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>In Review</Accordion.Header>
                <Accordion.Body>
                    <ListGroup>
                        <ListGroup.Item key={"design3"} className="active--task">
                            <span className="play--timer">
                                <FaPlay />
                                <FaPause className="d-none" />
                            </span>
                            Design Landing Page
                            {/* <span class="time--span">01:22:32</span> */}
                        </ListGroup.Item>
                    </ListGroup>
                    <ListGroup>
                        <ListGroup.Item key={"design4"}>
                            <span className="pause--timer">
                                <FaPlay className="d-none" />
                                <FaPause />
                            </span>
                            Design Landing Page
                            <span className="time--span">01:22:32</span>
                        </ListGroup.Item>
                    </ListGroup>
                    
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
                <Accordion.Header>Completed</Accordion.Header>
                <Accordion.Body>
                    <ListGroup>
                        <ListGroup.Item key={"design6"} className="active--task">
                            <span className="play--timer">
                                <FaPlay />
                                <FaPause className="d-none" />
                            </span>
                            Design Landing Page
                            {/* <span class="time--span">01:22:32</span> */}
                        </ListGroup.Item>
                    </ListGroup>
                    <ListGroup>
                        <ListGroup.Item key={"design7"}>
                            <span className="pause--timer">
                                <FaPlay className="d-none" />
                                <FaPause />
                            </span>
                            Design Landing Page
                            <span className="time--span">01:22:32</span>
                        </ListGroup.Item>
                    </ListGroup>
                    
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )}
    </>
)
})

export default TasksList