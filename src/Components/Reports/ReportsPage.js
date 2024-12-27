import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lightbox } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/dist/styles.css";
import { Container, Row, Col, Button, Form, ListGroup, Accordion, Modal, Card, Dropdown, CardGroup } from "react-bootstrap";
import Fullscreen  from "yet-another-react-lightbox/dist/plugins/fullscreen";
import { FaPlay, FaCheck } from "react-icons/fa";
import { generateTimeRange, showAmPmtime, getMemberdata } from "../../helpers/commonfunctions";
import { MdFilterList } from "react-icons/md";
import { getReportsByMember, gerReportsByProject } from "../../redux/actions/report.action";
import { Listmembers } from "../../redux/actions/members.action";
import { ListProjects } from "../../redux/actions/project.action";
import DatePicker from "react-multi-date-picker";
function ReportsPage() {
  const dispatch = useDispatch()
  const datePickerRef = useRef(null)
  const memberdata = getMemberdata()
  const fullscreenRef = React.useRef(null);
  const [activeTab, setActiveTab] = useState("Screenshots");
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const memberFeed = useSelector((state) => state.member.members)
  const projectFeed = useSelector(state => state.project.projects);
  const [ projects, setProjects ] = useState([])
  const [members, setMembers] = useState([])
  const reportState = useSelector((state) => state.reports)
  const [memberReports, setMemberReports] = useState([])
  const[ projectReports, setProjectReports] = useState([])
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const [screenshotTab, setScreenshotTab] = useState('Screenshots');
  const [ViewReport, setViewReport] = useState(false);
  const handleReportClose = () => setViewReport(false);
  const handleViewReport = () => setViewReport(true);
  const [ filtereddate, setFilteredDate ] = useState([new Date().toISOString().split('T')[0]])
  const [selectedFilter, setSelectedFilter ] = useState('today')
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postMedia, setPostMedia] = useState([]);
  const [ filters, setFilters] = useState({member: memberdata?._id, sort_by: 'members','project_status': 'all'});

  const [showFilter, setFilterShow] = useState(false);
  const handleFilterClose = () => setFilterShow(false);
  const handleFilterShow = () => setFilterShow(true);

  const handlefilterchange = (name, value) => {
    setFilters({ ...filters, [name]: value })
  }

  const handleListProjects = async () => {
      await dispatch(ListProjects({}));
  }

  const handleReports = () => {
    if( filters['sort_by'] === "members"){
      dispatch(getReportsByMember(filters))
    }else{
      dispatch(gerReportsByProject(filters))
    }
  }

  useEffect(() => {
    dispatch(Listmembers(0, '', false));
    handleListProjects()
  }, [dispatch])

  useEffect(() => {
    setActiveTab("Screenshots")
    handleReports()
  }, [filters])

  useEffect(() => {
      if (memberFeed && memberFeed.memberData) {
          setMembers(memberFeed.memberData);
      }
  }, [memberFeed, dispatch]);

  useEffect(() => {
      const check = ['undefined', undefined, 'null', null, '']
      if (projectFeed && projectFeed.projectData) {
          setProjects(projectFeed.projectData)
      }
  }, [projectFeed])

  useEffect(() => {
    handlefilterchange('date_range', filtereddate)
  }, [filtereddate])

  useEffect(() => {
      if (reportState?.memberReports) { 
        setMemberReports(reportState?.memberReports)
      }
      if(reportState.projectReports){
        setProjectReports(reportState.projectReports)
      }
    }, [reportState])

    const showRecordedTabs = () => {
        
          return (
            <>
                <ListGroup horizontal className="screens--shots">
                  <ListGroup.Item key={'screenshots1-tab-key'} action active={screenshotTab === "Screenshots"} onClick={() => setScreenshotTab("Screenshots")}>
                    Screenshots
                  </ListGroup.Item>
                  <ListGroup.Item key={'videos1-tab-key'} action active={screenshotTab === "Videos"} onClick={() => setScreenshotTab("Videos")}>
                    Videos
                  </ListGroup.Item>
                </ListGroup>
            </>
          )
      }

  const FilterButton = ({ position }) => {
      return (
        <>
          <div className="filter-box">
            <Button variant="primary" onClick={() => {
              handleReports()
            }} className="date-filter-btn me-1">Apply</Button>
            <Button variant="primary" onClick={() => setIsPickerOpen(false)} className="date-filter-btn ms-1">Cancel</Button>
          </div>
        </>
      )
    }
  
    const FiltersDate = ({ position, setFilteredDate, setSelectedFilter, setIsPickerOpen }) => {
      
      // Helper function to format dates as "YYYY-MM-DD"
      const formatDate = (date) => {
          return date.toISOString().split("T")[0];
      };
  
      // Helper function to calculate date ranges
      const handleDateFilter = (event, start, end = null) => {
          event.stopPropagation();
          if (end !== null) {
              setFilteredDate([formatDate(start), formatDate(end)]);
          } else {
              setFilteredDate([formatDate(start)]);
          }
          datePickerRef.current.closeCalendar()
          datePickerRef.current.openCalendar()
      };
  
      const today = new Date();
  
      // Yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
  
      // Last 7 days
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 6); // Subtract 6 to get exactly 7 days including today
  
      // Last week (Monday to Sunday)
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - today.getDay()); // Last Sunday
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekStart.getDate() - 6); // Last Monday
  
      // Last 2 weeks (from Monday of the week before last week)
      const last2WeeksStart = new Date(lastWeekStart);
      last2WeeksStart.setDate(last2WeeksStart.getDate() - 7);
  
      // This month (start to end of the current month)
      // This month (start to end of the current month)
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 2);
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Correctly gets the last day of the current month
      thisMonthEnd.setHours(23, 59, 59, 999); // Optional: Ensure full inclusion of the last day
  
  
      // Last month (start to end of the previous month)
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 2);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the last month
      lastMonthEnd.setHours(23, 59, 59, 999); // Ensure full-day inclusion for the last day
  
  
      return (
          <>
              <ListGroup vertical="true" className="date-filters">
                  <ListGroup.Item className={ selectedFilter === 'today'? 'active': ''} key={'date-today'} onClick={(e) => {handleDateFilter(e, today); setSelectedFilter('today')}}>Today</ListGroup.Item>
                  <ListGroup.Item className={ selectedFilter === 'yesterday'? 'active': ''} key={'date-yesterday'} onClick={(e) =>{ handleDateFilter(e, yesterday); setSelectedFilter('yesterday')}}>Yesterday</ListGroup.Item>
                  <ListGroup.Item className={ selectedFilter === '7days'? 'active': ''} key={'date-7days'} onClick={(e) => {handleDateFilter(e, last7Days, today); setSelectedFilter('7days')}}>Last 7 days</ListGroup.Item>
                  <ListGroup.Item className={ selectedFilter === 'last-week'? 'active': ''} key={'date-last-week'} onClick={(e) => {handleDateFilter(e, lastWeekStart, lastWeekEnd); setSelectedFilter('last-week')}}>Last week</ListGroup.Item>
                  <ListGroup.Item className={ selectedFilter === 'last2-weeks'? 'active': ''} key={'date-last2-weeks'} onClick={(e) => {handleDateFilter(e, last2WeeksStart, lastWeekEnd); setSelectedFilter('last2-weeks')}}>Last 2 weeks</ListGroup.Item>
                  <ListGroup.Item className={ selectedFilter === 'this-month'? 'active': ''} key={'date-this-month'} onClick={(e) => {handleDateFilter(e, thisMonthStart, thisMonthEnd); setSelectedFilter('this-month')}}>This month</ListGroup.Item>
                  <ListGroup.Item className={ selectedFilter === 'last-month'? 'active': ''} key={'date-last-month'} onClick={(e) => {handleDateFilter(e, lastMonthStart, lastMonthEnd); setSelectedFilter('last-month')}}>Last month</ListGroup.Item>
              </ListGroup>
          </>
      );
  };

  const handleLightBox = (type, mediaItems, index) => {
    setCurrentIndex(index);
    const slides =
    Array.isArray(mediaItems) && mediaItems.length > 0
      ? mediaItems.map((item) => {
          if (type === "video") {
            return {
              type: "video",
              src: item.url,
              poster: null, // Optional, for a thumbnail or video preview
              videoProps: {
                controls: true,
                autoPlay: false, // Set to true if you want videos to start automatically
                style: { maxHeight: "90vh", maxWidth: "100%" },
              },
            };
          }
          return { type: "image", src: item.url }; // Default case for images
        })
      : [];

    // const data = slides;
    setPostMedia(slides)
    setOpen(true)
  }
  

  return (
    <>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={postMedia}
        plugins={[Fullscreen]}
        fullscreen={{ ref: fullscreenRef }}
        index={currentIndex}
        on={{
          click: () => fullscreenRef.current?.enter(),
        }}
        render={{
          slide: ({slide}) => {
            if (slide?.type === "video") {
              return (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <video
                    controls
                    autoPlay={false}
                    style={{ maxHeight: "90vh", maxWidth: "100%" }}
                  >
                    <source src={slide.src} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }
            return null; // Default render for images will be used
          },
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
                  <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('sort_by', event.target.value)} value={filters['sort_by'] || 'members'}>
                      <option value="">Sort by</option>
                      <option value="members">Members</option>
                      <option value="projects">Projects</option>
                  </Form.Select>
                    
                  </ListGroup.Item>
                  {
                    filters['sort_by'] === 'members' ?
                  
                      <ListGroup.Item className="d-none d-xl-block">
                      <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('member', event.target.value)} value={filters['member'] || memberdata?._id}>
                        <option value={memberdata?._id}>My Reports</option>
                        {
                            members.map((member, index) => {
                                return <option key={`member-${index}`} value={member._id}>{member.name}</option>
                            })
                        }
                      </Form.Select>
                        
                      </ListGroup.Item>
                    :
                    <>
                      <ListGroup.Item key="status-filter-list">
                        <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('project_status', event.target.value)} value={filters['project_status'] || 'all'}>
                            <option value="all">View All</option>
                            <option value="in-progress">In Progress</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </Form.Select>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-none d-xl-block">
                        <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('project', event.target.value)} value={filters['project'] || ''}>
                          
                        {projects
                          .filter(project =>
                            filters['project_status'] === 'all' || project.status === filters['project_status']
                          )
                          .map((project, index) => (
                            <option key={`project-${index}`} value={project._id}>
                              {project.title}
                            </option>
                          ))}
                        </Form.Select>
                      </ListGroup.Item>
                      </>
                    }
                  <ListGroup.Item className="d-none d-xl-block">
                    <Form>
                      <Form.Group className="mb-0 form-group">
                      <DatePicker 
                        ref={datePickerRef}
                        key={'date-filter'}
                        name="date"
                        weekStartDayIndex={1}
                        id='datepicker-filter'
                        value={filtereddate} 
                        format="YYYY-MM-DD"
                        range
                        numberOfMonths={2}
                        dateSeparator=" - " 
                        onChange={async (value) => {
                            setFilteredDate(value)
                          }
                        }          
                        className="form-control"
                        placeholder="dd/mm/yyyy"
                        open={isPickerOpen} // Control visibility with state
                        onOpen={() => setIsPickerOpen(true)} // Update state when opened
                        onClose={() => setIsPickerOpen(false)} // Update state when closed
                        plugins={
                          [<FilterButton position="bottom" />, <FiltersDate position="left" setFilteredDate={setFilteredDate} setSelectedFilter={setSelectedFilter} setIsPickerOpen={setIsPickerOpen} />]
                        } 
                    />
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
          <div className="reports-section">
          <div className="rounded--box activity--box" key='activity-box'>
            <Accordion defaultActiveKey="0">
              {
                filters['sort_by'] === 'members' ?
                  memberReports && memberReports.length > 0 ? 
                    memberReports.map((report, index) => {
                      return (
                      <>
                      
                      <Accordion.Item eventKey={index} key={`accord-item-${index}`}>
                        <div className="screens--tabs">
                        
                          <Accordion.Header>
                            <p>
                              <span>Project: {report?.project?.title}</span>
                              <strong>{new Date(report?.createdAt).toLocaleDateString('en-GB', options)}</strong>
                              <strong>{ generateTimeRange(report?.createdAt, report?.duration)}</strong>
                            </p>
                          </Accordion.Header>
                        </div>
                        <Accordion.Body>
                          <div className="shots--list pt-3">
                            <ListGroup horizontal>
                              {showRecordedTabs()}
                            </ListGroup>
                            <CardGroup>
                                {
                                  report?.activityMeta && report.activityMeta.length > 0 ? (
                                    report.activityMeta.map((meta, i) => {
                                      // Handle screenshots tab
                                      if (screenshotTab === "Screenshots" && meta.meta_key === 'screenshots' && meta.meta_value.length > 0) {
                                        return meta.meta_value.map((screenshotData, j) => (
                                          <Card key={`screenshot-card-${i}-${j}`}>
                                            <Card.Body>
                                              <img
                                                className="card-img-top"
                                                src={screenshotData?.url}
                                                alt="screenshot"
                                                onClick={() => handleLightBox('screenshot', meta.meta_value, j)}
                                              />
                                              <p>
                                                <strong>Task Name:</strong> {screenshotData?.task_data?.title} <br />
                                                <strong>Date: {screenshotData?.taken_time.split('T')[0]}</strong><br />
                                                <strong>Time: {showAmPmtime(screenshotData?.taken_time)}</strong>
                                              </p>
                                            </Card.Body>
                                          </Card>
                                        ));
                                      }

                                      // Handle videos tab
                                      if (screenshotTab === "Videos" && meta.meta_key === 'videos' && meta.meta_value.length > 0) {
                                        return meta.meta_value.map((videoData, j) => (
                                          <Card key={`video-card-${i}-${j}`}>
                                            <Card.Body onClick={() => handleLightBox('video', meta.meta_value, j)}>
                                              <video controls height="175px">
                                                <source src={videoData?.url} type="video/webm" />
                                                Your browser does not support the video tag.
                                              </video>
                                              <p>
                                                <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                                                <strong>Date:{videoData?.start_time.split('T')[0]}</strong><br />
                                                <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                              </p>
                                            </Card.Body>
                                          </Card>
                                        ));
                                      }

                                      return null; // Return null if no condition is met
                                    })
                                  ) : (
                                    <div>No data available</div> // Display if no data is available
                                  )
                                }
                              </CardGroup>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </>
                      )
                    })
                  :
                  <p className="text-center mt-5">No activity available.</p>
                  :

                  projectReports && projectReports.length > 0 ? 
                    projectReports.map((report, index) => {
                      return (
                      <>
                      
                      <Accordion.Item eventKey={index}>
                        <div className="screens--tabs">
                        
                          <Accordion.Header>
                            <p>
                              <span>Member: {report?.member?.name}</span>
                              
                            </p>
                          </Accordion.Header>
                        </div>
                        <Accordion.Body>
                          <div className="shots--list pt-3">
                            <ListGroup horizontal>
                              {showRecordedTabs()}
                            </ListGroup>
                            <CardGroup>
                                {
                                  report?.activityMetas && report.activityMetas.length > 0 ? (
                                    report.activityMetas.map((meta, i) => {
                                      // Handle screenshots tab
                                      if (screenshotTab === "Screenshots" && meta.meta_key === 'screenshots' && meta.meta_value.length > 0) {
                                        return meta.meta_value.map((screenshotData, j) => (
                                          <Card key={`screenshot-card-${i}-${j}`}>
                                            <Card.Body>
                                              <img
                                                className="card-img-top"
                                                src={screenshotData?.url}
                                                alt="screenshot"
                                                onClick={() => handleLightBox('screenshot', meta.meta_value, j)}
                                              />
                                              <p>
                                                <strong>Task Name:</strong> {screenshotData?.task_data?.title} <br />
                                                <strong>Date:{screenshotData?.taken_time.split('T')[0]}</strong><br />
                                                <strong>Time:{showAmPmtime(screenshotData?.taken_time)}</strong>
                                              </p>
                                            </Card.Body>
                                          </Card>
                                        ));
                                      }

                                      // Handle videos tab
                                      if (screenshotTab === "Videos" && meta.meta_key === 'videos' && meta.meta_value.length > 0) {
                                        return meta.meta_value.map((videoData, j) => (
                                          <Card key={`video-card-${i}-${j}`}>
                                            <Card.Body onClick={() => handleLightBox('video', meta.meta_value, j)}>
                                              <video controls height="175px">
                                                <source src={videoData?.url} type="video/webm" />
                                                Your browser does not support the video tag.
                                              </video>
                                              <p>
                                                <strong>Task Name:</strong> {videoData.task_data?.title} <br />
                                                <strong>Date:{videoData?.start_time.split('T')[0]}</strong><br />
                                                <strong>Time:</strong> {videoData?.start_time} to {videoData?.end_time}
                                              </p>
                                            </Card.Body>
                                          </Card>
                                        ));
                                      }

                                      return null; // Return null if no condition is met
                                    })
                                  ) : (
                                    <div>No data available</div> // Display if no data is available
                                  )
                                }
                              </CardGroup>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </>
                      )
                    })
                  :
                  <p className="text-center mt-5">No activity available.</p>
              }
            </Accordion> 
            </div>
            </div>
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
              <h6 className="mb-2">09:00 AM - 10:00 AM</h6>
              <div className="shots--list">
                <CardGroup>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                </CardGroup>
              </div>
              <hr />
              <h6 className="mb-2">10:01 AM - 11:00 AM</h6>
              <div className="shots--list">
                <CardGroup>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot1.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                  <Card>
                    <Card.Body>
                      <img className="card-img-top" src="images/Screenshot2.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                      <p>create dynamic gallery, 09:30 AM</p>
                    </Card.Body>
                  </Card>
                </CardGroup>
              </div>
            </>
          )}
          {activeTab === "Videos" && (
            <div className="shots--list">
              <CardGroup>
                <Card>
                  <Card.Body>
                    <span className="video--icon"><FaPlay /></span>
                    <img className="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span className="video--icon"><FaPlay /></span>
                    <img className="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span className="video--icon"><FaPlay /></span>
                    <img className="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span className="video--icon"><FaPlay /></span>
                    <img className="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span className="video--icon"><FaPlay /></span>
                    <img className="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span className="video--icon"><FaPlay /></span>
                    <img className="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span className="video--icon"><FaPlay /></span>
                    <img className="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot1.png')} />
                    <p>create dynamic gallery, 09:30 AM</p>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Body>
                    <span className="video--icon"><FaPlay /></span>
                    <img className="card-img-top" src="images/Screenshot3.png" alt="Card image cap" onClick={() => handleLightBox('images/Screenshot2.png')} />
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