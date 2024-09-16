import React from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Link } from "react-router-dom";
import WorkspaceForm from "../workspaces/workspaceform";
function WorkspaceSetup() {

    return (
            <Container fluid className="h-100">
                <Row className="h-100">
                    <Col sm={12} lg={6} className="px-0 d-none d-lg-block">
                        <div className="login--image">
                            <img src="../images/login-bg.jpg" alt="..." />
                        </div>
                    </Col>
                    <Col sm={12} lg={6} className="px-0">
                        <div className="common--form">
                            <img className="logo--sm" src="../images/OnTeam-Logo.png" alt="MyTeams" />
                            <WorkspaceForm />
                        </div>
                    </Col>
                </Row>
            </Container>
    );
}

export default WorkspaceSetup;