import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Dropdown, Row, Col, Button, Modal, Form, FloatingLabel, Card, ListGroup, Table } from "react-bootstrap";
import { FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  acceptCompanyinvite,
  listCompanyinvite,
  deleteInvite,
  resendInvite,
} from "../../redux/actions/members.action";
import { MdOutlineClose, MdSearch } from "react-icons/md";
import Spinner from 'react-bootstrap/Spinner';
function Invitation(props) {

  const [isActive, setIsActive] = useState(0);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const memberstate = useSelector((state) => state.member);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const apiResult = useSelector((state) => state.member);
  const [invitationsFeeds, setInvitationsFeed] = useState([]);
  const [total, setTotal] = useState(0);
  const [showloader, setShowloader] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInvitationList = async () => {
    if( props.activeTab === "Invitees"){
      setInvitationsFeed([])
      
      await dispatch(
        listCompanyinvite(currentPage, props.listfor, props.searchTerm)
      );
      setShowloader(false);
    }
  };

  // useEffect(() => {
  //   if (props.searchTerm) {
  //     handleInvitationList()
  //   }
  // }, [props.searchTerm]);

  useEffect(() => {
    if (currentPage !== "") {
      setShowloader(true);
      handleInvitationList()
    }
  }, [currentPage, props.searchTerm]);

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

  const handleTableToggle = (invitation) => {
    setSelectedInvitation(invitation);
    if (!isActive) {
      setIsActive(true);
    }
    if( props.toggleActive){
      props.toggleActive(true)
    }
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
      setLoading(false);
    }
    if (memberstate.invite) {
      handleInvitationList();
    }
  }, [memberstate]);
  return (
    <>
    <div className={isActive ? 'view--invitee team--page' : 'team--page'}>
    {props.topbar()}
    <div className="page--wrapper p-md-3 py-3">
    {
        showloader &&
        <div class="loading-bar">
            <img src="images/OnTeam-icon-gray.png" className="flipchar" />
        </div>
    }
    <Container fluid className={isActive ? 'px-0' : ''}>
      {props.activeTab === "Invitees" && (
         
        <>
            <Table responsive="lg" className={props.activeSubTab === 1 ? 'project--grid--table clients--grid--table' : props.activeSubTab === 2 ? 'project--table clients--table' : 'project--table clients--table'}>
              <thead>
                <tr>
                  <th>#</th>
                  <th className="onHide">Role</th>
                  <th>Email Address</th>
                  <th className="onHide">Action</th>
                </tr>
              </thead>
              <tbody>
                {invitationsFeeds && invitationsFeeds.length > 0 ? (
                  invitationsFeeds.map((invitation, index) => {
                    return (
                      <>
                        <tr key={`member-table-row-${index}`} className={invitation._id === selectedInvitation?._id ? 'project--active' : ''}  onClick={isActive ? () => handleTableToggle(invitation) : () => { return false; }}>
                          <td>{index + 1}</td>
                          <td className="onHide">
                            <span className="onHide">
                              <img variant="top" src="./images/default.jpg" />
                            </span>
                            {invitation.role?.name?.replace(
                              /\b\w/g,
                              function (char) {
                                return char.toUpperCase();
                              }
                            )}
                          </td>
                          <td>{invitation.email}</td>
                          <td className="onHide">
                            <Button variant="primary" onClick={()=>{ handleTableToggle(invitation); setIsActive(true)}}>View</Button>
                          </td>
                          
                        </tr>
                      </>
                    );
                  })
                ) :
                  !showloader && invitationsFeeds && invitationsFeeds.length === 0 &&
                    
                      <tr>
                        <td colSpan={4}>
                          <h2 className="mt-2 text-center">
                            There are no invitations.
                          </h2>
                        </td>
                      </tr>
                    }
              </tbody>
            </Table>
        </>
      )}
      </Container>
              </div>
              </div>
<div className="details--invitee--view">
        <div className="wrapper--title">
          <h3>Member Details</h3>
          <ListGroup horizontal>
            <ListGroup.Item onClick={() => {if( props.toggleActive){
      props.toggleActive(false )
    }setIsActive(0)}}>
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>
        <div className="rounded--box">
          <Card>
            <div className="card--img">
              <Card.Img variant="top" src={selectedInvitation?.avatar ?? "./images/default.jpg"} />
            </div>
            <Card.Body>
              <Card.Title>Member Information</Card.Title>
              <Card.Text>
                <ListGroup>
                  <ListGroup.Item>
                    <strong>Email</strong> {selectedInvitation?.email}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Role</strong> Team Lead
                  </ListGroup.Item>
                </ListGroup>
              </Card.Text>
              <div className="text-end mt-3">
                <Button variant="danger" onClick={() => rejectInvite(selectedInvitation?._id)}>{props.listfor && props.listfor === "company" ? "Delete" : "Decline"}</Button>
                {props.listfor &&
                    props.listfor === "company" ? (
                      <>
                        <Button variant="primary" className="ms-3" onClick={() => sentInviteAgain(selectedInvitation?._id)}>Send Again</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="primary" className="ms-3" onClick={() => acceptInvite(selectedInvitation?.inviteToken)}>Accept</Button>
                      </>
                    )
                }
                
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      </>
  );
}

export default Invitation;
