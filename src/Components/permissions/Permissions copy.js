import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, ListGroup, Table, Modal, Accordion, FloatingLabel } from "react-bootstrap";
import { getAvailableRolesByWorkspace } from "../../redux/actions/workspace.action";
import { getMembersGroupByRoles } from "../../redux/actions/members.action";
import { updatePermissions, addRoleWithPermissions } from "../../redux/actions/permission.action";
import { FaPlus } from "react-icons/fa";
function PermissionsPage() {
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);
  const [loader, setLoader] = useState(false);
  const [activeTab, setActiveTab] = useState("Clients");
  const [ spinner, setSpinner] = useState( false);
  const workspace = useSelector(state => state.workspace)
  const members = useSelector( state => state.member)
  const apiPermission = useSelector( state =>  state.permissions)
  const [ roles, setRoles ] = useState([])
  const [ memberslist, setMemberslist] = useState([])
  const [ show, setShow ] = useState( false )
  const [ fields, setFields ] = useState({name: ''})
  const [ errors, setErrors ] = useState({})
  const [permissions, setPermissions] = useState({
    projects: 'view',
    clients: 'view',
    tasks: 'view',
    holidays: 'view',
    tracking: 'view',
    reports: 'view',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPermissions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [activeKey, setActiveKey] = useState(null);

  const handleSelect = (eventKey) => {
    setActiveKey(prev => (prev === eventKey ? null : eventKey));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
     const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
          if( value === ""){
            return { fieldName, error:'Field cannot be blank' };
          }else{
            return { fieldName, error: '' };
          }
          
      });

      // Wait for all promises to resolve
      const updatedErrorsArray = await Promise.all(updatedErrorsPromises);
      const errors = {}
      updatedErrorsArray.forEach(({ fieldName, error }) => {
          if (error) {
              errors[fieldName] = error;
          }
      });
    const hasError = Object.keys(errors).length > 0;

    if (hasError) {
      setErrors(errors)
      return;
    }
    try {
      const roleData = {
        name: fields.name,
        permissions,
      };
      setLoader( true )
      dispatch(addRoleWithPermissions(roleData))
    } catch (err) {
      console.error('Error adding role:', err);
      alert('Error adding role');
    }
  };

  const handleListMember = async () => {
   await dispatch( getMembersGroupByRoles())
  };
  
  const handleRoleList = async () => {
    await dispatch(getAvailableRolesByWorkspace({fields: '_id name permissions'}))
  }

  useEffect(() => {
    console.log("memberslist:: ", activeKey)
  }, [activeKey])

  useEffect(() => {
    setLoader( false )
    if( apiPermission.success){
      setShow( false )
      if( apiPermission.savedrole){
        const savedrole = apiPermission.savedrole
        
        setMemberslist(prev => {
          const existing = prev[savedrole.slug];
      
          // If role exists, update only permissions
          if (existing) { console.log('found')
            return {
              ...prev,
              [savedrole.slug]: {
                ...existing,
                permissions: savedrole.permissions
              }
            };
          }
      
          // If role doesn't exist, add it with empty members
          return {
            ...prev,
            [savedrole.slug]: {
              _id: savedrole._id,
              name: savedrole.name,
              slug: savedrole.slug,
              permissions: savedrole.permissions,
              members: []
            }
          };
        });
      }
      if (apiPermission.updatedMeta) {
        const meta = apiPermission.updatedMeta?.meta_value;
        const memberIdToUpdate = apiPermission.updatedMeta?.member;
      
        setMemberslist(prev => {
          const existing = prev[activeKey];
      
          if (!existing) return prev;
      
          const updatedMembers = existing.members.map(member => {
            if (member._id === memberIdToUpdate) {
              return {
                ...member,
                permissions: meta // or savedrole.permissions if that’s what you want
              };
            }
            return member;
          });
      
          return {
            ...prev,
            [activeKey]: {
              ...existing,
              members: updatedMembers
            }
          };
        });
      }
    }
  }, [apiPermission])

  useEffect(() => {
    handleRoleList()
    handleListMember()
  }, [dispatch])

  useEffect(() => {
    if( workspace.available_roles ){
      setRoles(workspace.available_roles)
    }
  }, [workspace])

  useEffect(() => {
    if( members?.memberslist){
      setMemberslist( members.memberslist)
    }
  }, [ members ])

  const handlePermissionChange = async (permit_for, type, identifier, value) => { console.log('identifier:: ', identifier)
    const payload =
      type === 'default'
        ? { role: identifier, permission: value, type, permit_for }       // for role default
        : { memberId: identifier, permission: value, type,permit_for };  // for individual member
  
    // Make API call here
     dispatch(updatePermissions(payload))
  };
  
  const showError = (name) => {
    if (errors[name]) return (<span className="error">{errors[name]}</span>)
    return null
  }
  
  const handleShow = () =>{
    setShow(prev => !prev);
  }
  return (
    <>
     
        <div className='team--page'>
          <div className='page--wrapper setting--page'>
          {
              spinner &&
              <div class="loading-bar">
                  <img src="images/OnTeam-icon-gray.png" className="flipchar" />
              </div>
          }
            <div className="setting--tabs">
              <h2>Roles & Permissions <Button variant="primary" onClick={() => handleShow()}><FaPlus /></Button></h2>
              <ListGroup horizontal className={isActive ? 'toggle--menu' : ''}>
                <ListGroup.Item action active={activeTab === "Clients"} onClick={() => setActiveTab("Clients")}>Clients</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Projects"} onClick={() => setActiveTab("Projects")}>Projects</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Tasks"} onClick={() => setActiveTab("Tasks")}>Tasks</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "TimeTracking"} onClick={() => setActiveTab("TimeTracking")}>Time Tracking</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Members"} onClick={() => setActiveTab("Members")}>Team Members</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Reports"} onClick={() => setActiveTab("Reports")}>Reports</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Holidays"} onClick={() => setActiveTab("Holidays")}>Holidays</ListGroup.Item>
                <ListGroup.Item action active={activeTab === "Attendance"} onClick={() => setActiveTab("Attendance")}>Attendance</ListGroup.Item>
              </ListGroup>
            </div>
            
            {activeTab === "Projects" && (
              <div className="rounded--box">
                <h5>Projects Settings</h5>
                <hr />
                <Accordion defaultActiveKey={`${Object.keys(memberslist)[0] || ''}`} onSelect={handleSelect}>
                  {
                    memberslist && Object.keys(memberslist).length > 0 ?
                    Object.entries(memberslist).map(([roleSlug, roleData], index) => {
                      return (
                      <>
                      
                        <Accordion.Item eventKey={`${roleSlug}`}>
                          <div className="screens--tabs">
                            <Accordion.Header>
                              <p>
                                <span>{roleData?.name}</span>
                              </p>
                            </Accordion.Header>
                          </div>
                          <Accordion.Body>
                            <h6 class="mb-1">Default Permissions</h6>
                            <p>Default permissions will be applied for the newly added members.</p>
                            <div class="switch-wrapper">
                              <input id={`view-default-${roleData._id}`} key={`view-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('projects','default', roleData._id, 'view')} checked={roleData?.permissions?.projects === 'view'} />
                              <label htmlFor={`view-default`}>View</label>
                              <input id={`add-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} key={`add-default--${roleData._id}`} onChange={() => handlePermissionChange('projects','default', roleData._id, 'view_and_edit')}  checked={roleData?.permissions?.projects === 'view_and_edit'} />
                              <label htmlFor={`add-default-${roleData._id}`}>Add / Edit / Delete</label>
                            </div>
                              <Table responsive="lg">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                {roleData.members.map((member, i) => (
                                  <tr>
                                    <td>{member?.name}</td>
                                    <td>
                                      <div class="switch-wrapper">
                                        <input id={`project-view-${member._id}`} key={`project-view-${member._id}`} type="radio" name={`member-${member._id}`}onChange={() => handlePermissionChange('projects','member', member._id, 'view')} checked={member?.permissions?.projects === 'view'} />
                                        <label htmlFor={`project-view-${member._id}`}>View</label>
                                        <input id={`project-add-${member._id}`} type="radio" name={`member-${member._id}`} key={`project-view-${member._id}`} onChange={() => handlePermissionChange('projects','member', member._id, 'view_and_edit')} checked={member?.permissions?.projects === 'view_and_edit'} />
                                        <label htmlFor={`projectadd-${member._id}`}>Add / Edit / Delete</label>
                                      </div>
                                    </td>
                                  </tr>
                                  ))}
                                </tbody>
                              </Table>
                          </Accordion.Body>
                        </Accordion.Item>
                        </>
                    )})
                    :
                    <> <p>NO members found</p></>
                  }
                  </Accordion>
              </div>
            )}
            {activeTab === "Tasks" && (
              <div className="rounded--box">
                <h5>Tasks Settings</h5>
                <hr />
                <Accordion defaultActiveKey={`${Object.keys(memberslist)[0] || ''}`} onSelect={handleSelect}>
                  {
                    memberslist && Object.keys(memberslist).length > 0 ?
                    Object.entries(memberslist).map(([roleSlug, roleData], index) => {
                      return (
                      <>
                      
                        <Accordion.Item eventKey={`${roleSlug}`}>
                          <div className="screens--tabs">
                            <Accordion.Header>
                              <p>
                                <span>{roleData?.name}</span>
                              </p>
                            </Accordion.Header>
                          </div>
                          <Accordion.Body>
                            <h6 class="mb-1">Default Permissions</h6>
                            <p>Default permissions will be applied for the newly added members.</p>
                            <div class="switch-wrapper">
                              <input id={`view-default-${roleData._id}`} key={`view-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('tasks','default', roleData._id, 'view')} checked={roleData?.permissions?.tasks === 'view'} />
                              <label htmlFor={`view-default-${roleData._id}`}>View</label>
                              <input id={`add-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} key={`add-default--${roleData._id}`} onChange={() => handlePermissionChange('tasks','default', roleData._id, 'view_and_edit')} checked={roleData?.permissions?.tasks === 'view_and_edit'} />
                              <label htmlFor={`add-default-${roleData._id}`}>Add / Edit / Delete</label>
                            </div>
                              <Table responsive="lg">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                {roleData.members.map((member, i) => (
                                  <tr>
                                    <td>{member?.name}</td>
                                    <td>
                                      <div class="switch-wrapper">
                                        <input id={`task-view-${member._id}`} key={`task-view-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('tasks','member', member._id, 'view')} checked={member?.permissions?.tasks === 'view'} />
                                        <label htmlFor={`task-view-${member._id}`}>View</label>
                                        <input id={`task-add-${member._id}`} type="radio" name={`member-${member._id}`} key={`task-add-${member._id}`} onChange={() => handlePermissionChange('tasks','member', member._id, 'view_and_edit')} checked={member?.permissions?.tasks === 'view_and_edit'} />
                                        <label htmlFor={`task-add-${member._id}`}>Add / Edit / Delete</label>
                                      </div>
                                    </td>
                                  </tr>
                                  ))}
                                </tbody>
                              </Table>
                          </Accordion.Body>
                        </Accordion.Item>
                        </>
                    )})
                    :
                    <> <p>NO members found</p></>
                  }
                  </Accordion>
              </div>
            )}
            {activeTab === "Clients" && (
              <div className="rounded--box">
                <h5>Clients Settings</h5>
                <hr />
                <Accordion defaultActiveKey={`${Object.keys(memberslist)[0] || ''}`} onSelect={handleSelect}>
                  {
                    memberslist && Object.keys(memberslist).length > 0 ?
                    Object.entries(memberslist).map(([roleSlug, roleData], index) => {
                      return (
                      <>
                      
                        <Accordion.Item eventKey={`${roleSlug}`}>
                          <div className="screens--tabs">
                            <Accordion.Header>
                              <p>
                                <span>{roleData?.name}</span>
                              </p>
                            </Accordion.Header>
                          </div>
                          <Accordion.Body>
                            <h6 class="mb-1">Default Permissions</h6>
                            <p>Default permissions will be applied for the newly added members.</p>
                            <div class="switch-wrapper">
                              <input id={`view-default-${roleData._id}`} key={`view-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('clients','default', roleData._id, 'view')} checked={roleData?.permissions?.clients === 'view'} />
                              <label htmlFor={`view-default-${roleData._id}`}>View</label>
                              <input id={`add-default-${roleData._id}`} key={`add-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('clients','default', roleData._id, 'view_and_edit')} checked={roleData?.permissions?.clients === 'view_and_edit'} />
                              <label htmlFor={`add-default-${roleData._id}`}>Add / Edit / Delete</label>
                            </div>
                              <Table responsive="lg">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                {roleData.members.map((member, i) => (
                                  <tr>
                                    <td>{member?.name}</td>
                                    <td>
                                      <div class="switch-wrapper">
                                        <input id={`client-view-${member._id}`} key={`client-view-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('clients','member', member._id, 'view')} checked={member?.permissions?.clients === 'view'} />
                                        <label htmlFor={`client-view-${member._id}`}>View</label>
                                        <input id={`client-add-${member._id}`} type="radio"  key={`client-add-${member._id}`} name={`member-${member._id}`} onChange={() => handlePermissionChange('clients','member', member._id, 'view_and_edit')} checked={member?.permissions?.clients === 'view_and_edit'} />
                                        <label htmlFor={`client-add-${member._id}`}>Add / Edit / Delete</label>
                                      </div>
                                    </td>
                                  </tr>
                                  ))}
                                </tbody>
                              </Table>
                          </Accordion.Body>
                        </Accordion.Item>
                        </>
                    )})
                    :
                    <> <p>NO members found</p></>
                  }
                  </Accordion>
              </div>
            )}
            {activeTab === "TimeTracking" && (
              <div className="rounded--box">
                <h5>View Time Settings</h5>
                <hr />
                <Accordion defaultActiveKey={`${Object.keys(memberslist)[0] || ''}`} onSelect={handleSelect}>
                  {
                    memberslist && Object.keys(memberslist).length > 0 ?
                    Object.entries(memberslist).map(([roleSlug, roleData], index) => {
                      return (
                      <>
                      
                        <Accordion.Item eventKey={`${roleSlug}`}>
                          <div className="screens--tabs">
                            <Accordion.Header>
                              <p>
                                <span>{roleData?.name}</span>
                              </p>
                            </Accordion.Header>
                          </div>
                          <Accordion.Body>
                            <h6 class="mb-1">Default Permissions</h6>
                            <p>Default permissions will be applied for the newly added members.</p>
                            <div class="switch-wrapper">
                              <input id={`view-default-${roleData._id}`} key={`view-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('tracking','default', roleData._id, 'view')} checked={roleData?.permissions?.tracking === 'view'} />
                              <label htmlFor={`view-default-${roleData._id}`}>View</label>
                              <input id={`add-default-${roleData._id}`} type="radio" key={`add-default--${roleData._id}`} name={`default-${roleSlug}`} onChange={() => handlePermissionChange('tracking','default', roleData._id, 'view_and_edit')} checked={roleData?.permissions?.tracking === 'view_and_edit'}/>
                              <label htmlFor={`add-default-${roleData._id}`}>Add / Edit / Delete</label>
                            </div>
                              <Table responsive="lg">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                {roleData.members.map((member, i) => (
                                  <tr>
                                    <td>{member?.name}</td>
                                    <td>
                                      <div class="switch-wrapper">
                                        <input id={`tracking-view-${member._id}`} key={`tracking-view-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('tracking','member', member._id, 'view')} checked={member?.permissions?.tracking === 'view'} />
                                        <label htmlFor={`tracking-view-${member._id}`}>View</label>
                                        <input id={`tracking-add-${member._id}`} key={`tracking-add-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('tracking','member', member._id, 'view_and_edit')} checked={member?.permissions?.tracking === 'view_and_edit'} />
                                        <label htmlFor={`tracking-add-${member._id}`}>Add / Edit / Delete</label>
                                      </div>
                                    </td>
                                  </tr>
                                  ))}
                                </tbody>
                              </Table>
                          </Accordion.Body>
                        </Accordion.Item>
                        </>
                    )})
                    :
                    <> <p>NO members found</p></>
                  }
                  </Accordion>
              </div>
            )}
            {activeTab === "Members" && (
              <div className="rounded--box">
                <h5>Team Members Settings</h5>
                <hr />
                <Accordion defaultActiveKey={`${Object.keys(memberslist)[0] || ''}`} onSelect={handleSelect}>
                  {
                    memberslist && Object.keys(memberslist).length > 0 ?
                    Object.entries(memberslist).map(([roleSlug, roleData], index) => {
                      return (
                      <>
                      
                        <Accordion.Item eventKey={`${roleSlug}`}>
                          <div className="screens--tabs">
                            <Accordion.Header>
                              <p>
                                <span>{roleData?.name}</span>
                              </p>
                            </Accordion.Header>
                          </div>
                          <Accordion.Body>
                            <h6 class="mb-1">Default Permissions</h6>
                            <p>Default permissions will be applied for the newly added members.</p>
                            <div class="switch-wrapper">
                              <input id={`view-default-${roleData._id}`} key={`view-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('members','default', roleData._id, 'view')} checked={roleData?.permissions?.members === 'view'} />
                              <label htmlFor={`view-default-${roleData._id}`}>View</label>
                              <input id={`add-default-${roleData._id}`} type="radio" key={`add-default--${roleData._id}`} name={`default-${roleSlug}`} onChange={() => handlePermissionChange('members','default', roleData._id, 'view_and_edit')}  checked={roleData?.permissions?.members === 'view_and_edit'}/>
                              <label htmlFor={`add-default-${roleData._id}`}>Add / Edit / Delete</label>
                            </div>
                              <Table responsive="lg">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                {roleData.members.map((member, i) => (
                                  <tr>
                                    <td>{member?.name}</td>
                                    <td>
                                      <div class="switch-wrapper">
                                        <input id={`member-view-${member._id}`} key={`member-view-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('members','member', member._id, 'view')} checked={member?.permissions?.members === 'view'} />
                                        <label htmlFor={`member-view-${member._id}`}>View</label>
                                        <input id={`member-add-${member._id}`} type="radio" key={`member-add-${member._id}`} name={`member-${member._id}`} onChange={() => handlePermissionChange('members','member', member._id, 'view_and_edit')} checked={member?.permissions?.members === 'view_and_edit'} />
                                        <label htmlFor={`member-add-${member._id}`}>Add / Edit / Delete</label>
                                      </div>
                                    </td>
                                  </tr>
                                  ))}
                                </tbody>
                              </Table>
                          </Accordion.Body>
                        </Accordion.Item>
                        </>
                    )})
                    :
                    <> <p>NO members found</p></>
                  }
                  </Accordion>
              </div>
            )}
            {activeTab === "Reports" && (
              <div className="rounded--box">
                <h5>Reports Settings</h5>
                <hr />
                <Accordion defaultActiveKey={`${Object.keys(memberslist)[0] || ''}`} onSelect={handleSelect}>
                  {
                    memberslist && Object.keys(memberslist).length > 0 ?
                    Object.entries(memberslist).map(([roleSlug, roleData], index) => {
                      return (
                      <>
                      
                        <Accordion.Item eventKey={`${roleSlug}`}>
                          <div className="screens--tabs">
                            <Accordion.Header>
                              <p>
                                <span>{roleData?.name}</span>
                              </p>
                            </Accordion.Header>
                          </div>
                          <Accordion.Body>
                            <h6 class="mb-1">Default Permissions</h6>
                            <p>Default permissions will be applied for the newly added members.</p>
                            <div class="switch-wrapper">
                              <input id={`view-default-${roleData._id}`} key={`view-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('reports','default', roleData._id, 'view')} checked={roleData?.permissions?.reports === 'view'} />
                              <label htmlFor={`view-default-${roleData._id}`}>View</label>
                              <input id={`add-default-${roleData._id}`} type="radio" key={`add-default-${roleData._id}`} name={`default-${roleSlug}`} onChange={() => handlePermissionChange('reports','default', roleData._id, 'view_and_edit')}  checked={roleData?.permissions?.reports === 'view_and_edit'} />
                              <label htmlFor={`add-default-${roleData._id}`}>Add / Edit / Delete</label>
                            </div>
                              <Table responsive="lg">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                {roleData.members.map((member, i) => (
                                  <tr>
                                    <td>{member?.name}</td>
                                    <td>
                                      <div class="switch-wrapper">
                                        <input id={`report-view-${member._id}`} key={`report-view-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('reports','member', member._id, 'view')} checked={member?.permissions?.reports === 'view'} />
                                        <label htmlFor={`report-view-${member._id}`}>View</label>
                                        <input id={`report-add-${member._id}`} type="radio" key={`report-add-${member._id}`} name={`member-${member._id}`} onChange={() => handlePermissionChange('reports','member', member._id, 'view_and_edit')} checked={member?.permissions?.reports === 'view_and_edit'} />
                                        <label htmlFor={`report-add-${member._id}`}>Add / Edit / Delete</label>
                                      </div>
                                    </td>
                                  </tr>
                                  ))}
                                </tbody>
                              </Table>
                          </Accordion.Body>
                        </Accordion.Item>
                        </>
                    )})
                    :
                    <> <p>NO members found</p></>
                  }
                  </Accordion>
              </div>
            )}
            {activeTab === "Holidays" && (
              <div className="rounded--box">
                <h5>Holidays Settings</h5>
                <hr />
                <Accordion defaultActiveKey={`${Object.keys(memberslist)[0] || ''}`} onSelect={handleSelect}>
                  {
                    memberslist && Object.keys(memberslist).length > 0 ?
                    Object.entries(memberslist).map(([roleSlug, roleData], index) => {
                      return (
                      <>
                      
                        <Accordion.Item eventKey={`${roleSlug}`}>
                          <div className="screens--tabs">
                            <Accordion.Header>
                              <p>
                                <span>{roleData?.name}</span>
                              </p>
                            </Accordion.Header>
                          </div>
                          <Accordion.Body>
                            <h6 class="mb-1">Default Permissions</h6>
                            <p>Default permissions will be applied for the newly added members.</p>
                            <div class="switch-wrapper">
                              <input id={`view-default-${roleData._id}`} key={`view-default-${roleData._id}`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('holidays','default', roleData._id, 'view')} checked={roleData?.permissions?.holidays === 'view'} />
                              <label htmlFor={`view-default-${roleData._id}`}>View</label>
                              <input id={`add-default-${roleData._id}`} type="radio" key={`add-default-${roleData._id}`} name={`default-${roleSlug}`} onChange={() => handlePermissionChange('holidays','default', roleData._id, 'view_and_edit')} checked={roleData?.permissions?.holidays === 'view_and_edit'} />
                              <label htmlFor={`add-default-${roleData._id}`}>Add / Edit / Delete</label>
                            </div>
                              <Table responsive="lg">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                {roleData.members.map((member, i) => (
                                  <tr>
                                    <td>{member?.name}</td>
                                    <td>
                                      <div class="switch-wrapper">
                                        <input id={`holiday-view-${member._id}`} key={`holiday-view-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('holidays','member', member._id, 'view')} checked={member?.permissions?.holidays === 'view'} />
                                        <label htmlFor={`holiday-view-${member._id}`}>View</label>
                                        <input id={`holiday-add-${member._id}`} type="radio" key={`holiday-add-${member._id}`} name={`member-${member._id}`} onChange={() => handlePermissionChange('holidays','member', member._id, 'view_and_edit')} checked={member?.permissions?.holidays === 'view_and_edit'} />
                                        <label htmlFor={`holiday-add-${member._id}`}>Add / Edit / Delete</label>
                                      </div>
                                    </td>
                                  </tr>
                                  ))}
                                </tbody>
                              </Table>
                          </Accordion.Body>
                        </Accordion.Item>
                        </>
                    )})
                    :
                    <> <p>NO members found</p></>
                  }
                  </Accordion>
              </div>
            )}
            {activeTab === "Attendance" && (
              <div className="rounded--box">
                <h5>Attendance Settings</h5>
                <hr />
                <Accordion defaultActiveKey={`${Object.keys(memberslist)[0] || ''}`} onSelect={handleSelect}>
                  {
                    memberslist && Object.keys(memberslist).length > 0 ?
                    Object.entries(memberslist).map(([roleSlug, roleData], index) => {
                      return (
                      <>
                      
                        <Accordion.Item eventKey={`${roleSlug}`}>
                          <div className="screens--tabs">
                            <Accordion.Header>
                              <p>
                                <span>{roleData?.name}</span>
                              </p>
                            </Accordion.Header>
                          </div>
                          <Accordion.Body>
                            <h6 class="mb-1">Default Permissions</h6>
                            <p>Default permissions will be applied for the newly added members.</p>
                            <div class="switch-wrapper">
                              <input id={`view-default`} key={`view-default`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('attendance','default', roleData._id, 'view')} checked={roleData?.permissions?.attendance === 'view'} />
                              <label htmlFor={`view-default`}>View</label>
                              <input id={`add-default`} type="radio" name={`default-${roleSlug}`} onChange={() => handlePermissionChange('attendance','default', roleData._id, 'view_and_edit')} checked={roleData?.permissions?.attendance === 'view_and_edit'} />
                              <label htmlFor={`add-default`}>Add / Edit / Delete</label>
                            </div>
                              <Table responsive="lg">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                {roleData.members.map((member, i) => (
                                  <tr>
                                    <td>{member?.name}</td>
                                    <td>
                                      <div class="switch-wrapper">
                                        <input id={`view-${member._id}`} key={`view-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('attendance','member', member._id, 'view')} checked={member?.permissions?.attendance === 'view'} />
                                        <label htmlFor={`view-${member._id}`}>View</label>
                                        <input id={`add-${member._id}`} type="radio" name={`member-${member._id}`} onChange={() => handlePermissionChange('attendance','member', member._id, 'view_and_edit')} checked={member?.permissions?.attendance === 'view_and_edit'} />
                                        <label htmlFor={`add-${member._id}`}>Add / Edit / Delete</label>
                                      </div>
                                    </td>
                                  </tr>
                                  ))}
                                </tbody>
                              </Table>
                          </Accordion.Body>
                        </Accordion.Item>
                        </>
                    )})
                    :
                    <> <p>NO members found</p></>
                  }
                  </Accordion>
              </div>
            )}
            {
              show &&
            
              <Modal show={show} onHide={() => setShow( false )}>
                <Modal.Header closeButton>
                  <Modal.Title>Add New Role</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                <div className="project--form">
                <div className="project--form--inputs">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="roleName">
                      <FloatingLabel label="Role Name *">
                          <Form.Control type="text" name="name" value={fields?.name}
                          onChange={(e) => {
                            setFields({...fields, ['name']: e.target.value})
                            setErrors({ ...errors, ['name']: '' })
                          }} disabled={loader} />
                      </FloatingLabel>
                      
                      {showError('name')}
                    </Form.Group>
                       
                    <h5 className="mt-4">Permissions</h5>

                    {['projects', 'clients', 'tasks', 'holidays', 'tracking', 'reports'].map((module) => (
                      <Form.Group key={module} controlId={`permissions-${module}`}>
                        <Form.Label>{module.charAt(0).toUpperCase() + module.slice(1)}</Form.Label>
                        <Form.Select className="form-control custom-selectbox"
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
                      {loader ? 'Please wait...': 'Save Role'}
                    </Button>
                  </Form>
                  </div>
                  </div>
                </Modal.Body>
              </Modal>
            }
          </div>
        </div>
    </>
  );
}

export default PermissionsPage;