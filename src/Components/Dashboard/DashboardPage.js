import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Col, Row, Card, Button, Alert, ListGroup } from "react-bootstrap";
import { HiOutlineUsers } from "react-icons/hi2";
import { GoProjectTemplate } from "react-icons/go";
import { GoTasklist } from "react-icons/go";
import {
  acceptCompanyinvite,
  listCompanyinvite,
  deleteInvite,
  resendInvite,
} from "../../redux/actions/members.action";
import { Link } from "react-router-dom";

function DashboardPage() {
  const dispatch = useDispatch()
  const memberstate = useSelector((state) => state.member);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const apiResult = useSelector((state) => state.member);
  const [invitationsFeeds, setInvitationsFeed] = useState([]);

  const handleInvitationList = async () => {
    await dispatch(
      listCompanyinvite()
    );
  };

  useEffect(() => {
    const check = ["undefined", undefined, "null", null, ""];

    if (invitationsFeed && invitationsFeed.inviteData) {
      setInvitationsFeed(invitationsFeed.inviteData);
    }
  }, [invitationsFeed]);

  const acceptInvite = (token) => {
    dispatch(acceptCompanyinvite({ token: token }));
  };

  const rejectInvite = (inviteId) => {
    dispatch(deleteInvite(inviteId));
  };

  useEffect(() => {
    
    if (memberstate.invite) {
      handleInvitationList();
    }
  }, [memberstate]);

  useEffect(() => {
    handleInvitationList()
  },[ ])

  return (
    <>
      <div className='team--page dashboard--page'>
        <div className='page--wrapper p-md-3 py-3 pt-5 mt-3 text-center'>
          <Container fluid>
            <ListGroup className="invitation--list">
              {invitationsFeeds && invitationsFeeds.length > 0 &&
                    invitationsFeeds.map((invitation, index) => {
                      return (
                        <>
                        <ListGroup.Item>
                            <p className="mb-0">You got an invitation from <strong>{invitation.company?.name}</strong> to join their team as a &nbsp;<strong>{invitation.role?.name?.replace(/\b\w/g,
                              function (char) {
                                return char.toUpperCase();
                              }
                            )}
                            </strong></p>
                            <div className="ms-lg-auto mt-3 mt-lg-0">
                              <Button onClick={() => rejectInvite(invitation._id)} className="me-2" variant="outline-primary">
                              Decline
                              </Button>
                              <Button onClick={() => acceptInvite(invitation.inviteToken)} variant="primary">
                                Accept
                              </Button>
                            </div>
                        </ListGroup.Item>
                    </>
                      )
                })
              }
            </ListGroup>
            <img className="mb-5" src="images/dashboard.png" alt="..." />
            <h2>Welcome to OnTeams</h2>
            <div className="btn--group">
              <Button type="button" variant="primary">
                <a href='/downloads/onteams-win32-ia32.zip' download>Onteams Desktop App For Windows</a>
              </Button>
              <Button type="button" variant="outline-primary">
                <a href='/downloads/onteams-darwin-x64.zip' download>Onteams Desktop App For Mac OS</a>
              </Button>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;