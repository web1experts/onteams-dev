import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  FloatingLabel,
  Card,
  Tabs,
  Tab,
  ListGroup,
  Table,
  Dropdown,
} from "react-bootstrap";
import {
  FaEllipsisV,
  FaList,
  FaPlus,
  FaRegEdit,
  FaRegSave,
  FaRegTrashAlt,
} from "react-icons/fa";
import SidebarPanel from "../Sidebar/Sidebar";
import { BsGrid } from "react-icons/bs";
import { MdOutlineClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  acceptCompanyinvite,
  listCompanyinvite,
  deleteInvite,
  resendInvite,
} from "../../redux/actions/members.action";
import Spinner from 'react-bootstrap/Spinner';
function InvitationList(props) {
  const [activeSubTab, setActiveSubTab] = useState("Grid");
  const [isActive, setIsActive] = useState(false);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const memberstate = useSelector((state) => state.member);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const apiResult = useSelector((state) => state.member);
  const [invitationsFeeds, setInvitationsFeed] = useState([]);
  const [searchTerm, setsearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [showloader, setShowloader] = useState(false);

  const handleInvitationList = async () => {
    setInvitationsFeed([])
    setShowloader(true);
    await dispatch(
      listCompanyinvite(currentPage, props.listfor, props.searchTerm)
    );
    setShowloader(false);
  };

  useEffect( () => {
    if (props.searchTerm) {
      handleInvitationList()
      // await dispatch(listCompanyinvite(currentPage, props.listfor, props.searchTerm));
      // setShowloader(false);
    }
  }, [props.searchTerm]);

  useEffect(() => {
    if (currentPage !== "") {
      handleInvitationList()
      // dispatch(listCompanyinvite(currentPage, props.listfor));
      // setShowloader(false);
    }
  }, [currentPage]);

  useEffect(() => {
    const check = ["undefined", undefined, "null", null, ""];

    if (invitationsFeed && invitationsFeed.inviteData) {
      setInvitationsFeed(invitationsFeed.inviteData);
      setTotal(invitationsFeed.total);
    }
  }, [invitationsFeed]);

  const handlepaginationlabel = (from, to, count) => {
    return `Showing ${from}–${to} of ${count !== -1 ? count : ` ${to}`}`;
  };

  const acceptInvite = (token) => {
    dispatch(acceptCompanyinvite({ token: token }));
  };

  const rejectInvite = (inviteId) => {
    dispatch(deleteInvite(inviteId));
  };

  const sentInviteAgain = (inviteId) => {
    dispatch(resendInvite({ id: inviteId }));
  };

  useEffect(() => {
    if (memberstate) {
    }
    if (memberstate.invite) {
      handleInvitationList();
    }
  }, [memberstate]);

  return (
    <>
      
        <div className={isActive ? "show--details team--page" : "team--page"}>
          <div className= "page--title p-md-3 py-3 pb-0">
          <Container fluid>
              <Row>
                <Col sm={isActive ? 12 : 5}>
                  <h2>Invitations</h2>
                </Col>
              </Row>
            </Container>
          </div>
          <div className="page--wrapper p-md-3 py-3">
          {
              showloader &&
              <div class="loading-bar">
                  <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
          }
            <Container fluid>
              <Tabs activeKey={activeSubTab} onSelect={(k) => setActiveSubTab(k)}>
                <Tab
                  eventKey="Grid"
                  title={
                    <span>
                      <BsGrid />
                    </span>
                  }
                >
                  <Row xs={1} md={3} lg={4} className="g-4">
                    {!showloader && invitationsFeeds && invitationsFeeds.length > 0 ? (
                      invitationsFeeds.map((invitation, index) => {
                        return (
                          <>
                            <Col key={index}>
                              <Card className="team--Cards">
                                <Dropdown>
                                  <Dropdown.Toggle variant="primary">
                                    <FaEllipsisV />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    {props.listfor && props.listfor === "company" ? (
                                      <>
                                        <Dropdown.Item
                                          onClick={() =>
                                            sentInviteAgain(invitation._id)
                                          }
                                        >
                                          Send Again
                                        </Dropdown.Item>
                                      </>
                                    ) : (
                                      <>
                                        <Dropdown.Item
                                          onClick={() =>
                                            acceptInvite(invitation.inviteToken)
                                          }
                                        >
                                          Accept
                                        </Dropdown.Item>
                                      </>
                                    )}
                                    <Dropdown.Item
                                      onClick={() => rejectInvite(invitation._id)}
                                    >
                                      {props.listfor && props.listfor === "company" ? 'Delete' : 'Decline' }
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                                <Card.Img variant="top" src="./images/default.jpg" />
                                <Card.Body>
                                  {/* <Card.Title>Michael Jordan</Card.Title> */}
                                  <Card.Text className="text-uppercase">
                                    {invitation.role?.name?.replace(
                                      /\b\w/g,
                                      function (char) {
                                        return char.toUpperCase();
                                      }
                                    )}
                                  </Card.Text>
                                  <Card.Text className="text-muted">
                                    {invitation.email}
                                  </Card.Text>
                                </Card.Body>
                              </Card>
                            </Col>
                          </>
                        );
                      })
                    ) 
                    
                    
                    :(
                      <h2 className="mt-5 w-100 p-3 bg-light text-center">
                        There are no invitations.
                      </h2>
                    )}
                  </Row>
                </Tab>
                <Tab
                  eventKey="List"
                  title={
                    <span>
                      <FaList />
                    </span>
                  }
                >
                  <Table responsive="lg">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Email Address</th>
                        <th>Role</th>
                        <th width={30}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitationsFeeds && invitationsFeeds.length > 0 ? (
                        invitationsFeeds.map((invitation, index) => {
                          return (
                            <>
                              <tr>
                                <td>{index+1}</td>
                                <td>{invitation.email}</td>
                                <td width="33%">
                                  {invitation.role?.name?.replace(
                                    /\b\w/g,
                                    function (char) {
                                      return char.toUpperCase();
                                    }
                                  )}
                                </td>
                                <td>
                                  <Dropdown>
                                    <Dropdown.Toggle variant="primary">
                                      <FaEllipsisV />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      {props.listfor &&
                                      props.listfor === "company" ? (
                                        <>
                                          <Dropdown.Item
                                            onClick={() =>
                                              sentInviteAgain(invitation._id)
                                            }
                                          >
                                            Send Again
                                          </Dropdown.Item>
                                        </>
                                      ) : (
                                        <>
                                          <Dropdown.Item
                                            onClick={() =>
                                              acceptInvite(invitation.inviteToken)
                                            }
                                          >
                                            Accept
                                          </Dropdown.Item>
                                        </>
                                      )}
                                      <Dropdown.Item
                                        onClick={() => rejectInvite(invitation._id)}
                                      >
                                        {props.listfor && props.listfor === "company" ? 'Delete' : 'Decline' }
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </td>
                              </tr>
                            </>
                          );
                        })
                      ) :  
                      showloader ? 
                      <div className="text-center"><Spinner animation="border" variant="primary" /></div>
                      : (
                        <tr>
                          <td colSpan={4}>
                            <h2 className="mt-2 text-center">
                              There are no invitations.
                            </h2>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Tab>
              </Tabs>
            </Container>
          </div>
        </div>
    </>
  );
}

export default InvitationList;
