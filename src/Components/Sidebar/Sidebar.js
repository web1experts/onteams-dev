import React, { useState, useEffect } from "react";
import { Navbar, Nav, Dropdown, Modal, Row, Col, Button, Card, Form} from "react-bootstrap";
import { LuFolderOpen, LuTimer, LuBuilding } from "react-icons/lu";
import { RxDashboard } from "react-icons/rx";
import { AiOutlineTeam } from "react-icons/ai";
import { TbReport } from "react-icons/tb";
import { BsCalendar2Week } from "react-icons/bs";
import { CgCalendarDates} from "react-icons/cg";
import { RiSettingsLine } from "react-icons/ri";
import { FiLogOut, FiUserCheck, FiHome } from "react-icons/fi";
import { MdOutlineColorLens, MdOutlineManageAccounts, MdCheck, MdArrowBack } from "react-icons/md";
import { getloggedInUser, currentMemberProfile} from '../../helpers/auth';
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { transformString, parseIfValidJSON, getMemberdata, mergePermissions } from '../../helpers/commonfunctions';
import { toggleSidebar, toggleTheme } from "../../redux/actions/common.action";
import { saveTheme } from "../../helpers/auth";
import { toggleSidebarSmall } from "../../redux/actions/common.action";
import { logout } from '../../redux/actions/auth.actions';

function SidebarPanel() {
    const secretKey = process.env.REACT_APP_SECRET_KEY
    const dispatch = useDispatch()
    const updateDashboard = useSelector( state => state.workspace.updateDashboard)
    const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
    const workspacestate = useSelector( state => state.workspace)
    const authstate = useSelector( state => state.auth)
    const commonState = useSelector(state => state.common)
    const currentLoggedUser = getloggedInUser();
    const memberProfile = currentMemberProfile()
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
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

    const [isActive, setIsActive] = useState(true);
    const [ collapseSidebar, setCollapseSidebar] = useState( false )
    const [ sidebarSmall, setSidebarSmall] = useState( false )
    const handleToggler = event => {
        setIsActive(current => !current);
    };

    useEffect(() => {
        setCollapseSidebar(commonState.sidebar_open )
    },[commonState ])

    useEffect(() => {
        setSidebarSmall(commonState.sidebar_small )
    },[commonState ])

    const themes = [
        { name: 'OceanBlue', color: 'linear-gradient(135deg, rgb(30,144,255), rgb(0,191,255))', primaryColor: 'rgb(30,144,255)', secondaryColor: 'rgb(0,191,255)' },
        { name: 'PurpleDream', color: 'linear-gradient(135deg, rgb(218,112,214), rgb(186,85,211))', primaryColor: 'rgb(218,112,214)', secondaryColor: 'rgb(186,85,211)' },
        { name: 'ForestGreen', color: 'linear-gradient(135deg, rgb(46,139,87), rgb(60,179,113))', primaryColor: 'rgb(46,139,87)', secondaryColor: 'rgb(60,179,113)' },
        { name: 'SunsetOrange', color: 'linear-gradient(135deg, rgb(255,69,0), rgb(255,140,0))', primaryColor: 'rgb(255,69,0)', secondaryColor: 'rgb(255,140,0)' },
        { name: 'RoyalPurple', color: 'linear-gradient(135deg, rgb(138,43,226), rgb(147,112,219))', primaryColor: 'rgb(138,43,226)', secondaryColor: 'rgb(147,112,219)' },
        { name: 'GoldenRose', color: 'linear-gradient(135deg, rgb(255,165,0), rgb(255,99,71))', primaryColor: 'rgb(255,165,0)', secondaryColor: 'rgb(255,99,71)' },
        { name: 'FreshLime', color: 'linear-gradient(135deg, rgb(50,205,50), rgb(173,255,47))', primaryColor: 'rgb(50,205,50)', secondaryColor: 'rgb(173,255,47)' },
        { name: 'SkyBlue', color: 'linear-gradient(135deg, rgb(0,191,255), rgb(135,206,250))', primaryColor: 'rgb(0,191,255)', secondaryColor: 'rgb(135,206,250)' },
        { name: 'ElectricFuchsia', color: 'linear-gradient(135deg, rgb(255,0,255), rgb(255,105,180))', primaryColor: 'rgb(255,0,255)', secondaryColor: 'rgb(255,105,180)' },
        { name: 'SunnyYellow', color: 'linear-gradient(135deg, rgb(255,215,0), rgb(255,165,0))', primaryColor: 'rgb(255,215,0)', secondaryColor: 'rgb(255,165,0)' },
        { name: 'CrimsonCoral', color: 'linear-gradient(135deg, rgb(220,20,60), rgb(255,99,71))', primaryColor: 'rgb(220,20,60)', secondaryColor: 'rgb(255,99,71)' },
        { name: 'MidnightBlue', color: 'linear-gradient(135deg, rgb(25,25,112), rgb(65,105,225))', primaryColor: 'rgb(25,25,112)', secondaryColor: 'rgb(65,105,225)' },
        { name: 'EmeraldMint', color: 'linear-gradient(135deg, rgb(46,229,157), rgb(31,191,164))', primaryColor: 'rgb(46,229,157)', secondaryColor: 'rgb(31,191,164)' },
        { name: 'MagentaViolet', color: 'linear-gradient(135deg, rgb(199,21,133), rgb(255,0,255))', primaryColor: 'rgb(199,21,133)', secondaryColor: 'rgb(255,0,255)' },
        { name: 'CopperBronze', color: 'linear-gradient(135deg, rgb(184,115,51), rgb(205,127,50))', primaryColor: 'rgb(184,115,51)', secondaryColor: 'rgb(205,127,50)' },
    ];

    const [selectedTheme, setSelectedTheme] = useState('Ocean Blue');

    const [primaryColor, setPrimaryColor] = useState('#3b82f6');
    const [secondaryColor, setSecondaryColor] = useState('#06b6d4');
    const [themeName, setThemeName] = useState('Custom Theme');

    const onApply = ({ primaryColor, secondaryColor, themeName }) => {
        // Example: Save to localStorage or trigger Redux action
        localStorage.setItem('custom_theme', JSON.stringify({ primaryColor, secondaryColor, themeName }));
        console.log('Applied theme:', primaryColor, secondaryColor, themeName);
    };

    const handleApply = () => {
        onApply({ primaryColor, secondaryColor, themeName });
    };

    const [showCreateOption, setShowCreateOption] = useState(false);

    return (
        <>
            <div className={`${!isActive ? 'open--panel--sidebar panel--sidebar' : 'panel--sidebar'} ${collapseSidebar ? 'collapse-sidebar' : ''} ${sidebarSmall ? 'open--panel--sidebar' : ''}`}>
                <Navbar expand="lg">
                    <Navbar.Brand>
                        <span><img src="images/OnTeam-white-icon.png" alt="" /></span>
                        <img src="images/OnTeam-Logo-white.png" alt="" />
                    </Navbar.Brand>
                    <div className="current--workspace">
                        <Dropdown>
                            <Dropdown.Toggle variant="primary" id="dropdown-workspace">
                                <span className="initial--name"><LuBuilding /></span> <strong>{companyname !== "" ? companyname : currentLoggedUser?.name} <small>Current Workspace</small></strong>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <h3>Switch Workspace</h3>
                                <div className="menu--scroll">
                                    {
                                        companies.length > 1 &&
                                        <>
                                            {companies.map((companyobj, index) => {
                                                if (companyobj.company && companyobj.company.name) {
                                                    return (
                                                        <Dropdown.Item className={selectedCompId === companyobj.company._id ? 'active-workspace': ''} key={`copmany-${companyobj.company._id}-${companyobj.company?.name}`} onClick={() => handleClick(companyobj.company._id)}>
                                                            <span className="initial--name"><LuBuilding /></span>{companyobj.company?.name} <span className="space--tick ms-auto"><MdCheck /></span>
                                                        </Dropdown.Item>
                                                    )
                                                }
                                            })}
                                        </>
                                    }
                                </div>
                                <Link className="dropdown-item create--space" to="/workspace" onClick={() => setShowDropdown(false)}><span className="initial--name"><LuBuilding /></span> Manage Workspace</Link>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    {/* <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-flex" onClick={() => {handleSidebarSmall(true);}} /> */}
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav>
                            <Link key="dashboard-menu" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard"><span className="nav--item--icon"><FiHome /></span> <strong>Dashboard</strong></Link>
                            {
                                (memberProfile?.permissions?.projects?.view === true || memberProfile?.role?.slug === 'owner') && (
                                    <Link key="project-menu" className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`} to="/projects">
                                        <span className="nav--item--icon"><LuFolderOpen /></span> <strong>Projects</strong>
                                    </Link>
                                )
                                }

                            
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.clients?.view === true  || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="client-menu"  className={`nav-link ${location.pathname === '/clients' ? 'active' : ''}`} to="/clients"><span className="nav--item--icon"><FiUserCheck /></span> <strong>Clients</strong></Link>
                                )
                            }
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.members?.view === true   || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="members-menu" className={`nav-link ${location.pathname === '/team-members' ? 'active' : ''}`} to="/team-members"><span className="nav--item--icon"><AiOutlineTeam /></span> <strong>Team Members</strong></Link>
                                )
                            }
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.tracking?.view === true   || memberProfile?.role?.slug === 'owner' ) && (
                                <Link  key="tracking-menu" className={`nav-link ${location.pathname === '/time-tracking' ? 'active' : ''}`} to="/time-tracking"><span className="nav--item--icon"><LuTimer /></span> <strong>Time Tracking</strong></Link>
                                )
                            }
                                {/* <Link  key="invite-menu" className={`nav-link ${location.pathname === '/invitations' ? 'active' : ''}`} to="/invitations"><span className="nav--item--icon"><HiUserPlus /></span> Invitations</Link> */}
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.reports?.view === true   || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="reports-menu" className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`} to="/reports"><span className="nav--item--icon"><TbReport /></span> <strong>Reports</strong></Link>
                                )
                            }
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.holidays?.view === true   || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="holidays-menu" className={`nav-link ${location.pathname === '/holidays' ? 'active' : ''}`} to="/holidays"><span className="nav--item--icon"><BsCalendar2Week /></span> <strong>Holidays</strong></Link>
                                )
                            }
                            {
                                (memberProfile?.permissions && memberProfile?.permissions?.attendance?.view === true  || memberProfile?.role?.slug === 'owner') && (
                                <Link  key="attendance-menu" className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`} to="/attendance"><span className="nav--item--icon"><CgCalendarDates /></span> <strong>Attendance</strong></Link>
                                )
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Dropdown className="user--dropdown" show={showDropdown} onToggle={handleToggle}>
                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                        <div className="user--info">
                            <img src={ currentLoggedUser?.avatar || "images/default.jpg"} alt="..." />
                            <h4>{memberProfile?.name} <small>{memberProfile?.role?.name}</small></h4>
                        </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <div className="menu--scroll">
                            {/* <Link className="dropdown-item" to="/workspace" onClick={() => setShowDropdown(false)}><span className="nav--item--icon"><MdOutlineManageAccounts /></span> Manage Workspace</Link> */}
                            <Link className="dropdown-item" to="/setting" onClick={() => setShowDropdown(false)}><span className="nav--item--icon"><RiSettingsLine /></span> Account Settings</Link>
                            {/* <Link className="dropdown-item" to="/setting" onClick={() => setShowDropdown(false)}><span className="nav--item--icon"><FaRegUser /></span> Edit Profile</Link> */}
                            <Dropdown.Item onClick={handleShow}><span className="nav--item--icon theme--item--icon"><MdOutlineColorLens /></span> Theme Settings</Dropdown.Item>
                            <Dropdown.Item className="logout--btn" key="logout-btn" onClick={(event) => dispatch(logout())}><span className="nav--item--icon"><FiLogOut /></span> Logout</Dropdown.Item>
                        </div>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <Modal className="theme--modal" show={show} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className="nav--item--icon"><MdOutlineColorLens /></span>
                        <strong>Theme Settings <small>Customize your app appearance</small></strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="choose--option" style={{ display: showCreateOption ? 'none' : 'block' }}>
                        <h5 className="mb-4">Choose a Theme</h5>
                        <Row>
                            {themes.map((theme, index) => (
                                <Col key={index} md={4} className="mb-4">
                                    <Card className={`theme--card ${selectedTheme === theme.name ? 'active--theme' : ''}`} onClick={() => {setSelectedTheme(theme.name); saveTheme(theme);dispatch(toggleTheme(theme))}} style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                                        <div className="themg--bg" style={{ background: theme.color, height: '60px', }}>
                                            {selectedTheme === theme.name && (
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        background: '#fff',
                                                        borderRadius: '50%',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 0 5px rgb(0,0,0,0.2)',
                                                    }}
                                                >
                                                    <MdCheck color="#0d6efd" size={16} />
                                                </span>
                                            )}
                                        </div>
                                        <Card.Body>
                                            <Card.Title>{theme.name}</Card.Title>
                                            <Card.Text>Predefined theme</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <div className="create--custom--option">
                            <label className="create--custom" onClick={() => setShowCreateOption(true)}>
                                <span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-6 h-6"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                                </span>
                                <strong>Create Custom Theme <small>Design your own color scheme</small></strong>
                            </label>
                        </div>
                    </div>
                    <div className="create--option" style={{ display: showCreateOption ? 'block' : 'none' }}>
                        <h5 className="mb-4">Choose a Theme <Button variant="link" onClick={() => setShowCreateOption(false)}><MdArrowBack /> Back</Button></h5>
                        <div className="preview--theme">
                            <p><strong>Preview</strong></p>
                            <div style={{background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,}}></div>
                        </div>
                        
                        <Row>
                            <Col>
                                <Form.Group controlId="primaryColor">
                                    <Form.Label>Primary Color</Form.Label>
                                    <Form.Control type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="secondaryColor">
                                    <Form.Label>Secondary Color</Form.Label>
                                    <Form.Control type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="btn--group d-flex gap-3 mt-4">
                            <Button variant="primary" onClick={handleApply}>Apply Custom Theme</Button>
                            <Button variant="secondary" onClick={() => setShowCreateOption(false)}>Cancel</Button>
                        </Form.Group>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default SidebarPanel;