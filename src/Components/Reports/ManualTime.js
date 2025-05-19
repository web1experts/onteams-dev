import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  Modal,
  Dropdown,
  Accordion,
  ToggleButton,
  ButtonGroup
} from "react-bootstrap";
import {
  getMemberdata, convertSecondstoTime
} from "../../helpers/commonfunctions";
import {
  updateManualTimeStatus,
  getManualTimeList,
  getSingleActivityData
} from "../../redux/actions/report.action";
import { Listmembers } from "../../redux/actions/members.action";
import {
  ListProjectsByMembers,
  ListMemberProjects,
} from "../../redux/actions/project.action";
import { ListTasks } from "../../redux/actions/task.action";
import { currentMemberProfile } from "../../helpers/auth";

function ManualTime() {
  const dispatch = useDispatch();
  const memberProfile = currentMemberProfile();
  const memberdata = getMemberdata();
  const [fields, setFields] = useState({});
  const [loader, setLoader] = useState(false);
  const [show, setShow] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const handleClose = () => {
    setShow(false);
  };

  const reportState = useSelector((state) => state.reports);
  const [manualTimeList, setManualTimeList] = useState({})
  const [singleManualRecord, setSingleManualRecord] = useState([])
  const [activityStatus, setActivityStatus] = useState({})

  const handleManualTimeList = async () => {
    setSpinner(true)
    dispatch(getManualTimeList())
  }

  useEffect(() => {
    handleManualTimeList()
  }, [dispatch]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
   dispatch(updateManualTimeStatus({...fields, activityStatus}))
  };

  useEffect(() => {
    setLoader(false);setSpinner(false)
    if (reportState.success) {
      handleClose();
      handleManualTimeList()
    }

    if( reportState.manualTimeList && Object.keys(reportState.manualTimeList)?.length > 0){
      setManualTimeList(reportState.manualTimeList)
    }

    if( reportState.singleManualRecord && reportState.singleManualRecord?.length > 0){
      setSingleManualRecord( reportState.singleManualRecord)
    }
  }, [reportState]);

  
  const handleStatusChange = (id, duration, isChecked) => {
    setActivityStatus(prev => ({
      ...prev,
      [id]: {
        status: isChecked,
        duration: duration
      }
    }));
  };
  

  const handleView = async ( date, member_id ) => {
    setFields({ ...fields, date: date, memberId: member_id });
    setShow( true )
    setSpinner(true)
    dispatch(getSingleActivityData(date, member_id))
  }

  return (
    <>
      <div className="reports-section">
            
                <Accordion defaultActiveKey="0">
                  {Object.entries(manualTimeList).map(([date, members], index) => (
                    <Accordion.Item eventKey={index.toString()} key={date}>
                      <Accordion.Header>{date}</Accordion.Header>
                      <Accordion.Body>
                      <Table responsive="xl">
                        <thead>
                            <tr key="manaul-time-table-header">
                                <th scope="col" width='40%' key="project-name-header"><abbr>#</abbr> Member Name</th>
                                <th scope="col" width='20%' key="project-client-header" className="onHide">Time Added</th>
                                <th scope="col" width='20%' key="project-action-header" className="onHide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {members.map((member) => (
                          <tr key={`${member._id}--${date}`}>
                            <td>
                              <p> {member.name}</p>
                              </td>
                              <td>
                              <p>{convertSecondstoTime(member.totalDuration)} hrs</p>
                              </td>
                              <td>
                              <Button variant="primary" onClick={() => handleView(date, member._id)}>View</Button>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </Table>
                        
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
             
            </div>
      { show && 
        <Modal
          show={show}
          onHide={handleClose}
          centered
          size="lg"
          className="AddReportModal AddTimeModal"
          
        >
          <Modal.Header closeButton>
            <Modal.Title>
            {
              singleManualRecord?.length > 0 ?
              <p> Manual Time - {new Date(singleManualRecord[0]?.createdAt)?.toISOString()?.split('T')[0]}</p>
              :
              <p> Manual Time</p>
            }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
              {
                singleManualRecord?.length > 0 &&
                singleManualRecord.map(( record, index) => {
                  return (
                  <>
                <Row>
                  <Col sm={12} lg={6}>
                      <h5>Project: {record?.project?.title}</h5>
                  </Col>
                </Row>
                <hr />
                <Row className="mb-3">
                  <Col lg={12}>
                  {record?.tasks?.length > 0 && (
                    <Col sm={12} lg={12}>
                      <h5 className="text-center">Task Details</h5> <hr />
                    </Col>
                  )}
                  <table className="table">
                    <thead>
                      <th>Sr. No.</th>
                      <th>Task Name</th>
                      <th>Time</th>
                    </thead>
                    <tbody>
                {
                  record?.tasks?.map((taskData, index) => (
                      <tr>
                      <td>
                        {index + 1}
                      </td>
                      <td>{taskData?.task?.title}</td>
                      <td>
                        {convertSecondstoTime(taskData?.duration)} hrs
                      </td>
                      </tr>
                      
                  ))
                }
                </tbody>
                </table>
                </Col>
                </Row>
                <Row>
                  <Col md={12} className="text-end">
                  <ButtonGroup>
                    <ToggleButton
                      key={`approve-${record?._id}`}
                      id={`approve-${record?._id}`}
                      type="radio"
                      variant="outline-success"
                      name={`approval-${record?._id}`}
                      value="approved"
                      checked={activityStatus[record?._id]?.status === 'approved'}
                      onChange={(e) => {
                        handleStatusChange(record?._id, record.duration, 'approved');
                      }}
                    >
                      Approve
                    </ToggleButton>

                    <ToggleButton
                      key={`disapprove-${record?._id}`}
                      id={`disapprove-${record?._id}`}
                      type="radio"
                      variant="outline-danger"
                      name={`approval-${record?._id}`}
                      value="disapproved"
                      checked={activityStatus[record?._id]?.status === 'disapproved'}
                      onChange={(e) => {
                        handleStatusChange(record?._id, record.duration, 'disapproved');
                      }}
                    >
                      Disapprove
                    </ToggleButton>
                  </ButtonGroup>
                    {/* <Form.Group>
                      <Form.Label className='d-flex align-items-center'>
                      <Form.Check 
                        type="radio"
                        name={`approval-${record?._id}`} // ensure unique group name per record
                        className='form-check me-2'
                        onChange={(e) => handleStatusChange(record?._id, record.duration, e.target.checked ? 'approved' : '')}
                      />
                      Approve
                      </Form.Label>

                      <Form.Label className='d-flex align-items-center'>
                        <Form.Check 
                          type="radio"
                          name={`approval-${record?._id}`}
                          className='form-check me-2'
                          onChange={(e) => handleStatusChange(record?._id, record.duration, e.target.checked ? 'disapproved' : '')}
                        />
                        Disapprove
                      </Form.Label>
                    </Form.Group> */}
                  </Col>
                </Row>
              </>)
              })
            }
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={handleReportSubmit}
              disabled={loader}
            >
              {loader === true ? "Please wait..." : "Submit"}
            </Button>
          </Modal.Footer>
        </Modal>
      }
    </>
  );
}

export default ManualTime;
