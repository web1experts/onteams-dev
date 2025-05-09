import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  ListGroup,
  Table,
  Modal,
  Accordion,
  FloatingLabel,
} from "react-bootstrap";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { Listmembers } from "../../redux/actions/members.action";
import {
  updatePermissions,
  addRoleWithPermissions,
} from "../../redux/actions/permission.action";
import { FaPlus } from "react-icons/fa";
import { permissionModules } from "../../helpers/permissionsModules";
function PermissionsPage() {
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);
  const [loader, setLoader] = useState(false);
  const [activeRole, setActiveRole] = useState();
  const [spinner, setSpinner] = useState(false);
  const workspace = useSelector((state) => state.workspace);
  const members = useSelector((state) => state.member);
  const apiPermission = useSelector((state) => state.permissions);
  const memberFeed = useSelector((state) => state.member.members);
  const [roles, setRoles] = useState([]);
  const [memberslist, setMemberslist] = useState([]);
  const [show, setShow] = useState(false);
  const [fields, setFields] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [permissions, setPermissions] = useState({});
  const [expanded, setExpanded] = useState({});
  const [memberFeeds, setMemberFeed] = useState([]);
  const toggleExpand = (module) => {
    setExpanded((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPermissions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [activeKey, setActiveKey] = useState(null);

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedErrorsPromises = Object.entries(fields).map(
      async ([fieldName, value]) => {
        if (value === "") {
          return { fieldName, error: "Field cannot be blank" };
        } else {
          return { fieldName, error: "" };
        }
      }
    );

    // Wait for all promises to resolve
    const updatedErrorsArray = await Promise.all(updatedErrorsPromises);
    const errors = {};
    updatedErrorsArray.forEach(({ fieldName, error }) => {
      if (error) {
        errors[fieldName] = error;
      }
    });
    const hasError = Object.keys(errors).length > 0;

    if (hasError) {
      setErrors(errors);
      return;
    }
    try {
      const roleData = {
        name: fields.name,
        permissions,
      };
      setLoader(true);
      dispatch(addRoleWithPermissions(roleData));
    } catch (err) {
      console.error("Error adding role:", err);
      alert("Error adding role");
    }
  };

  const handleRoleList = async () => {
    await dispatch(
      getAvailableRolesByWorkspace({ fields: "_id name permissions" })
    );
  };

  useEffect(() => {
      if (memberFeed && memberFeed.memberData) {
        setMemberFeed(memberFeed.memberData);
      }
    }, [memberFeed]);

  useEffect(() => {
    setLoader(false);
    if (apiPermission.success) {
      setShow(false);
      if (apiPermission.savedrole) {
        const savedrole = apiPermission.savedrole;

        setRoles((prev) =>
          prev.map((role) => (role._id === savedrole._id ? savedrole : role))
        );
      }
      if (apiPermission.updatedMeta) {
        const meta = apiPermission.updatedMeta?.meta_value;
        const memberIdToUpdate = apiPermission.updatedMeta?.member;

        setMemberslist((prev) => {
          const existing = prev[activeKey];

          if (!existing) return prev;

          const updatedMembers = existing.members.map((member) => {
            if (member._id === memberIdToUpdate) {
              return {
                ...member,
                permissions: meta, // or savedrole.permissions if that’s what you want
              };
            }
            return member;
          });

          return {
            ...prev,
            [activeKey]: {
              ...existing,
              members: updatedMembers,
            },
          };
        });
      }
    }
  }, [apiPermission]);

  useEffect(() => {
    handleRoleList();
    let prm = {};
    permissionModules.forEach((mod) => {
      prm[mod.slug] = {}; // Initialize object for each module
      mod.permissions.forEach((p) => {
        prm[mod.slug][p] = '';
      });
    });

    setPermissions(prm);
    dispatch(Listmembers());
  }, [dispatch]);

  useEffect(() => {
    if (workspace.available_roles) {
      setRoles(workspace.available_roles);
      setActiveRole(workspace.available_roles[0]);
    }
  }, [workspace]);

  // useEffect(() => {
  //   if (activeRole) {
  //     const merged = {};
  //     permissionModules.forEach((mod) => {
  //       merged[mod.slug] = {}; // Initialize object for each module
  //       mod.permissions.forEach((p) => {
  //         merged[mod.slug][p] = '';
  //       });
  //     }); console.log("merged:: ", merged)
  //     setPermissions((prev) => {
  //       const newPerms = activeRole.permissions || {};
       
      
  //       for (const module in prev) {
  //         merged[module] = {};
      
  //         // Fill with new permissions if they exist, otherwise fallback to previous
  //         for (const key in prev[module]) {
  //           merged[module][key] = newPerms?.[module]?.[key] ?? prev[module][key];
  //         }
  //       }
      
  //       return merged;
  //     });
      
  //     //setPermissions(activeRole.permissions);
  //   }
  // }, [activeRole]);

  useEffect(() => {
    if (activeRole) {
      const merged = {};
      
      // Step 1: Initialize merged with empty string values
      permissionModules.forEach((mod) => {
        merged[mod.slug] = {};
        mod.permissions.forEach((p) => {
          merged[mod.slug][p] = '';
        });
      });
  
      // Step 2: Merge with role permissions and fallback to previous
      /*setPermissions((prev) => {
        const newPerms = activeRole.permissions || {};
      
        for (const module in merged) {
          for (const key in merged[module]) {
            // If the key exists in newPerms[module], use its value
            if (newPerms?.[module] && key in newPerms[module]) {
              merged[module][key] = newPerms[module][key];
            } else {
              // Otherwise, set it to ''
              merged[module][key] = '';
            }
          }
        }
      
        return merged;
      }); */

      setPermissions((prev) => {
        const newPerms = activeRole.permissions || {};
      
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
      
    }
  }, [activeRole]);
  

  const handleSave = async (e) => {
    try {
      const roleData = {
        role: activeRole._id,
        permissions,
        type: "default",
      };
      setLoader(true);
      dispatch(updatePermissions(roleData));
    } catch (err) {
      console.error("Error adding role:", err);
      alert("Error adding role");
    }
  };


  const showError = (name) => {
    if (errors[name]) return <span className="error">{errors[name]}</span>;
    return null;
  };

  const handleShow = () => {
    setShow((prev) => !prev);
  };
  return (
    <>
      <div className="team--page">
        <div className="page--wrapper setting--page">
          {spinner && (
            <div class="loading-bar">
              <img src="images/OnTeam-icon-gray.png" className="flipchar" />
            </div>
          )}
          <div className="setting--tabs">
            <h2>
              Roles & Permissions{" "}
              <Button variant="primary" onClick={() => handleShow()}>
                <FaPlus />
              </Button>
            </h2>
            <ListGroup horizontal className={isActive ? "toggle--menu" : ""}>
              {roles.map((role, index) => {
                return (
                  <ListGroup.Item
                    key={`role-${role._id}`}
                    action
                    active={activeRole?._id === role._id}
                    onClick={() => setActiveRole(role)}
                  >
                    {role.name}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </div>
          <div className="rounded--box">
            <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Permissions</h2>
              {activeRole &&
              <>
              <Accordion>
                {permissionModules.map((mod) => {
                  const modSlug = mod.slug;
                  const modPerms = permissions?.[modSlug] || {};
                  const isExpanded = expanded?.[modSlug] || false;
                  const isViewChecked = !!modPerms.view;

                  return (
                    
                    <Accordion.Item eventKey={modSlug}>
                      <Accordion.Header>{mod.name}</Accordion.Header>
                      <Accordion.Body>
                      <div className="ml-6 mt-2 space-y-1 transition-all pb-2">

                      {/* Permissions List */}
                      {/* {isExpanded && ( */}
                        <div className="ml-6 mt-2 space-y-1 transition-all pb-2">
                        {(mod.permissions || []).map((perm) => {
                          if (perm === 'view') {
                            return (
                              <Form.Check
                                key={`${modSlug}--view`}
                                type="checkbox"
                                id={`${modSlug}-view`}
                                label="View"
                                checked={!!modPerms.view}
                                onChange={() => toggleView(modSlug)}
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
                              onChange={() => togglePermission(modSlug, perm)}
                              className={!isViewChecked ? 'text-muted' : ''}
                            />
                            {["tracking", "projects", "reports"].includes(modSlug) &&
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
                                  onChange={(e) => handleSelectAll(modSlug, e.target.checked)}
                                  className="sub-items"
                                />
                                {
                                  memberFeeds.map((member) => (
                                    <Form.Check
                                      key={`${modSlug}-${perm}-${member._id}`}
                                      type="checkbox"
                                      id={`${modSlug}-${perm}-${member._id}`}
                                      label={member.name}
                                      checked={modPerms["selected_members"]?.includes(String(member._id))}
                                      onChange={() => toggleMembers(modSlug, "selected_members", member._id)}
                                    />
                                  ))
                                }
                                </>
                              }
                              </>
                          );
                        })}

                        </div>
                      {/* )} */}
                    </div>
                    </Accordion.Body>
                  </Accordion.Item>
                  );
                })}

                <div className="mt-6 text-right">
                  <Button variant="primary" onClick={handleSave}>
                    Save Permissions
                  </Button>
                </div>
                </Accordion>
                </>
              }
            </div>
          </div>
          {show && (
            <Modal show={show} onHide={() => setShow(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Add New Role</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <div className="project--form">
                  <div className="project--form--inputs">
                    <Form onSubmit={handleSubmit}>
                      <Form.Group controlId="roleName">
                        <FloatingLabel label="Role Name *">
                          <Form.Control
                            type="text"
                            name="name"
                            value={fields?.name}
                            onChange={(e) => {
                              setFields({
                                ...fields,
                                ["name"]: e.target.value,
                              });
                              setErrors({ ...errors, ["name"]: "" });
                            }}
                            disabled={loader}
                          />
                        </FloatingLabel>

                        {showError("name")}
                      </Form.Group>

                      <h5 className="mt-4">Permissions</h5>

                      {[
                        "projects",
                        "clients",
                        "tasks",
                        "holidays",
                        "tracking",
                        "reports",
                      ].map((module) => (
                        <Form.Group
                          key={module}
                          controlId={`permissions-${module}`}
                        >
                          <Form.Label>
                            {module.charAt(0).toUpperCase() + module.slice(1)}
                          </Form.Label>
                          <Form.Select
                            className="form-control custom-selectbox"
                            disabled={loader}
                            name={module}
                            value={permissions[module]}
                            onChange={handleInputChange}
                          >
                            <option value="view">View</option>
                            <option value="view_and_edit">View and Edit</option>
                          </Form.Select>
                        </Form.Group>
                      ))}
                      <Button variant="primary" type="submit" disabled={loader}>
                        {loader ? "Please wait..." : "Save Role"}
                      </Button>
                    </Form>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
}

export default PermissionsPage;
