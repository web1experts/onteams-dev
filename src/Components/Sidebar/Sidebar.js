import React, { useState, useEffect } from "react";
import { Navbar, Nav, Dropdown} from "react-bootstrap";
import { LuLayoutDashboard, LuTimer } from "react-icons/lu";
import { RxDashboard } from "react-icons/rx";
import { AiOutlineTeam } from "react-icons/ai";
import { GrGroup } from "react-icons/gr";
import { TbReport } from "react-icons/tb";
import { BsCalendar2Week } from "react-icons/bs";
import { CgCalendarDates} from "react-icons/cg";
import { RiSettingsLine } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";
import { MdOutlineManageAccounts } from "react-icons/md";
import { getloggedInUser, currentMemberProfile} from '../../helpers/auth';
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { transformString, parseIfValidJSON, getMemberdata, mergePermissions } from '../../helpers/commonfunctions';
import { logout } from '../../redux/actions/auth.actions';

function SidebarPanel() {
    const secretKey = process.env.REACT_APP_SECRET_KEY
    const dispatch = useDispatch()
    const updateDashboard = useSelector( state => state.workspace.updateDashboard)
    const workspacestate = useSelector( state => state.workspace)
    const authstate = useSelector( state => state.auth)

    const currentLoggedUser = getloggedInUser();
    const memberProfile = currentMemberProfile()

    const location = useLocation();
    let companyname = '';
    let selectedCompId;
    const [companies, setCompanies ] = useState([])

    const [showDropdown, setShowDropdown] = useState(false);

    const handleToggle = (isOpen) => {
        setShowDropdown(isOpen);
    };

    // const handleItemClick = (companyId) => {
    //     handleClick(companyId);
    //     setShowDropdown(false);
    // };
    
    const encryptedCompany = localStorage.getItem('current_dashboard');
    if (encryptedCompany && encryptedCompany !== "") {
        const decryptedCompany = parseIfValidJSON(encryptedCompany);
        companyname = (decryptedCompany) ? decryptedCompany.name : ''
        selectedCompId = (decryptedCompany) ? decryptedCompany.id : ''
    }

    function refreshWorskspacelist(){
        const encryptedCompanies = localStorage.getItem('mt_dashboards');
        
        if (encryptedCompanies !== null) {
            const decryptcompanies = parseIfValidJSON(encryptedCompanies)
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

    

    // const onChange = (selectedvalue) => {
    //     const selected = companies.find(company => company.company._id === selectedvalue);
    //     localStorage.setItem('current_dashboard', JSON.stringify({ name: selected.company.name, id: selected.company._id }));
    //     localStorage.setItem('mt_featureSwitches', JSON.stringify(selected?.memberData || null))
    //     // setAuthorization()
    //     setTimeout(function () {
    //         window.location.reload();
    //     }, 1000)
    // }

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
                                                        <Dropdown.Item className={selectedCompId === companyobj.company._id ? 'active-workspace': ''} key={`copmany-${companyobj.company._id}-${companyobj.company?.name}`} onClick={() => handleClick(companyobj.company._id)}><span className="initial--name">{companyobj.company.name !== "" ? transformString(companyobj.company.name) : transformString(currentLoggedUser?.name)}</span> {companyobj.company?.name}</Dropdown.Item>
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
                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-flex" onClick={handleToggler} />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav>
                            <Link key="dashboard-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard"><span className="nav--item--icon"><LuLayoutDashboard /></span> <strong>Dashboard</strong></Link>
                            {
                                (memberProfile?.permissions?.projects?.view === true || memberProfile?.role?.slug === 'owner') && (
                                    <Link
                                    key="project-menu"
                                    onClick={handleToggler}
                                    className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}
                                    to="/projects"
                                    >
                                    <span className="nav--item--icon"><RxDashboard /></span> <strong>Projects</strong>
                                    </Link>
                                )
                                }

                            
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.clients?.view === true  || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="client-menu" onClick={handleToggler}  className={`nav-link ${location.pathname === '/clients' ? 'active' : ''}`} to="/clients"><span className="nav--item--icon"><GrGroup /></span> <strong>Clients</strong></Link>
                                )
                            }
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.members?.view === true   || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="members-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/team-members' ? 'active' : ''}`} to="/team-members"><span className="nav--item--icon"><AiOutlineTeam /></span> <strong>Team Members</strong></Link>
                                )
                            }
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.tracking?.view === true   || memberProfile?.role?.slug === 'owner' ) && (
                                <Link  key="tracking-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/time-tracking' ? 'active' : ''}`} to="/time-tracking"><span className="nav--item--icon"><LuTimer /></span> <strong>Time Tracking</strong></Link>
                                )
                            }
                                {/* <Link  key="invite-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/invitations' ? 'active' : ''}`} to="/invitations"><span className="nav--item--icon"><HiUserPlus /></span> Invitations</Link> */}
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.reports?.view === true   || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="reports-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`} to="/reports"><span className="nav--item--icon"><TbReport /></span> <strong>Reports</strong></Link>
                                )
                            }
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.holidays?.view === true   || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="holidays-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/holidays' ? 'active' : ''}`} to="/holidays"><span className="nav--item--icon"><BsCalendar2Week /></span> <strong>Holidays</strong></Link>
                                )
                            }
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.attendance?.view === true  || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="attendance-menu" onClick={handleToggler} className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`} to="/attendance"><span className="nav--item--icon"><CgCalendarDates /></span> <strong>Attendance</strong></Link>
                                )
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        </>
    );
}

export default SidebarPanel;