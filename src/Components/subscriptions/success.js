import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";

function SuccessPage() {
  const navigate = useNavigate()

  return (
    <>
        <div className="team--page subscription--page">
            <div className="page--wrapper px-md-2 pb-4 pt-4 py-5 pt-5 text-center h-100">
                <Container>
                    <h2 className="text-center mb-1">Success</h2>
                    <p className="text-center mb-4">Your subscription is successfully created.</p>
                    <Link to="/dashboard">Click Here to go Dashboard</Link>
                </Container>
            </div>
        </div>
    </>
  )
}

export default SuccessPage;
  