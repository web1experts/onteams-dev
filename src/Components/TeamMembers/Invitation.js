import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Accordion, Row, Col, Button, Modal, Form, FormGroup, Card, ListGroup, Table } from "react-bootstrap";
import { currentMemberProfile } from "../../helpers/auth";
import { useNavigate } from "react-router-dom";
import { permissionModules } from "../../helpers/permissionsModules";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import {
  acceptCompanyinvite,
  listCompanyinvite,
  deleteInvite,
  resendInvite,
  Listmembers
} from "../../redux/actions/members.action";
import { MdOutlineClose, MdSearch } from "react-icons/md";
import { updatePermissions } from "../../redux/actions/permission.action";
function Invitation(props) {
  const memberProfile = currentMemberProfile()
  const [isActive, setIsActive] = useState(0);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const apiPermission = useSelector((state) => state.permissions);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const memberstate = useSelector((state) => state.member);
  const memberFeed = useSelector((state) => state.member.members);
  const invitationsFeed = useSelector((state) => state.member.invitations);
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
    if (props.activeTab === "Invitees") {
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
      if(selectedInvitation?.permissions && Object.keys(selectedInvitation?.permissions)?.length > 0 ){
        setPermissions((prev) => {
          const newPerms =  selectedInvitation?.permissions;
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
  
  useEffect(() => {
    if (currentPage !== "") {
      setShowloader(true);
      handleInvitationList()
    }
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
  return (
    <>
      <div className={isActive ? 'view--invitee team--page' : 'team--page'}>
        {props.topbar()}
        <div className="page--wrapper px-md-2 pt-3">
          {
            showloader &&
            <div class="loading-bar">
              <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
          }
          <Container fluid>
            {props.activeTab === "Invitees" && (

              <>
                <Table responsive="lg" className={props.activeSubTab === 1 ? 'project--grid--table clients--grid--table' : props.activeSubTab === 2 ? 'project--table clients--table' : 'project--table clients--table'}>
                  <thead>
                    <tr>
                      {/* <th width={20}>#</th> */}
                      <th><abbr>#</abbr> Email Address</th>
                      <th className="onHide">Role</th>
                      <th className="onHide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitationsFeeds && invitationsFeeds.length > 0 ? (
                      invitationsFeeds.map((invitation, index) => {
                        return (
                          <>
                            <tr key={`member-table-row-${index}`} className={invitation._id === selectedInvitation?._id ? 'project--active' : ''} onClick={isActive ? () => handleTableToggle(invitation) : () => { return false; }}>
                              {/* <td>{index + 1}</td> */}
                              <td>
                                <span className="onHide">
                                  <img variant="top" src="./images/default.jpg" />
                                </span>
                                <span><abbr>{index + 1}.</abbr> {invitation.email}</span></td>
                              <td className="onHide">
                                {invitation.role?.name?.replace(
                                  /\b\w/g,
                                  function (char) {
                                    return char.toUpperCase();
                                  }
                                )}
                              </td>
                              <td className="onHide">
                                <Button variant="primary" onClick={() => { handleTableToggle(invitation); setIsActive(true) }}>View</Button>
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
              </>
            )}
          </Container>
        </div>
      </div>
      <div className="details--invitee--view">
        <div className="wrapper--title">
          <div className="projecttitle">
            <h3><strong>Member Details</strong></h3>
          </div>
          <ListGroup horizontal>
            <Button variant="outline-primary" className={`btn--view d-none d-sm-flex${tab === 'details' ? ' active' : ''}`} onClick={() => setTab('details')}>Details</Button>
            { (memberProfile?.permissions?.members?.update_permissions === true || memberProfile?.role?.slug === "owner") && (
            <Button variant="outline-primary" className={`btn--view d-none d-sm-flex${tab === 'permissions' ? ' active' : ''}`} onClick={() => {
              setTab('permissions')
              }}>Permissions</Button>
            )}
            <ListGroup.Item onClick={() => {
              if (props.toggleActive) {
                props.toggleActive(false)
              } setIsActive(0)
            }}>
              <MdOutlineClose />
            </ListGroup.Item>
          </ListGroup>
        </div>
        { tab === 'details' ?
          <div className="rounded--box">
            <Card>
              <div className="card--img">
                <Card.Img variant="top" src={selectedInvitation?.avatar ?? "./images/default.jpg"} />
              </div>
              <Card.Body>
                <Card.Title>Member Information</Card.Title>
                <Card.Text>
                  <ListGroup>
                    <ListGroup.Item>
                      <strong>Email</strong> {selectedInvitation?.email}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Role</strong> Team Lead
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Text>
                <div className="text-end mt-3">
                  <Button variant="danger" onClick={() => rejectInvite(selectedInvitation?._id)}>{props.listfor && props.listfor === "company" ? "Delete" : "Decline"}</Button>
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
          </div>
          :
            <div className="rounded-box">
                    <Card>
                      <Card.Body>
                          <Card.Title>Permissions</Card.Title>
                          
                            <>
                            <div className="card--header">
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
                                                disabled={!isViewChecked}
                                                checked={!!modPerms[perm]}
                                                
                                                onChange={() => {
                                                  togglePermission(modSlug, perm)
            
                                                }}
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
                              <div className="mt-4 text-end">
                                <Button variant="primary" onClick={handleSave} disabled={loader}>
                                  { loader ? 'Please wait...' : 'Save Permissions'}
                                </Button>
                              </div>
                              </>
                          </Card.Body>
                      </Card>
                    </div>
                    }
                  </div>
         
    </>
  );
}

export default Invitation;
