import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Accordion, Row, Col, Button, Modal, Form, FormGroup, Card, ListGroup, Table , Dropdown} from "react-bootstrap";
import { currentMemberProfile } from "../../helpers/auth";
import { useNavigate } from "react-router-dom";
import { permissionModules } from "../../helpers/permissionsModules";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { toggleSidebar, toggleSidebarSmall } from "../../redux/actions/common.action";
import { GrExpand } from "react-icons/gr";
import { BsEye } from "react-icons/bs";
import { TbArrowsSort } from "react-icons/tb";
import { FiMail, FiBriefcase, FiShield, FiPhone, FiCalendar, FiSidebar } from "react-icons/fi";
import { acceptCompanyinvite, listCompanyinvite, deleteInvite, resendInvite, Listmembers} from "../../redux/actions/members.action";
import { MdOutlineClose, MdSearch } from "react-icons/md";
import { fetchCustomFields } from "../../redux/actions/customfield.action";
import { updatePermissions } from "../../redux/actions/permission.action";
function Invitation(props) {
  const [isActiveView, setIsActiveView] = useState(2);
  const [rows, setRows] = useState([{ email: "", role: "" }]);
  const [ showPermissions, setShowPermissions] = useState( false)
  const [memberIndex, setMemberIndex] = useState('')
  const memberProfile = currentMemberProfile()
  const [isActive, setIsActive] = useState(0);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const apiPermission = useSelector((state) => state.permissions);
  const apiCustomfields = useSelector( state => state.customfields)
  const [customFields, setCustomFields] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const memberstate = useSelector((state) => state.member);
  const memberFeed = useSelector((state) => state.member.members);
  const invitationsFeed = useSelector((state) => state.member.invitations);
  const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
   const handleSidebar = () => dispatch(toggleSidebar(commonState.sidebar_open ? false : true))
  const commonState = useSelector(state => state.common)
  const apiResult = useSelector((state) => state.member);
  const [invitationsFeeds, setInvitationsFeed] = useState([]);
  const [memberFeeds, setMemberFeed] = useState([]);
  const [total, setTotal] = useState(0);
  const [showloader, setShowloader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ tab, setTab] = useState('details')
  const [permissions, setPermissions] = useState({});
  const [expanded, setExpanded] = useState({});
  const workspaceState = useSelector((state) => state.workspace);
  const [roles, setRoles] = useState([]);
  const handleInvitationList = async () => {
    if (props.activeTab === "Invitations") {
      setInvitationsFeed([])

      await dispatch(
        listCompanyinvite(currentPage, props.listfor, props.searchTerm)
      );
      setShowloader(false);
    }
  };

  useEffect(() => {
    dispatch(getAvailableRolesByWorkspace({ fields: "_id name permissions" }));
    handleListMember()
    let prm = {};
    permissionModules.forEach((mod) => {
      prm[mod.slug] = {}; // Initialize object for each module
      mod.permissions.forEach((p) => {
        prm[mod.slug][p] = '';
      });
    });

    setPermissions(prm);
  }, []);


  
    const handleToggleExpandAll = () => {
      const areAllExpanded = permissionModules.every(mod => expanded[mod.slug]);
    
      const newExpandedState = {};
      permissionModules.forEach(mod => {
        newExpandedState[mod.slug] = !areAllExpanded;
      });
    
      setExpanded(newExpandedState);
    };
    
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
  
    const handleSelectAll = (modSlug, isChecked) => {
      const memberIds = memberFeeds.map((member) => String(member._id));
      memberIds.push('unassigned')
      if (isChecked) {
        setPermissions((prev) => {
          const currentPerms = prev?.[modSlug] || {};
          const currentMembers = currentPerms['selected_members'] || [];
      
          return {
            ...prev,
            [modSlug]: {
              ...currentPerms,
              ['selected_members']: memberIds,
            },
          };
        });
      } else {
        setPermissions((prev) => {
          const currentPerms = prev?.[modSlug] || {};
          return {
            ...prev,
            [modSlug]: {
              ...currentPerms,
              ['selected_members']: [],
            },
          };
        });
      }
    };
  
  
    const handleSelectAllPermissions = (isChecked) => {
      const updatedPermissions = {};
    
      permissionModules.forEach((mod) => {
        const modSlug = mod.slug;
        const currentModPerms = permissions?.[modSlug] || {};
    
        const updatedModPerms = {};
    
        // Set all boolean permissions to true/false
        (mod.permissions || []).forEach((perm) => {
          updatedModPerms[perm] = isChecked;
        });
    
        // For modules that have selected_members, add them
        if (["tracking", "projects", "reports", "attendance"].includes(modSlug)) {
          if (isChecked) {
            const allMemberIds = memberFeeds.map((m) => String(m._id));
            if (modSlug === "projects") {
              allMemberIds.push("unassigned");
            }
            updatedModPerms["selected_members"] = allMemberIds;
          } else {
            updatedModPerms["selected_members"] = [];
          }
        }
    
        updatedPermissions[modSlug] = updatedModPerms;
      });
    
      setPermissions((prev) => ({ ...prev, ...updatedPermissions }));
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
    
  
 
    const handleSave = async (e) => {
      setLoader(true);
        try {
          const inviteData = {
            Id: selectedInvitation._id,
            permissions,
            type: "invite",
          };
          setLoader(true);
          dispatch(updatePermissions(inviteData));
        } catch (err) {
          setLoader(false);
          console.error("Error changing permissions:", err);
        }
    };

    const handleListMember = async () => {
        await dispatch(Listmembers());
        setShowloader(false);
    };

    const showPermissionsModal = (index) => {
     setMemberIndex( index )
    if( rows[index] && rows[index]?.permissions){
      setPermissions(rows[index]?.permissions)
    }
    setShowPermissions( true )
  }

  const handleSavePermissions = () => {
    const updatedRows = [...rows];
    updatedRows[memberIndex] = { ...updatedRows[memberIndex], ['permissions']: permissions };
    setRows(updatedRows);
    setShowPermissions( false )
  }

    useEffect(() => {
      setLoader(false); 
      if (
        workspaceState.available_roles &&
        workspaceState.available_roles.length > 0
      ) {
        setRoles(workspaceState.available_roles);
      }
    }, [apiResult, workspaceState]);
    
    useEffect(() => {
    setLoader(false);
    if (apiPermission.success) {
      
      if (apiPermission.updatedMember) {
        const updatedInvitationsFeeds = invitationsFeeds.map(m =>
          m._id.toString() === apiPermission.updatedMember._id.toString()
            ? apiPermission.updatedMember
            : m
        );
       
        setInvitationsFeed(updatedInvitationsFeeds);
        setSelectedInvitation(apiPermission.updatedMember)
      }
    }
  }, [apiPermission]);

  useEffect(() => {
    if (memberFeed && memberFeed.memberData) {
      setMemberFeed(memberFeed.memberData);
    }
  }, [memberFeed]);

  useEffect(() => {
    if( selectedInvitation) {
      const merged = {};
                  
      // Step 1: Initialize merged with empty string values
      permissionModules.forEach((mod) => {
        merged[mod.slug] = {};
        mod.permissions.forEach((p) => {
          merged[mod.slug][p] = '';
        });
      });
      if(selectedInvitation?.custom_fields?.permissions && Object.keys(selectedInvitation?.custom_fields?.permissions)?.length > 0 ){
        setPermissions((prev) => {
          const newPerms =  selectedInvitation?.custom_fields?.permissions;
          // Clone merged to avoid mutating the original reference
          const updated = { ...merged };
        
          // First, update existing keys in merged
          for (const module in updated) {
            updated[module] = { ...updated[module] }; // clone inner object
            for (const key in updated[module]) {
              if (newPerms?.[module] && key in newPerms[module]) {
                updated[module][key] = newPerms[module][key];
              } else {
                updated[module][key] = '';
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
      }else{
        const matchedRole = roles.find(role => role._id === selectedInvitation.role?._id);
        const matchedPermissions = matchedRole ? matchedRole.permissions : {};
        setPermissions(matchedPermissions)
      }
      
    }
  }, [selectedInvitation])

  const handleChange = (index, event, fieldname = "") => {
    const { name, value, type, files } = event.target;
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [name]: value };
    setRows(updatedRows);
  };
  
  useEffect(() => {
    if (currentPage !== "") {
      setShowloader(true);
      handleInvitationList()
    }
    dispatch(fetchCustomFields({module: 'members'}))
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
    if (props.toggleActive) {
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

  useEffect(() => { 
          if( apiCustomfields.customFields){
            setCustomFields( apiCustomfields.customFields)
          }
      
          if( apiCustomfields.newField){
            setCustomFields((prevCustomFields) => [apiCustomfields.newField, ...prevCustomFields]);
          }
      
            if (apiCustomfields.updatedField) {
            setCustomFields((prevCustomFields) =>
              prevCustomFields.map((field) =>
                field._id === apiCustomfields.updatedField._id
                  ? apiCustomfields.updatedField
                  : field
              )
            );
          }
      
      }, [apiCustomfields]);

  const [projectToggle, setProjectToggle ] = useState(false)
  const handleToggles = () => {
      if(commonState.sidebar_small === false ){ console.log('1')
          handleSidebarSmall()
      }else{
          setProjectToggle(false)
          handleSidebarSmall()
            console.log('3')
      }
  }
  return (
    <>
      <div className={`${isActive ? 'view--invitee team--page project-collapse' : 'team--page'} ${projectToggle === true ? 'project-collapse' : ''}`}>
        {props.topbar()}
        <div className="page--wrapper px-md-2 pt-3">
          {
            showloader &&
            <div class="loading-bar">
              <img src="images/OnTeam-icon.png" className="flipchar" />
            </div>
          }
          <Container fluid>
            {props.activeTab === "Invitations" && (

              <>
              {/* <div className={isActiveView === 1 ? 'project--grid--table project--grid--new--table table-responsive-xl' : isActiveView === 2 ? 'project--table draggable--table new--project--rows table-responsive-xl' : 'project--table new--project--rows table-responsive-xl'}></div> */}
                <div className={props.activeSubTab === 1 ? 'project--grid--table project--grid--new--table table-responsive-xl' : props.activeSubTab === 2 ? 'project--table draggable--table new--project--rows table-responsive-xl' : 'project--table new--project--rows table-responsive-xl'}>
                  <Table>
                    <thead className="onHide">
                        <tr key="project-table-header">
                          <th scope="col" className="sticky p-0 border-bottom-0" key="client-name-header">
                            <div className="d-flex align-items-center justify-content-between border-end border-bottom ps-3">Member <span key="client-action-header" className="onHide">Actions</span></div>
                          </th>
                        </tr>
                    </thead>
                    <tbody>
                      {invitationsFeeds && invitationsFeeds.length > 0 ? (
                        invitationsFeeds.map((invitation, index) => {
                          return (
                            <>
                              <tr key={`member-table-row-${index}`} className={invitation._id === selectedInvitation?._id ? 'project--active' : ''} onClick={isActive ? () => handleTableToggle(invitation) : () => { return false; }}>
                                <td className="project--title--td sticky" data-label="Member Name" >
                                  <div className="d-flex justify-content-between border-end flex-wrap">
                                    <div className="project--name">
                                      <div className="drag--indicator"><abbr>{index + 1}</abbr></div>
                                      <div className="title--initial">{invitation.email.charAt(0)}</div>
                                      <div className="title--span flex-column align-items-start gap-0">
                                        <span>{invitation.email}</span>
                                        <strong>
                                          {invitation.role?.name?.replace(
                                            /\b\w/g,
                                            function (char) {
                                              return char.toUpperCase();
                                            }
                                          )}
                                        </strong>
                                      </div>
                                    </div>
                                    <div className="onHide task--buttons">
                                      <Button variant="primary" className="px-3 py-2" onClick={() => { handleTableToggle(invitation); setIsActive(true); }}><BsEye /></Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </>
                          );
                        })
                      ) :
                        !showloader && invitationsFeeds && invitationsFeeds.length === 0 &&
                        <tr className="no--invite">
                          <td colSpan={4}>
                            <h2 className="mt-2 text-center">
                              There are no invitations.
                            </h2>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Container>
        </div>
      </div>
      <div className="details--invitee--view">
        <div className="wrapper--title py-2 bg-white border-bottom">
          <Dropdown>
              <Dropdown.Toggle variant="link" id="dropdown-basic">
                <h3>
                  <strong>{selectedInvitation?.email}</strong>
                  <span>{selectedInvitation?.role?.name}</span>
                </h3>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div className="drop--scroll">
                  {invitationsFeeds &&
                    invitationsFeeds.length > 0 &&
                    invitationsFeeds.map((invite, idx) => (
                      <Dropdown.Item
                        onClick={() => {
                          handleTableToggle(invite);
                          
                        }}
                        key={`item-${idx}`}
                      >
                        <strong>{invite?.email}</strong>
                        <span>{invite.role?.name}</span>
                      </Dropdown.Item>
                    ))}
                </div>
              </Dropdown.Menu>
            </Dropdown>
          <ListGroup horizontal>
            <ListGroup.Item nClick={handleToggles} className="d-none d-lg-flex"><GrExpand /></ListGroup.Item>
            <ListGroup.Item className="btn btn-primary" key={`closekey`} onClick={() => {if (props.toggleActive) {
                props.toggleActive(false)
              } setIsActive(0);}}><MdOutlineClose /></ListGroup.Item>
          </ListGroup>
        </div>
        
        <div className="rounded--box">
          <Card className="contact--card">
            <div className="card--img">
              <Card.Img variant="top" src={selectedInvitation?.avatar ?? "./images/default.jpg"} />
            </div>
            <Card.Body className="p-0 ps-4">
              <Card.Title><FiMail /> Contact Information</Card.Title>
              <Card.Text>
                <ListGroup>
                  <ListGroup.Item>
                    <span className="info--icon"><FiMail /></span>
                    <p><small>Email</small>{selectedInvitation?.email}</p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <span className="info--icon"><FiBriefcase /></span>
                    <p><small>Role</small>{selectedInvitation?.role?.name}</p>
                  </ListGroup.Item>
                
                </ListGroup>
              </Card.Text>
              <Card.Text>
                <ListGroup>
                  {customFields?.length > 0 && (
                    <>
                      {customFields.map((field, index) => (
                        <ListGroup.Item key={index}>
                          <p><small>{field.label}</small>
                          {selectedInvitation?.custom_fields?.[field.name] || ''}
                          </p>
                        </ListGroup.Item>
                      ))}
                    </>
                  )}
                  
                </ListGroup>
              </Card.Text>
              <div className="text-end mt-4">
                <Button variant="secondary" onClick={() => rejectInvite(selectedInvitation?._id)}>{props.listfor && props.listfor === "company" ? "Delete" : "Decline"}</Button>
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
          <Card className="permission--card">
            <Card.Body>
              <Card.Title><FiShield /> Access Permissions <Button variant="primary" className="ms-auto" //onClick={() => {showPermissionsModal()}}
                ><FiShield /> Manage Permissions</Button></Card.Title>
              <Card.Text>
                <Accordion
                  activeKey={Object.entries(expanded)
                    .filter(([_, v]) => v)
                    .map(([k]) => k)}
                  alwaysOpen
                >
                  {permissionModules.map((mod) => {
                    const modSlug = mod.slug;
                    const modPerms = permissions?.[modSlug] || {};
                    const isExpanded = expanded?.[modSlug] || false;
                    const truePermissionCount = Object.values(
                      modPerms
                    ).filter((val) => val === true).length;

                    // Show only modules with some true permissions
                    if (truePermissionCount === 0) return null;

                    return (
                      <Accordion.Item eventKey={modSlug} key={modSlug}>
                        <Accordion.Header
                          onClick={() => {
                            setExpanded((prev) => ({
                              ...prev,
                              [modSlug]: !prev[modSlug],
                            }));
                          }}
                        >
                          {mod.name}{" "}
                          <span className="per--count">
                            {truePermissionCount}/{mod?.permissions?.length}
                          </span>
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="transition-all">
                            {(mod.permissions || []).map((perm) => {
                              const isChecked = !!modPerms[perm];
                              if (!isChecked) return null;

                              const label = perm
                                .replace(/[_-]/g, " ")
                                .replace(/^\w/, (l) => l.toUpperCase());

                              return (
                                <React.Fragment key={`${modSlug}-${perm}`}>
                                  <Form.Check
                                    type="checkbox"
                                    id={`${modSlug}-${perm}`}
                                    label={label}
                                    checked={true}
                                    disabled={true}
                                    className="parent-item"
                                  />

                                  {/* Show sub-members if view_others is true and selected_members exist */}
                                  {[
                                    "tracking",
                                    "projects",
                                    "reports",
                                    "attendance",
                                  ].includes(modSlug) &&
                                    perm === "view_others" &&
                                    Array.isArray(
                                      modPerms["selected_members"]
                                    ) &&
                                    modPerms["selected_members"].length >
                                      0 && (
                                      <>
                                        {/* <Form.Check
                                          type="checkbox"
                                          id={`${modSlug}-${perm}-select-all`}
                                          label="Select all"
                                          checked={
                                            memberFeeds.length > 0 &&
                                            memberFeeds.every((member) =>
                                              modPerms[
                                                "selected_members"
                                              ].includes(String(member._id))
                                            )
                                          }
                                          disabled
                                          className="sub-items"
                                        /> */}
                                        {memberFeeds.map((member) => {
                                          if (
                                            !modPerms[
                                              "selected_members"
                                            ].includes(String(member._id))
                                          )
                                            return null;

                                          return (
                                            <Form.Check
                                              key={`${modSlug}-${perm}-${member._id}`}
                                              type="checkbox"
                                              id={`${modSlug}-${perm}-${member._id}`}
                                              label={member.name}
                                              checked={true}
                                              disabled
                                              className="sub-items"
                                            />
                                          );
                                        })}

                                        {modSlug === "projects" &&
                                          modPerms[
                                            "selected_members"
                                          ].includes("unassigned") && (
                                            <Form.Check
                                              key={`${modSlug}-${perm}-unassigned`}
                                              type="checkbox"
                                              id={`${modSlug}-${perm}-unassigned`}
                                              label="Unassigned"
                                              checked={true}
                                              disabled
                                              className="sub-items"
                                            />
                                          )}
                                      </>
                                    )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </Card.Text>
              
            </Card.Body>
          </Card>
        </div>
        
      </div>
    { showPermissions &&
      <Modal show={showPermissions} onHide={() => setShowPermissions( false )} centered size="lg" className="add--team--member--modal add--member--modal" >
        <Modal.Header closeButton>
          <Modal.Title>Roles & Permissions</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            
              {/* {rows.map((row, index) => ( */}
                <div className="form-row" key={`row-role-select`}>
                  <Form.Group className="mb-0 form-group">
                    <Form.Select
                      placeholder="Select role"
                      area-label="Role"
                      name="role"
                      controlId="floatingSelect"
                      className={
                        // errors[index] &&
                        //   errors[index]["role"] &&
                        //   errors[index]["role"] !== ""
                        //   ? "input-error custom-selectbox"
                          "form-control custom-selectbox"
                      }
                      value={rows[memberIndex]?.role}
                      onChange={(e) => {
                        handleChange(memberIndex, e, "role")
                        const matchedRole = roles.find(role => role._id === e.target.value);
                        const matchedPermissions = matchedRole ? matchedRole.permissions : [];
                        setPermissions(matchedPermissions)
                      }}
                    >
                      <option value="role">Select role</option>
                      {roles.map((role, roleIndex) => (
                        <option key={`role-${roleIndex}`} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </Form.Select>
                    
                  </Form.Group>
                </div>
              {/* ))} */}
            {(rows[memberIndex]?.role !== null && rows[memberIndex]?.role !== "role") &&
              <Card>
                <Card.Body>
                      <>
                      <div className="card--header" data-roleid={rows[memberIndex]?.role}>
                        <FormGroup className="form-group mb-0 pb-0">
                        <Form.Check
                          type="checkbox"
                          id="all"
                          label="Select All Permissions"
                          checked={permissionModules.every((mod) => {
                            const modSlug = mod.slug;
                            const modPerms = permissions?.[modSlug] || {};

                            const allPermsChecked = (mod.permissions || []).every((perm) => modPerms[perm] === true);

                            const selectedIds = modPerms["selected_members"] || [];
                            const allMemberIds = memberFeeds.map((m) => String(m._id));
                            if (modSlug === "projects") allMemberIds.push("unassigned");

                            const allMembersChecked = selectedIds.length === allMemberIds.length &&
                              allMemberIds.every((id) => selectedIds.includes(id));

                            if (["tracking", "projects", "reports", "attendance"].includes(modSlug)) {
                              return allPermsChecked && allMembersChecked;
                            }

                            return allPermsChecked;
                          })}
                          onChange={(e) => handleSelectAllPermissions(e.target.checked)}
                        />

                        </FormGroup>
                        <Button type="button" variant="link" className="p-0" onClick={handleToggleExpandAll}>
                          {permissionModules.every(mod => expanded[mod.slug]) ? "Collapse All" : "Expand All"}
                        </Button>

                      
                      </div>
                      <Accordion  activeKey={Object.entries(expanded)
                          .filter(([_, v]) => v)
                          .map(([k]) => k)}
                        alwaysOpen>
                        {permissionModules.map((mod) => {
                          const modSlug = mod.slug;
                          const modPerms = permissions?.[modSlug] || {};
                          const isExpanded = expanded?.[modSlug] || false;
                          const isViewChecked = !!modPerms.view;
                          const truePermissionCount = Object.values(modPerms).filter(val => val === true).length;

                          return (
                            <Accordion.Item eventKey={modSlug}>
                                  <Accordion.Header onClick={() => {
                                    setExpanded(prev => ({
                                      ...prev,
                                      [modSlug]: !prev[modSlug]
                                    }));
                                  }}>{mod.name} <span className="per--count">{truePermissionCount}/{mod?.permissions?.length}</span> </Accordion.Header>
                                  <Accordion.Body>
                                  <div className="transition-all">
                                  {(mod.permissions || []).map((perm) => {
                                    if (perm === 'view') {
                                      return (
                                        <Form.Check
                                          key={`${modSlug}--view`}
                                          type="checkbox"
                                          id={`${modSlug}-view`}
                                          label="View"
                                          checked={!!modPerms.view}
                                          onChange={() => {
                                            toggleView(modSlug)
                                          }
                                          }
                                        />
                                      );
                                    }

                                    return (
                                      <>
                                        <Form.Check
                                          key={perm}
                                          type="checkbox"
                                          id={`${modSlug}-${perm}`}
                                          label={perm
                                            .replace(/[_-]/g, " ")
                                            .replace(/^\w/, (l) => l.toUpperCase())}
                                          
                                          checked={!!modPerms[perm]}
                                          onChange={() => {
                                            togglePermission(modSlug, perm)}

                                          }
                                          className={!isViewChecked ? 'parent-item text-muted' : 'parent-item'}
                                        />
                                    
                                    {["tracking", "projects", "reports", "attendance"].includes(modSlug) &&
                                      perm === "view_others" &&
                                      modPerms[perm] === true &&
                                      <>
                                      <Form.Check
                                        key={`${modSlug}-${perm}-select-all`}
                                        type="checkbox"
                                        id={`${modSlug}-${perm}-select-all`}
                                        label="Select all"
                                        
                                        checked={memberFeeds.every((member) =>
                                          modPerms["selected_members"]?.includes(String(member._id))
                                        )}
                                        onChange={(e) => {
                                          
                                            handleSelectAll(modSlug, e.target.checked)
                                          
                                        }}
                                        className="sub-items"
                                      />
                                      <>
                                        {memberFeeds.map((member) => (
                                          <Form.Check
                                            key={`${modSlug}-${perm}-${member._id}`}
                                            type="checkbox"
                                            id={`${modSlug}-${perm}-${member._id}`}
                                            label={member.name}
                                            checked={modPerms["selected_members"]?.includes(String(member._id))}
                                            
                                            onChange={() => {
                                              toggleMembers(modSlug, "selected_members", member._id);
                                            }}
                                            className="sub-items"
                                          />
                                        ))}

                                        {modSlug === "projects" && (
                                          <Form.Check
                                            key={`${modSlug}-${perm}-unassigned`}
                                            type="checkbox"
                                            id={`${modSlug}-${perm}-unassigned`}
                                            label="Unassigned"
                                            checked={modPerms["selected_members"]?.includes('unassigned')}
                                            onChange={() => {
                                                toggleMembers(modSlug, "selected_members", 'unassigned');
                                            }}
                                            className="sub-items"
                                          />
                                        )}
                                        </>

                                      </>
                                      }
                                      </>
                                    );
                                    
                                  })}

                                </div>
                                  </Accordion.Body>
                                </Accordion.Item>
                            
                          );
                        })}
                        </Accordion>
                      </>
                    </Card.Body>
                </Card>
              }
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleSavePermissions} disabled={loader}>{loader ? "Please Wait..." : "Save"}</Button>
          </Modal.Footer>
      </Modal>
    }
    </>
  );
}

export default Invitation;
