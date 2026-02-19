import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash.debounce";
import { Container, Row, Col, Button, Modal, Form, Card, ListGroup, Table, Accordion, Dropdown, FormGroup} from "react-bootstrap";
import { FaPlus, FaEllipsisV } from "react-icons/fa";
import { FiEdit, FiMail, FiSidebar, FiTrash2, FiCheck} from "react-icons/fi";
import { AiOutlineTeam } from "react-icons/ai";
import { RiUserSettingsLine } from "react-icons/ri";
import { LuFolderOpen, LuSettings2 } from 'react-icons/lu';
import { GrExpand } from "react-icons/gr";
import { MdOutlineSearch, MdDragIndicator, MdFilterList } from "react-icons/md";
import { getMemberdata } from "../../helpers/commonfunctions";
import { Listmembers} from "../../redux/actions/members.action";
import { toggleSidebarSmall} from "../../redux/actions/common.action";
import { useNavigate } from "react-router-dom";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { updatePermissions, deleteRole} from "../../redux/actions/permission.action";
import { currentMemberProfile } from "../../helpers/auth";
import { permissionModules, permissionsLabel } from "../../helpers/permissionsModules";
import Roles from "./Roles";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function MemberPermissionPage() {
  const inputRef = useRef(null);
  const memberProfile = currentMemberProfile();
  const currentMember = getMemberdata();
  const [isActive, setIsActive] = useState(0);
    const [showSetting, setSettingShow] = useState(false);
    const [showdialog, setShowDialog] = useState(false);
      const [loader, setLoader] = useState(false);
  const handleSettingShow = () => setSettingShow(true);

  const handleTableToggle = (member) => {
    setSelectedMember(member);
  };
  const apiPermission = useSelector((state) => state.permissions);
  const [isActiveView, setIsActiveView] = useState(2);
  const [adjustPermissions, setAdjustPermissions] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fields, setFields] = useState({ email: "", name: "", role: "" });
  const [activeTab, setActiveTab] = useState("Members");
    const workspaceState = useSelector((state) => state.workspace);
  const handleSidebarSmall = () =>
    dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true));
  const commonState = useSelector((state) => state.common);
    const [currentPage, setCurrentPage] = useState(0);
  const dispatch = useDispatch();
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberFeeds, setMemberFeed] = useState([]);
  const [showloader, setShowloader] = useState(false);
  const apiResult = useSelector((state) => state.member);
  const [searchTerm, setsearchTerm] = useState("");
  const memberFeed = useSelector((state) => state.member.members);
  const [roles, setRoles] = useState([]);
  const handleListMember = async () => {
    if (activeTab === "Members") {
      setMemberFeed([]);
      await dispatch(Listmembers(currentPage, searchTerm));
      setShowloader(false);
    }
  };

  const [showSearch, setSearchShow] = useState(false);
  const handleSearchClose = () => setSearchShow(false);
  const handleSearchShow = () => setSearchShow(true);


  useEffect(() => {
    dispatch(getAvailableRolesByWorkspace({ fields: "_id name permissions" }));
    let prm = {};
    permissionModules.forEach((mod) => {
      prm[mod.slug] = {}; // Initialize object for each module
      mod.permissions.forEach((p) => {
        prm[mod.slug][p] = false;
      });
    });

    setPermissions(prm);

  }, []);


   
  useEffect(() => {
    if (currentPage !== "" && activeTab === "Members") {
      setShowloader(true);
      handleListMember();
    }
  }, [currentPage, searchTerm, activeTab]);

  useEffect(() => {
    if (apiResult.success) { 
      if (activeTab === "Members") {
        if (apiResult.updatedMember) { 
          const updatedMemberFeeds = memberFeeds.map((m) =>
            m._id.toString() === apiResult.updatedMember._id.toString()
              ? apiResult.updatedMember
              : m
          );

          setMemberFeed(updatedMemberFeeds);
          setSelectedMember(apiResult.updatedMember);
        } else {
          handleListMember();
        }
      }
      setErrors([]);
    }
    if (
      workspaceState.available_roles &&
      workspaceState.available_roles.length > 0
    ) {
      setRoles(workspaceState.available_roles);
    }
    if (apiResult.deletedMember) {
      setIsActive(false);
      setShowDialog(false);
    }

    
  }, [apiResult, workspaceState]);

  useEffect(() => {
    setLoader(false);
    if (apiPermission.success && activeTab === "Members") {
      if (apiPermission.updatedMember) {
        const updatedMemberFeeds = memberFeeds.map((m) =>
          m._id.toString() === apiPermission.updatedMember._id.toString()
            ? apiPermission.updatedMember
            : m
        );

        setMemberFeed(updatedMemberFeeds);
      }
    }
  }, [apiPermission]);

  useEffect(() => {
    if (
      workspaceState.available_roles &&
      workspaceState.available_roles.length > 0
    ) {
      setRoles(workspaceState.available_roles);
    }
  }, [workspaceState]);


  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
    }
  }, [memberFeed]);

  useEffect(() => {
    if (selectedMember !== null) {
      const cleanedMeta = { ...selectedMember?.memberMeta };
      
      let fieldsSetup = {
        name: selectedMember?.name,
        role: selectedMember?.role?._id,
      };

      
      setFields(fieldsSetup);
      const merged = {};

      // Step 1: Initialize merged with empty string values
      permissionModules.forEach((mod) => {
        merged[mod.slug] = {};
        mod.permissions.forEach((p) => {
          merged[mod.slug][p] = "";
        });
      });

      setPermissions((prev) => {
        const newPerms = cleanedMeta?.permissions?.meta_value || {};

        // Clone merged to avoid mutating the original reference
        const updated = { ...merged };

        // First, update existing keys in merged
        for (const module in updated) {
          updated[module] = { ...updated[module] }; // clone inner object
          for (const key in updated[module]) {
            if (newPerms?.[module] && key in newPerms[module]) {
              updated[module][key] = newPerms[module][key];
            } else {
              updated[module][key] = false;
            }
          }
        }

        // Then, add any missing modules or keys from newPerms
        for (const module in newPerms) {
          if (!updated[module]) {
            updated[module] = {};
          }
          for (const key in newPerms[module]) {
            if (!(key in updated[module])) {
              updated[module][key] = newPerms[module][key];
            }
          }
        }

        return updated;
      });
    }
  }, [selectedMember]);

  // Debounced search handler
      const debouncedUpdateSearch = useMemo(
      () =>
        debounce((value) => {
          setsearchTerm(value)
        }, 1000), // 1 sec debounce
      []
    );

  const [permissions, setPermissions] = useState({});
    const [expanded, setExpanded] = useState({});
  const toggleView = (module) => {
    const isChecked = !(permissions?.[module]?.view || false);

    const currentPerms = permissions?.[module] || {};
    const updated = {
      ...currentPerms,
      view: isChecked,
    };

    if (!isChecked) {
      const moduleData = permissionModules.find((m) => m.slug === module);
      if (moduleData) {
        (moduleData.permissions || []).forEach((perm) => {
          if (perm !== "view") {
            updated[perm] = false;
          }
        });
      }
    }

    setPermissions((prev) => ({
      ...prev,
      [module]: updated,
    }));
  };
  const togglePermission = (module, perm) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: !currentPerms?.[perm],
        },
      };
    });
  };


  const [projectToggle, setProjectToggle] = useState(false);
  const handleToggles = () => {
    if (commonState.sidebar_small === false) {
     
      handleSidebarSmall();
    } else {
      setProjectToggle(false);
      handleSidebarSmall();
     
    }
  };


  const toggleMembers = (module, perm, memberId) => {
    setPermissions((prev) => {
      const currentPerms = prev?.[module] || {};
      const currentMembers = currentPerms[perm] || [];

      const updatedMembers = currentMembers.includes(memberId)
        ? currentMembers.filter((id) => id !== memberId)
        : [...currentMembers, memberId];

      return {
        ...prev,
        [module]: {
          ...currentPerms,
          [perm]: updatedMembers,
        },
      };
    });
  };

  
  const pagetopbar = () => {
    return (
      <div className="page--title px-md-2 py-3 bg-white border-bottom">
        <Container fluid>
          <Row>
            <Col sm={12}>
              <h2>
                <span className="open--sidebar me-2" onClick={() => {handleSidebarSmall(false);setIsActive(0); }}><FiSidebar /></span>
                {activeTab}
                <ListGroup horizontal className={isActive ? "d-none" : "me-2 ms-auto d-none d-xl-flex" }>
                  <ListGroup horizontal>
                    <ListGroup.Item className="d-none d-md-flex gap-2 align-items-center" action active={activeTab === "Members"} onClick={() => {setsearchTerm("");setActiveTab("Members");}}><AiOutlineTeam /> Team Members</ListGroup.Item>
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <ListGroup.Item className="d-none d-md-flex gap-2 align-items-center" action active={activeTab === "Roles"} onClick={() => {setsearchTerm("");setActiveTab("Roles");}}><FiMail /> Roles</ListGroup.Item>
                    )}
                  </ListGroup>
                  <ListGroup.Item className="d-none d-xl-flex ms-3">
                    <Form className="search-filter-list" onSubmit={(e) => {e.preventDefault();}}>
                      <Form.Group className="mb-0 form-group">
                        <MdOutlineSearch />
                        <Form.Control type="text" readOnly={showloader} ref={inputRef} placeholder={activeTab === "Members"? "Search Member..": "Search Role.."} onChange={(e) => debouncedUpdateSearch(e.target.value)}/>
                      </Form.Group>
                    </Form>
                  </ListGroup.Item>
                </ListGroup>
                <ListGroup horizontal className="ms-auto ms-xl-0">
                  
                  <ListGroup horizontal className={isActive ? "d-none" : "d-flex bg-white expand--icon"}>
                    <ListGroup.Item className="d-flex d-xl-none" onClick={handleSearchShow}><MdFilterList /></ListGroup.Item>
                    <ListGroup.Item className="d-lg-flex" onClick={handleSettingShow}><RiUserSettingsLine /></ListGroup.Item>
                    <ListGroup.Item className="d-none d-lg-flex" onClick={handleToggles}><GrExpand /></ListGroup.Item>
                    
                  </ListGroup>
                </ListGroup>
              </h2>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };

  return (
    <>
      
        <div className={`${ isActive ? "show--details team--page project-collapse" : "team--page" } ${projectToggle === true ? "project-collapse" : ""}`}>
          {pagetopbar()}
          <div className="page--wrapper px-md-2 pb-4 pt-4">
            {showloader ?
              <div className="loading-bar"><img src="images/OnTeam-icon-gray.png" className="flipchar" /></div>
            :

            (activeTab === "Members") ? (
              <Container fluid>
                <>
                  <DragDropContext onDragEnd={() => {return;}}>
                    <div className={ isActiveView === 1 ? "project--grid--table project--grid--new--table table-responsive-xl" : isActiveView === 2 ? "project--table draggable--table new--project--rows table-responsive-xl" : "project--table new--project--rows table-responsive-xl"}>
                      {!showloader && memberFeeds && memberFeeds.length > 0
                        ?
                        <Table>
                          <thead className="onHide">
                            <tr key="project-table-header">
                              <th scope="col" className="sticky p-0 border-bottom-0" key="client-name-header">
                                <div className="d-flex align-items-center justify-content-between border-end border-bottom ps-3">Member{" "}<span key="client-action-header" className="onHide">Actions</span></div>
                              </th>
                              <th scope="col" key="client-email-header" className="onHide p-0 border-bottom-0"><div className="border-bottom padd--x">Email{" "}</div>{" "}</th>
                              
                            </tr>
                          </thead>
                          <Droppable droppableId={`droppable-members-table`} type="MEMBERS" >
                            {(provided) => (
                              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                {memberFeeds.map((member, idx) => (
                                    <>
                                    <Draggable
                                      key={member?._id}
                                      draggableId={`member-${member?._id}`}
                                      index={idx}
                                    >
                                      {(provided) => (
                                        <tr
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          key={`member-table-row-${member._id}`}
                                          className={
                                            member._id === selectedMember?._id
                                              ? "project--active"
                                              : ""
                                          }
                                          onClick={
                                              () => handleTableToggle(member)
                                              
                                          }
                                        >
                                          <td className="project--title--td sticky border-bottom" data-label="Member Name">
                                            <div className="d-flex justify-content-between border-end flex-wrap">
                                              <div className="project--name">
                                                <div className="drag--indicator"><abbr>{idx + 1}</abbr><MdDragIndicator /></div>
                                                <div className="title--initial">{
                                                  (member?.avatar && member?.avatar !== null ) ? 
                                                    <span><img src={member?.avatar} alt={'member-avatar'} /></span>
                                                    :
                                                    member.name.charAt(0)
                                                }</div>
                                                <div className="title--span flex-column align-items-start gap-0">
                                                  <span>{member.name}</span>
                                                  <strong>{member.role?.name}</strong>
                                                </div>
                                              </div>
                                              <div className="onHide task--buttons">
                                                <Dropdown>
                                                  <Dropdown.Toggle variant="dark" id="dropdown-basic">
                                                    <FaEllipsisV />
                                                  </Dropdown.Toggle>
                                                  <Dropdown.Menu>
                                                    {
                                                      (memberProfile &&
                                                      Object.keys(memberProfile).length > 0 &&
                                                      memberProfile?.permissions?.members?.create_edit_delete === true ||
                                                      memberProfile?.role?.slug !== "owner") ? (
                                                        <Dropdown.Item onClick={() => {
                                                          setAdjustPermissions(true);
                                                          setIsActive(true)
                                                        }} className="d-flex align-items-center gap-1"><FiEdit className="me-1" /> Edit Permissions</Dropdown.Item>
                                                      ) : <></>                    
                                                    }
                                                    
                                                    <Dropdown.Item onClick={() => setShowDialog(true)} className="d-flex align-items-center gap-1"><FiTrash2 /> 
                                                    Change Role
                                                    
                                                    </Dropdown.Item>
                                                  </Dropdown.Menu>
                                                </Dropdown>
                                              
                                              </div>
                                            </div>
                                          </td>
                                          <td className="onHide new--td">
                                            <strong className={isActiveView === 1 ? 'd-flex text-uppercase fs-small' : isActiveView === 2 ? 'd-flex d-lg-none text-uppercase fs-small mb-1' : 'd-flex d-lg-none text-uppercase fs-small mb-1'}>Email</strong>
                                            {member.email}
                                          </td>
                                          
                                          
                                        </tr>
                                      )}
                                      </Draggable>
                                      </>
                                    ))
                                  }   
                              </tbody>
                            )}
                            </Droppable>
                        </Table>
                      : !showloader && memberFeeds && memberFeeds.length === 0 && (
                      <div className="text-center">
                        <h2>No Members Found</h2>
                      </div>
                    )}
                    </div>
                  </DragDropContext>
                </>
              </Container>
              )

             :
              ( activeTab === "Roles") && (
                <Roles />
              )
            }
          </div>
        </div>
      

      
      
      {adjustPermissions ? (
        <div className="details--member--view">
          <>
            <div className="rounded--box">
              <div className="new--accordion--block">
              {permissionModules.map((mod) => {
                const modSlug = mod.slug;
                const modPerms = permissions?.[modSlug] || {};
                const isExpanded = expanded?.[modSlug] || false;
                const isViewChecked = !!modPerms.view;
                const truePermissionCount = Object.values(
                  modPerms
                ).filter((val) => val === true).length;

                return (
                <div className="bg--blue--accordion">
                  <div className="d-flex gap-3 align-items-center">
                    {permissionsLabel[modSlug]?.icon || <LuFolderOpen />}
                    <h6 className="mb-0">{permissionsLabel[modSlug]?.heading} <small className="d-block">{permissionsLabel[modSlug]?.sub_heading}</small></h6>
                    
                  </div>
                  {(mod.permissions || []).map((perm) => {
                    if (perm === "view") {
                      return (
                        <div className="d-flex gap-3 align-items-center mt-3 bg-white px-3 py-2 rounded-3">
                          <p className="mb-0">View</p>
                          <Form.Check key={`${modSlug}--view`} type="switch" className="ms-auto switch--small" checked={!!modPerms.view} onChange={
                            () => {
                              // if(selectedMember?.role?.slug !== "owner"){
                              toggleView(modSlug);
                            }
                            //}
                          }/>
                        </div>
                      )
                    }
                    return (
                      <>
                        <div className="d-flex gap-3 align-items-center mt-3 bg-white px-3 py-2 rounded-3">
                          <p className="mb-0">{perm.replace(/[_-]/g, " ").replace(/^\w/, (l) => l.toUpperCase())}</p>
                          <Form.Check type="switch" className="ms-auto switch--small" id={`${modSlug}-${perm}`} key={perm}
                            disabled={!isViewChecked}
                            checked={!!modPerms[perm]}
                            //onChange={(e) => setShowTeamGrid(e.target.checked)} 
                              onChange={() => {
                                //if(selectedMember?.role?.slug !== "owner"){ togglePermission(modSlug, perm)}
                                togglePermission(modSlug, perm);
                              }}
                          />
                        </div>
                        {[
                          "tracking",
                          "projects",
                          "reports",
                          "attendance",
                        ].includes(modSlug) &&
                          perm === "view_others" &&
                          modPerms[perm] === true && (
                            <div className="team--card--grid">
                              {memberFeeds.map((member) => (
                                <Card className={`team--card ${modPerms[
                                    "selected_members"
                                  ]?.includes(String(member._id))? 'selected--card' : ''}`} onClick={() => {
                                    //if (selectedMember?.role?.slug !== "owner") {
                                    toggleMembers(
                                      modSlug,
                                      "selected_members",
                                      member._id
                                    );
                                    // }
                                  }}>
                                  <span className="team--initial">{member.name?.charAt(0) || "U"}</span>
                                  <Card.Body>
                                    <h4>{member.name} <small className="d-block">{member?.role?.name}</small></h4>
                                  </Card.Body>
                                  <FiCheck className="ms-auto" />
                                </Card>
                              ))}

                              {modSlug === "projects" && (
                                <Card className={`team--card ${modPerms[
                                    "selected_members"
                                  ]?.includes("unassigned")? 'selected--card' : ''}`} onClick={() => {
                                    //if (selectedMember?.role?.slug !== "owner") {
                                    toggleMembers(
                                      modSlug,
                                      "selected_members",
                                      "unassigned"
                                    );
                                    // }
                                  }} key={`${modSlug}-${perm}-unassigned`}>
                                  <span className="team--initial">U</span>
                                  <Card.Body>
                                    <h4>Unassigned</h4>
                                  </Card.Body>
                                  <FiCheck className="ms-auto" />
                                </Card>
                              )}
                            </div>
                          )}
                      </>
                    )
                  })}
                  
                </div>
                )
              })}
              
            </div>
            </div>
          </>
        </div>
      ): <></>}

      
    
      {/*--=-=Search Modal**/}
      <Modal show={showSearch} onHide={handleSearchClose} size="md" className="search--modal">
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item className="p-0 border-0">
              <Dropdown className="select--dropdown manual--dropdown">
                <Dropdown.Toggle variant="success">
                  {activeTab}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="drop--scroll">
                    <Dropdown.Item className="d-flex gap-2 align-items-center dropdown-item" action active={activeTab === "Members"} onClick={() => {setsearchTerm("");setActiveTab("Members");}}><AiOutlineTeam /> Team Members</Dropdown.Item>
                    {(memberProfile?.permissions?.members
                      ?.create_edit_delete === true ||
                      memberProfile?.role?.slug === "owner") && (
                      <Dropdown.Item className="d-flex gap-2 align-items-center dropdown-item" action active={activeTab === "Invitations"} onClick={() => {setsearchTerm("");setActiveTab("Invitations");}}><FiMail /> Invitations</Dropdown.Item>
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
            <ListGroup.Item className="border-0 p-0 mt-3">
              <Form className="search-filter-list" onSubmit={(e) => {e.preventDefault();}}>
                <Form.Group className="mb-0 form-group">
                  <MdOutlineSearch />
                  <Form.Control type="text" readOnly={showloader} ref={inputRef} placeholder={activeTab === "Members"? "Search Member..": "Search Invitations.."} onChange={(e) => debouncedUpdateSearch(e.target.value)}/>
                </Form.Group>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default MemberPermissionPage;
