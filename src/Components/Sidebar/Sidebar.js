import React, { useState, useEffect } from "react";
import { Navbar, Nav, Dropdown, Modal, Button, Tabs, Tab } from "react-bootstrap";
import { LuLayoutDashboard, LuTimer } from "react-icons/lu";
import { RxDashboard } from "react-icons/rx";
import { AiOutlineTeam } from "react-icons/ai";
import { GrGroup } from "react-icons/gr";
import { HiUserPlus } from "react-icons/hi2";
import { TbFileInvoice, TbReport } from "react-icons/tb";
import { BsCalendar2Week, BsRecord2 } from "react-icons/bs";
import { CgCalendarDates, CgFileDocument, CgNotes } from "react-icons/cg";
import { BiChat, BiScreenshot } from "react-icons/bi";
import { RiCamera3Line, RiLockPasswordLine, RiSettingsLine } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";
import { FaMicrophone } from "react-icons/fa";
import { MdOutlineManageAccounts } from "react-icons/md";
import { getloggedInUser, decryptJsonData, encryptJsonData, currentMemberProfile} from '../../helpers/auth';
import { useDispatch, useSelector } from "react-redux";
import { setAuthorization } from '../../helpers/api';
import { Link, useLocation } from "react-router-dom";
import { transformString, parseIfValidJSON, getMemberdata } from '../../helpers/commonfunctions';
import { logout } from '../../redux/actions/auth.actions';

function SidebarPanel() {
    const secretKey = process.env.REACT_APP_SECRET_KEY
    const dispatch = useDispatch()
    const { currentMember } = useSelector(state => state.member);
    const updateDashboard = useSelector( state => state.workspace.updateDashboard)
    const workspacestate = useSelector( state => state.workspace)
    const authstate = useSelector( state => state.auth)
    const memberdata = getMemberdata()
    const [show, setShow] = useState(false);
    const captureClose = () => setShow(false);
    const captureShow = () => setShow(true);
    const currentLoggedUser = getloggedInUser();
    const memberProfile = currentMemberProfile()
    const location = useLocation();
    let companyname = ''
    const [companies, setCompanies ] = useState([])

    const [showDropdown, setShowDropdown] = useState(false);

    const handleToggle = (isOpen) => {
        setShowDropdown(isOpen);
    };

    const handleItemClick = (companyId) => {
        handleClick(companyId);
        setShowDropdown(false);
    };
    
    const encryptedCompany = localStorage.getItem('current_dashboard');
    if (encryptedCompany && encryptedCompany !== "") {
        const decryptedCompany = parseIfValidJSON(encryptedCompany);
        companyname = (decryptedCompany) ? decryptedCompany.name : ''
    }

    function refreshWorskspacelist(){
        const encryptedCompanies = localStorage.getItem('mt_dashboards');
        
        if (encryptedCompanies !== null) {
            const decryptcompanies = parseIfValidJSON(encryptedCompanies)
            console.log('decryptcompanies: ', decryptcompanies)
            setCompanies(decryptcompanies ? decryptcompanies : [] )
        }
    }
    useEffect(() => {
        refreshWorskspacelist()
    },[])

    useEffect(() => {
        if( updateDashboard ){
            refreshWorskspacelist()
        }
     
    }, [updateDashboard])

    useEffect(() => {
        if( authstate.userCompanies ){
            setTimeout(function(){
                refreshWorskspacelist()
            },200)
        }
    }, [authstate])

    useEffect(() => {
        if( workspacestate.success ){
            setTimeout(function(){
                refreshWorskspacelist()
            },500)
            
        }
    }, [workspacestate])

    

    const onChange = (selectedvalue) => {
        const selected = companies.find(company => company.company._id === selectedvalue);
        localStorage.setItem('current_dashboard', JSON.stringify({ name: selected.company.name, id: selected.company._id }));
        localStorage.setItem('mt_featureSwitches', JSON.stringify(selected?.memberData || null))
        // setAuthorization()
        setTimeout(function () {
            window.location.reload();
        }, 1000)
    }

    const handleClick = (selectedvalue) => {
        const selected = companies.find(company => company.company._id === selectedvalue);
        localStorage.setItem('current_dashboard', JSON.stringify({name: selected.company.name, id: selected.company._id}));
        localStorage.setItem('mt_featureSwitches', JSON.stringify(selected?.memberData || null))
        // setAuthorization()
        setTimeout(function(){
            window.location.reload();
        }, 1000)
    }

    const [isActive, setIsActive] = useState(false);

    const handleToggler = event => {
        setIsActive(current => !current);
    };

    return (
        <>
            <div className={isActive ? 'open--panel--sidebar panel--sidebar' : 'panel--sidebar'}>
                <Navbar expand="lg">
                    <Navbar.Brand>
                        <Dropdown show={showDropdown} onToggle={handleToggle}>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic">{companyname !== "" ? transformString(companyname) : transformString(currentLoggedUser?.name)}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <div className="menu--scroll">
                                    <div className="user--info">
                                        <img src={ currentLoggedUser?.avatar || "images/default.jpg"} alt="..." />
                                        <h4>{memberProfile?.name} <small>{memberProfile?.role?.name}</small></h4>
                                    </div>
                                    {
                                        companies.length > 1 &&
                                        <>
                                            {companies.map((companyobj, index) => {
                                                if (companyobj.company && companyobj.company.name) {
                                                    return (
                                                        <Dropdown.Item key={`copmany-${companyobj.company._id}-${companyobj.company?.name}`} onClick={() => handleClick(companyobj.company._id)}><span className="initial--name">{companyobj.company.name !== "" ? transformString(companyobj.company.name) : transformString(currentLoggedUser?.name)}</span> {companyobj.company?.name}</Dropdown.Item>
                                                    )
                                                }
                                            })}
                                        </>
                                    }
                                    <Link className="dropdown-item" to="/workspace" onClick={() => setShowDropdown(false)}><MdOutlineManageAccounts /> Manage Workspace</Link>
                                    <Link className="dropdown-item" to="/setting" onClick={() => setShowDropdown(false)}><RiSettingsLine /> Settings</Link>
                                    <Dropdown.Item key="logout-btn" onClick={(event) => dispatch(logout())}><FiLogOut /> Logout</Dropdown.Item>
                                </div>
                            </Dropdown.Menu>
                        </Dropdown>

                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-flex d-lg-none" onClick={handleToggler} />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav>
                            <Link key="dashboard-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard"><span className="nav--item--icon"><LuLayoutDashboard /></span> Dashboard</Link>
                            {
                                memberdata && memberdata.role?.permissions && memberdata.role?.permissions.projects && memberdata.role?.permissions.projects !== 'none' &&
                                <Link key="project-menu" onClick={handleToggler}  className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`} to="/projects"><span className="nav--item--icon"><RxDashboard /></span> Projects</Link>
                            }
                            {
                                memberdata && memberdata.role?.permissions && memberdata.role?.permissions.clients && memberdata.role?.permissions.clients !== 'none' &&
                                <Link  key="client-menu" onClick={handleToggler}  className={`nav-link ${location.pathname === '/clients' ? 'active' : ''}`} to="/clients"><span className="nav--item--icon"><GrGroup /></span> Clients</Link>
                            }
                            {
                                memberdata && memberdata.role?.permissions && memberdata.role?.permissions.members && memberdata.role?.permissions.members !== 'none' &&
                                <Link  key="members-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/team-members' ? 'active' : ''}`} to="/team-members"><span className="nav--item--icon"><AiOutlineTeam /></span> Team Members</Link>
                            }

                            <Link  key="tracking-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/time-tracking' ? 'active' : ''}`} to="/time-tracking"><span className="nav--item--icon"><LuTimer /></span> Time Tracking</Link>
                            {/* <Link  key="invite-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/invitations' ? 'active' : ''}`} to="/invitations"><span className="nav--item--icon"><HiUserPlus /></span> Invitations</Link> */}
                            <Link  key="reports-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`} to="/reports"><span className="nav--item--icon"><TbReport /></span> Reports</Link>
                            <Link  key="holidays-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/holidays' ? 'active' : ''}`} to="/holidays"><span className="nav--item--icon"><BsCalendar2Week /></span> Holidays</Link>
                            <Link  key="attendance-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`} to="/attendance"><span className="nav--item--icon"><CgCalendarDates /></span> Attendance</Link>
                            {/* <Link  key="docs-menu" onClick={handleToggler} className="nav-link" to="/"><span className="nav--item--icon"><CgFileDocument /></span> Docs</Link> */}
                            {/* <Link  key="chats-menu" onClick={handleToggler} className="nav-link" to="/"><span className="nav--item--icon"><BiChat /></span> Chats</Link> */}
                            {/* <Link  key="notes-menu" onClick={handleToggler} className="nav-link" to="/"><span className="nav--item--icon"><CgNotes /></span> Notes</Link> */}
                            <Link  key="invoice-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/invoice' ? 'active' : ''}`} to="/invoice"><span className="nav--item--icon"><TbFileInvoice /></span> Invoice</Link>
                            {/* <Link  key="password-menu" onClick={handleToggler} className="nav-link" to="/"><span className="nav--item--icon"><RiLockPasswordLine /></span> Password Manager</Link> */}
                            {/* <Nav.Link href="#"><span className="nav--item--icon"><RiSettingsLine /></span> Setting</Nav.Link>
                            <Nav.Link href="#"><span className="nav--item--icon"><FiLogOut /></span> Logout</Nav.Link> */}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Button variant="primary" className="screen--record" onClick={captureShow}>REC</Button>
            </div>

            <Modal show={show} onHide={captureClose} className="captureModal" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Screen Capture Widget</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs defaultActiveKey="Screenshot" id="capture--Tabs">
                        <Tab eventKey="Screenshot" title={<span><BiScreenshot /> Screenshot</span>}>
                            <Button variant="primary" onClick={captureClose}><BsRecord2 /> Capture</Button>
                        </Tab>
                        <Tab eventKey="Video" title={<span><RiCamera3Line /> Video</span>}>
                            <div class="live--video--capture">
                                <span class="status--circle gray--circle"></span>
                                <p>0:00/05:00</p>
                                <span className="mic--icon"><FaMicrophone /></span>
                            </div>
                            <Button variant="primary" onClick={captureClose}><BsRecord2 /> Capture</Button>
                        </Tab>
                    </Tabs>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default SidebarPanel;