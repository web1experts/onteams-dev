import React, { useEffect, useState } from "react";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { acceptCompanyinvite } from "../../redux/actions/members.action";
import { getloggedInUser, encryptJsonData } from "../../helpers/auth";
import LoginPage from "../Auth/LoginPage";
function Invite() {
  const memberstate = useSelector((state) => state.member);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const auth = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const loggedInUser = getloggedInUser();
  const queryParams = new URLSearchParams(location.search);
  const paramsObject = {};
  queryParams.forEach((value, key) => {
    paramsObject[key] = value;
  });
  let currentUser = getloggedInUser();

  useEffect(() => {
    if (auth.token) {
      currentUser = getloggedInUser();
    }
  }, [auth]);

  const handleclick = (e) => {
    setLoading(true);
    dispatch(acceptCompanyinvite({ token: token }));
  };

  useEffect(() => {
    if (memberstate) {
      setLoading(false);
    }

    if (memberstate.invite) {
      setTimeout(function () {
        navigate("/dashboard");
      }, 1500);
    }
  }, [memberstate]);
  return (
    <>
      {!currentUser ? (
        <LoginPage />
      ) : (
        <section className="main--login">
          <Container fluid className="h-100">
            <Row className="h-100">
              <Col sm={12} lg={6} className="px-0 d-none d-lg-block">
                <div className="login--image">
                  <img src="../images/login-bg.jpg" alt="..." />
                </div>
              </Col>
              <Col sm={12} lg={6} className="px-0">
                <div className="common--form">
                  <img
                    className="logo--sm"
                    src="../images/OnTeam-Logo.png"
                    alt="MyTeams"
                  />
                  <h6>
                    {paramsObject["company_name"]} has invited you to join.{" "}
                  </h6>

                  {loggedInUser && Object.keys(loggedInUser).length > 0 && (
                    <p className="paragraph text-center ">
                      Logged in as {loggedInUser?.name}
                    </p>
                  )}

                  <div className="">
                    <Button variant="primary" onClick={handleclick}>
                      <span style={{ cursor: "pointer" }}>
                        {loading ? "Please Wait..." : "Accept Invite"}
                      </span>
                    </Button>
                  </div>
                  <p>
                    <span>OR</span>
                  </p>
                  <p>
                    <Link to="/dashboard">Go to dashboard</Link>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </>
  );
}
export default Invite;
