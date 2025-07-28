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
  ButtonGroup,
} from "react-bootstrap";
import { FaRegListAlt } from "react-icons/fa";
import { FiCalendar, FiCheckCircle } from "react-icons/fi";
import { AiOutlineCloseCircle } from "react-icons/ai";
import {
  getMemberdata,
  showAmPmtime,
  generateTimeRange,
  convertSecondstoTime,
  timeStringToDate,
} from "../../helpers/commonfunctions";
import {
  updateManualTimeStatus,
  getManualTimeList,
  getSingleActivityData,
} from "../../redux/actions/report.action";
import { Listmembers } from "../../redux/actions/members.action";
import {
  ListProjectsByMembers,
  ListMemberProjects,
} from "../../redux/actions/project.action";
import { ListTasks } from "../../redux/actions/task.action";
import { currentMemberProfile } from "../../helpers/auth";
import { LuClock } from "react-icons/lu";

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
  const [manualTimeList, setManualTimeList] = useState({});
  const [singleManualRecord, setSingleManualRecord] = useState([]);
  // const [activityStatus, setActivityStatus] = useState({});

  const handleManualTimeList = async () => {
    setSpinner(true);
    dispatch(getManualTimeList());
  };

  useEffect(() => {
    handleManualTimeList();
  }, [dispatch]);

  const handleReportSubmit = async (status,date, memberId, data) => {
    let activityStatus = {}
    for(const activity of data){
      activityStatus[activity?._id] = {}
      activityStatus[activity?._id] = {
        status: status,
        duration: activity.duration,
      }
    } 
    console.log("activityStatus:: ", activityStatus)
    dispatch(updateManualTimeStatus({
      date: date,
      memberId: memberId,
      activityStatus: activityStatus
    }));

  };

  useEffect(() => {
    setLoader(false);
    setSpinner(false);
    if (reportState.success) {
      handleClose();
      handleManualTimeList();
    }

    if (
      reportState.manualTimeList &&
      Object.keys(reportState.manualTimeList)?.length > 0
    ) {
      setManualTimeList(reportState.manualTimeList);
    }

    if (
      reportState.singleManualRecord &&
      reportState.singleManualRecord?.length > 0
    ) {
      setSingleManualRecord(reportState.singleManualRecord);
    }
  }, [reportState]);

  // const handleStatusChange = (id, duration, isChecked) => {
  //   setActivityStatus((prev) => ({
  //     ...prev,
  //     [id]: {
  //       status: isChecked,
  //       duration: duration,
  //     },
  //   }));
  // };

  function calculateManualTotalTime(data) {
    let totalSeconds = 0;
    if(data?.length  === 0){
      return `00:00`;
    }

    for (const project of data) {
      if(project?.activities && project?.activities.length > 0){
        for(const activity of project?.activities){
          totalSeconds += activity?.duration;
        }
      }
    }
    // If the total time is less than 60 seconds, return the number of seconds
    if (totalSeconds === 0) {
      return `00:00`;
    } else if (totalSeconds < 60) {
      return `${totalSeconds} seconds`;
    }

    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");

    return `${hours}h ${minutes}m`;
  }

  const handleView = async (date, member_id) => {
    setFields({ ...fields, date: date, memberId: member_id });
    setShow(true);
    setSpinner(true);
    dispatch(getSingleActivityData(date, member_id));
  };

  return (
    <>
      {Object.entries(manualTimeList).map(([date, members], index) => {
        return (
          <>
            {members.map((member) => (
              <div className="reports-section">
                <div className="reports--heading">
                  <div className="d-flex align-items-center gap-3 justify-content-between">
                    <div className="mb-0 d-flex align-items-center gap-3">
                      <div className="title--initial">
                        {member?.name?.charAt(0)}
                      </div>
                      <div className="title--span flex-column d-flex align-items-start gap-0">
                        <span>{member?.name}</span>
                        <strong>{member?.role}</strong>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 gap-xl-4 mt-3 mt-xl-0 text-sm">
                      <div className="text-end">
                        <div className="text-lg font-bold text--blue">{calculateManualTotalTime(member.projects)}</div>
                        <div className="text-slate-600">
                          Submitted{" "}
                          {new Date(date).toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {member.projects?.length > 0 &&
                  member.projects.map((project) => (
                    <div className="single--project--stack" key={project._id}>
                      <h4 className="d-flex flex-column gap-3">
                        <strong className="d-flex align-items-center gap-2">
                          <span>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-building2 w-4 h-4 text-blue-600"
                            >
                              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                              <path d="M10 6h4"></path>
                              <path d="M10 10h4"></path>
                              <path d="M10 14h4"></path>
                              <path d="M10 18h4"></path>
                            </svg>
                          </span>
                          {project.title}
                        </strong>

                        {project.activities?.length > 0 &&
                          project.activities.map(
                            (activity) =>
                              activity.tasks?.length > 0 &&
                              activity.tasks.map((taskdata, taskIndex) => (
                                <p key={`${activity._id}-${taskIndex}`} className="d-flex align-items-center justify-content-between gap-2 bg-light px-3 py-2 border rounded-3 mb-0">
                                  <strong className="d-flex align-items-center gap-2">
                                    <FaRegListAlt /> {taskdata?.task?.title}
                                  </strong>
                                  <small>
                                    <LuClock />{" "}
                                      {generateTimeRange(
                                        activity?.createdAt,
                                        activity?.duration
                                      )}
                                  </small>
                                </p>
                              ))
                          )}
                      </h4>
                      <div className="btns--set">
                        <Button variant="primary" onClick={() => {handleReportSubmit('approved', date, member?._id, project.activities)}}>
                          <FiCheckCircle className="me-1"  /> Approve
                        </Button>
                        <Button variant="danger" onClick={() => {handleReportSubmit('disapproved', date, member?._id, project.activities)}} >
                          <AiOutlineCloseCircle className="me-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </>
        );
      })}
      <div className="reports-section">
        <div className="reports--heading">
          <div className="d-flex align-items-center gap-3 justify-content-between">
            <div className="mb-0 d-flex align-items-center gap-3">
              <div className="title--initial">G</div>
              <div className="title--span flex-column d-flex align-items-start gap-0">
                <span>Gagandeep Singh</span>
                <strong>Project Manager</strong>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 gap-xl-4 mt-3 mt-xl-0 text-sm">
              <div className="text-end">
                <div className="text-lg font-bold text--blue">8h</div>
                <div className="text-slate-600">Submitted July 16, 4:00 PM</div>
              </div>
            </div>
          </div>
        </div>
        <div className="single--project--stack">
          <div className="d-flex align-items-center justify-content-between gap-4">
            <h4 className="d-flex flex-column gap-3">
              <strong>
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-building2 w-4 h-4 text-blue-600"
                  >
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                    <path d="M10 6h4"></path>
                    <path d="M10 10h4"></path>
                    <path d="M10 14h4"></path>
                    <path d="M10 18h4"></path>
                  </svg>
                </span>
                Icecat & Reviews App
              </strong>
              <p>
                <small className="d-flex align-items-center gap-2">
                  <FaRegListAlt /> Designing Icecat App
                </small>
              </p>
            </h4>
            <p>
              <strong>
                <FiCalendar /> Monday, July 15,2025
              </strong>
              <small className="d-flex mt-2 flex-column gap-0">
                09:00 - 17:00 <span>8 Hours</span>
              </small>
            </p>
          </div>
          <div className="btns--set">
            <Button variant="primary">
              <FiCheckCircle className="me-1" /> Approve
            </Button>
            <Button variant="danger">
              <AiOutlineCloseCircle className="me-1" /> Reject
            </Button>
          </div>
        </div>
      </div>
      {show && (
        <Modal
          show={show}
          onHide={handleClose}
          centered
          size="lg"
          className="AddReportModal AddTimeModal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {singleManualRecord?.length > 0 ? (
                <p>
                  {" "}
                  Manual Time -{" "}
                  {
                    new Date(singleManualRecord[0]?.createdAt)
                      ?.toISOString()
                      ?.split("T")[0]
                  }
                </p>
              ) : (
                <p> Manual Time</p>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {singleManualRecord?.length > 0 &&
              singleManualRecord.map((record, index) => {
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
                            {record?.tasks?.map((taskData, index) => (
                              <tr>
                                <td>{index + 1}</td>
                                <td>{taskData?.task?.title}</td>
                                <td>
                                  {convertSecondstoTime(taskData?.duration)} hrs
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12} className="text-end">
                       
                      </Col>
                    </Row>
                  </>
                );
              })}
          </Modal.Body>
          
        </Modal>
      )}
    </>
  );
}

export default ManualTime;
