import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegCheckCircle } from "react-icons/fa";
import { Container } from "react-bootstrap";

function SuccessPage() {
  const navigate = useNavigate()

  return (
    <>
        <div className="team--page subscription--page success--page">
            <div className="page--wrapper px-md-2 pb-4 pt-4 py-5 pt-5 text-center h-100">
                <Container>
                    <span className="circle--check"><FaRegCheckCircle /></span>
                    <h2 className="text-center mb-1">Welcome to Prime Teams!</h2>
                    <p className="text-center mb-4">Your payment has been processed successfully and your subscription is now active.</p>
                    <Link className="btn btn-primary" to="/dashboard">Go toDashboard</Link>
                </Container>
            </div>
        </div>
    </>
  )
}

export default SuccessPage;
  