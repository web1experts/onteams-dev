import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, ListGroup, Table, Dropdown } from "react-bootstrap";
import { FaChevronDown, FaPlus, FaList, FaRegTrashAlt, FaRegCalendarAlt, FaCog } from "react-icons/fa";
import { MdFileDownload, MdFilterList, MdOutlineClose, MdSearch, MdOutlineCancel } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { BsGrid } from "react-icons/bs";
import { ListProjects, createProject, updateProject, deleteProject, reorderedProject } from "../../redux/actions/project.action"
import { Listmembers } from "../../redux/actions/members.action";
import { formatStatus } from "../../utils/common";
import { StatusModal, MemberModal, WorkFlowModal, FilesModal, FilesPreviewModal } from "../modals";
import { ListClients } from "../../redux/actions/client.action";
import AddClient from "../Clients/AddClient";
import { getFieldRules, validateField } from "../../helpers/rules";
import { AlertDialog } from "../modals";
import { selectboxObserver, getMemberdata } from "../../helpers/commonfunctions";
import SingleProject from "./singleProject";
import { TaskForm } from "../Tasks/taskform";
import TasksList from "../Tasks/list";
import { togglePopups, updateStateData } from "../../redux/actions/common.action";
import { MemberInitials } from "../common/memberInitials";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.snow.css';
import AutoLinks from "quill-auto-links";
import { socket } from "../../helpers/auth";
import ProjectDatePicker from "../Datepickers/projectDatepicker";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ALL_MEMBERS, ACTIVE_FORM_TYPE, PROJECT_FORM, RESET_FORMS, CURRENT_PROJECT, ALL_CLIENTS, ASSIGN_MEMBER, DIRECT_UPDATE } from "../../redux/actions/types";
Quill.register("modules/autoLinks", AutoLinks);
function ProjectsPage() {
    const [isActiveView, setIsActiveView] = useState(2);
    const dispatch = useDispatch();
    const memberdata = getMemberdata()
    const [projects, setProjects] = useState([]);
    const [filters, setFilters] = useState({})
    const [fields, setFields] = useState({ title: '', status: 'in-progress', members: [] });
    const [errors, setErrors] = useState({ title: '' });
    const [loader, setLoader] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedMembers, setselectedMembers] = useState([]);
    const projectFeed = useSelector(state => state.project.projects);
    const apiResult = useSelector(state => state.project);
    const clientFeed = useSelector(state => state.client.clients);
    const apiClient = useSelector(state => state.client)
    const memberFeed = useSelector((state) => state.member.members);
    const commonState = useSelector(state => state.common)
    const projectform = useSelector( state => state.common.projectForm)
    const [clientlist, setClientList] = useState([])
    const [members, setMembers] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [isEdit, setIsEdit] = useState(false)
    const [total, setTotal] = useState(0)
    const [isActive, setIsActive] = useState(0);
    const [currentProject, setCurrentProject] = useState({})
    const [showdialog, setShowDialog] = useState(false);
    const [allMembers, setAllmembers] = useState([{ value: 'all', label: 'All Members' }])
    const [spinner, setSpinner] = useState(false)
    let fieldErrors = {};
    const quillRef = useRef(null);
    const pasteOccurred = useRef(false);
    let active = 2;
    const workflowstate = useSelector(state => state.workflow)
    const modules = {
        toolbar: [
          [{ 'header': '1'}, {'header': '2'}],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'}, 
           {'indent': '-1'}, {'indent': '+1'}],
           ['link'],
        ],
        clipboard: {
          // toggle to add extra line breaks when pasting HTML:
          matchVisual: false,
        },
        autoLinks: true
      };

      const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link'
      ];
      
    useEffect(() => {
        selectboxObserver()
        dispatch(updateStateData(PROJECT_FORM, { title: '', status: 'in-progress', members: [] }))
    }, [dispatch]);
    useEffect(() => {
        if (clientFeed && clientFeed.clientData && clientFeed.clientData.length > 0) {
            setClientList(clientFeed.clientData)
            dispatch(updateStateData(ALL_CLIENTS, clientFeed.clientData))
        }
    }, [clientFeed, dispatch])

    useEffect(() => {
        if (apiClient.createClient) {
            setFields({ ...fields, client: apiClient.createClient })
            handleChange({ target: { name: 'client', value: apiClient.createClient } });
            setTimeout(function () {
                selectboxObserver()
            }, 200)
        }
    }, [apiClient]);

    useEffect(() => {
        if (commonState.selectedMembers) {
            setselectedMembers(commonState.selectedMembers)
        }
    }, [commonState.selectedMembers])

    useEffect(() => { 
        if (commonState.projectForm) {
            setFields(prevFields => {
                const updatedFields = {
                    ...prevFields, // Retain the existing properties of fields
                    ...commonState.projectForm // Merge properties from commonState.projectForm
                };
            
                // Log updated fields for debugging
                // console.log("Updated Fields:", updatedFields);
            
                return updatedFields; // Return the new state
            });
            
        }
    }, [projectform]);
    


    // Function to remove the last member
    // const removeMember = (member) => {
    //     delete fields['members'][member]
    //     dispatch(updateStateData(PROJECT_FORM, { members: fields['members'] || {} }))
    // };

    const [isdescEditor, setIsDescEditor] = useState(false);
    const [isTaskEditor, setIsTaskEditor] = useState(false);
    const handleTaskEditor = event => {
        setIsTaskEditor(current => !current);
    };

    const [activeTab, setActiveTab] = useState('GridView');
    const [activeSubTab, setActiveSubTab] = useState('Grid');

    const [show, setShow] = useState(false);
    const handleClose = () => {
        setFields({ title: '', status: 'in-progress', members: [] })
        if( isActive === 2 || isActive === 1){
            dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project'))
        }else{
            dispatch(updateStateData(ACTIVE_FORM_TYPE, null))
        }
        
        dispatch(updateStateData(RESET_FORMS))
        setSelectedFiles([])
        setselectedMembers([])
        setImagePreviews([])
        setShow(false);
    }
    const handleShow = async (type) => {
       
        await dispatch(updateStateData(ACTIVE_FORM_TYPE, 'project'))
        await dispatch(updateStateData(RESET_FORMS, 'project'))
        setFields({ title: '', status: 'in-progress', members: [] })
        await dispatch(updateStateData(PROJECT_FORM, { title: '', status: 'in-progress', members: [] }))
        if (type === "new") {
            if( isActive !== 2 && isActive !== 1){
                setCurrentProject({})
            }
            
            setselectedMembers({})
            setImagePreviews([])

        }
        setShow(true);
    }

    const handleStatusClose = () => dispatch(togglePopups('status', false));
    const handleStatusShow = () => dispatch(togglePopups('status', true));
    const selectedStatus = useSelector(state => state.common.selectedStatus)

    const [showClient, setClientShow] = useState(false);
    const handleClientClose = () => setClientShow(false);
    const handleClientShow = () => setClientShow(true);
    const handleWorkflowClose = () => dispatch(togglePopups('workflow', false));
    const handleWorkflowShow = () => dispatch(togglePopups('workflow', true));
    const [showUpload, setUploadShow] = useState(false);
    const handleUploadClose = () => {
        setUploadShow(false);
    }
    const handleUploadShow = () => dispatch(togglePopups('files', true)) //setUploadShow(true);
    const [showDelete, setDeleteShow] = useState(false);
    const handleDeleteClose = () => setDeleteShow(false);
    const [showFilter, setFilterShow] = useState(false);
    const handleFilterClose = () => setFilterShow(false);
    const handleFilterShow = () => setFilterShow(true);

    const [showSearch, setSearchShow] = useState(false);
    const handleSearchClose = () => setSearchShow(false);
    const handleSearchShow = () => setSearchShow(true);
    const [filetoPreview, setFiletoPreview] = useState(null);
    const [showPreview, setPreviewShow] = useState(false);
    const handlePreviewClose = () => setPreviewShow(false);
    const [ datepickerShow , setDateshow] = useState(false)
    const handlePreviewShow = (file) => {
        setFiletoPreview(file)
        setPreviewShow(true)
    };

    useEffect(() => {
        if (currentProject && Object.keys(currentProject).length > 0 && isActive !== 2) {
            handleStatusClose()
            dispatch(updateProject(currentProject._id, { status: selectedStatus }))
        } else {
            setFields({ ...fields, ['status']: selectedStatus });
            handleStatusClose()
        }
    }, [selectedStatus, dispatch]);

    const handleListProjects = async () => {
        let selectedfilters = { currentPage: currentPage }
        if (Object.keys(filters).length > 0) {
            selectedfilters = { ...selectedfilters, ...filters }
        }
        await dispatch(ListProjects(selectedfilters));
        setSpinner(false)
    }

    useEffect(() => {
        dispatch(Listmembers(0, '', false));
        dispatch(ListClients());
    }, [])


    useEffect(() => { 
        if (commonState.projectForm.images?.length > 0) {
            const selectedFiles = commonState.projectForm.images
            const previews = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileExtension = selectedFiles[i].name.split('.').pop().toLowerCase();
                    previews.push({
                        src: e.target.result,
                        file: selectedFiles[i],
                        mimetype: fileExtension,
                        filename: selectedFiles[i].name,
                        _id: i
                    });
                    if (previews.length === selectedFiles.length) {
                        setImagePreviews(previews);
                    }
                };
                reader.readAsDataURL(selectedFiles[i]);
            }
        } else {
            const { images, ...updatedFields } = fields;
            setFields(updatedFields);
        }
    }, [projectform.images])

    const handleRemove = (indexToRemove) => {
        // Filter out the file to remove from both selectedFiles and imagePreviews
        const selectedFiles = commonState.projectForm.images
        const updatedSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
        // setSelectedFiles(updatedSelectedFiles);
        dispatch(updateStateData(PROJECT_FORM, { images: updatedSelectedFiles }))
        setImagePreviews(updatedImagePreviews);
    };

    useEffect(() => {
        setProjects([])
        handleListProjects()
        setSpinner(true)

    }, [])

    useEffect(() => {
        if (currentPage > 0) {
            setProjects([])
            handleListProjects()
            setSpinner(true)
        }
    }, [currentPage])

    useEffect(() => {
        if (Object.keys(filters).length > 0 && !showFilter) {
            handleListProjects()
        }
    }, [filters])

    const dofilters = () => {
        handleListProjects()
        handleFilterClose()
        selectboxObserver()
    }

    const handleChange = ({ target: { name, value, type, files } }) => {
        setFields({...fields, [name]: value})
        dispatch(updateStateData(PROJECT_FORM, { [name]: value }))
        setErrors({ ...errors, [name]: '' })
    };

    const handlefilterchange = (name, value) => {
        if (name === "search" && value === "" || name === "search" && value.length > 1 || name !== "search") {
            setFilters({ ...filters, [name]: value })
        }
    }

    useEffect(() => {
        if (memberFeed && memberFeed.memberData) {
            dispatch(updateStateData(ALL_MEMBERS, memberFeed.memberData))
            setMembers(memberFeed.memberData);
            const memberarray = [{ value: 'all', label: 'All Members' }]
            memberFeed.memberData.forEach(member => {
                memberarray.push({ value: member._id, label: member.name })
            });
            setAllmembers(memberarray)
        }
    }, [memberFeed, dispatch]);

    useEffect(() => {
        const check = ['undefined', undefined, 'null', null, '']
        if (projectFeed && projectFeed.projectData) {
            setProjects(projectFeed.projectData)
            setTotal(projectFeed.total)
        }
    }, [projectFeed])

  

    const showError = (name) => {
        if (errors[name]) return (<span className="error">{errors[name]}</span>)
        return null
    }

    const handleSubmit = async (e) => { 
        e.preventDefault();
        setLoader(true)
        const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
            // Get rules for the current field
            const rules = getFieldRules('project', fieldName);
            // Validate the field
            const error = await validateField('project', fieldName, value, rules);
            // If error exists, return it as part of the resolved promise
            return { fieldName, error };
        });

        // Wait for all promises to resolve
        const updatedErrorsArray = await Promise.all(updatedErrorsPromises);
        updatedErrorsArray.forEach(({ fieldName, error }) => {
            if (error) {
                fieldErrors[fieldName] = error;
            }
        });
        // Check if there are any errors
        const hasError = Object.keys(fieldErrors).length > 0;
        // If there are errors, update the errors state
        if (hasError) {
            setLoader(false)
            setErrors(fieldErrors);
        } else {
            const formData = new FormData();
            for (const [key, value] of Object.entries(fields)) {
                if (typeof value === 'object' && key === 'images') {
                    value.forEach(attach => {
                       
                        formData.append('images[]', attach);
                    });
                } else if (typeof value === 'object' && key === 'members') {
                    const memberids = Object.keys(fields['members'])
                    memberids.forEach(item => {
                        formData.append(`members[]`, item); // Append with the same key for non-empty arrays
                    });
                } else if (Array.isArray(value)) { // Check if the value is an array
                    if (value.length === 0) {
                        formData.append(`${key}[]`, []); // Append an empty array
                    } else {
                        value.forEach(item => {
                            formData.append(`${key}[]`, item); // Append with the same key for non-empty arrays
                        });
                    }
                } else if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, value)
                }
            }
            let payload = formData;

            
            await dispatch(createProject(payload))
            setLoader(false)
            
        }
    }

    const handledeleteProject = () => {
        dispatch(deleteProject(currentProject._id))
    }

    const viewTasks = () => {
        if (isActive) {
            return true;
        }
    }

    useEffect(() => {
        // Example: Set currentProject initially if not already set
        if (currentProject && projects.length > 0 && Object.keys(currentProject).length > 0) {
            let found = false;
            let hasopened = false;
            projects.forEach((p, inx) => {
                if (p._id === currentProject._id) {
                    found = true;
                    hasopened = true;
                    setCurrentProject(p);
                    dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project'))
                    return;
                }
            })
            if (hasopened === false) {
                setIsActive(0)
            }
            if( found === false ){
                setCurrentProject({})
            }
        }
    }, [projects]);

    useEffect(() => {
        if (apiResult.deletedProject) {
            setIsActive(0)
            setCurrentPage({})
        }

        if (apiResult.success) {
            setIsDescEditor( false )
            setFields({ title: '', status: 'in-progress', members: [] })
            handleClose()
            setSelectedFiles([]);
            setImagePreviews([]);
            setShowDialog(false)
            handleListProjects()
        }

        socket.on('refreshProjects', function(msg){ 
            if (apiResult.success || apiResult.deletedProject || apiResult.successfull) {
                handleListProjects()
            }
       });

    }, [apiResult])

    const handleRemovefiles = (id) => {
        let previousfiles = fields['files']
        const updatedFiles = previousfiles.filter(file => file !== id);
        setFields({ ...fields, ['files']: updatedFiles })
    }

    const handleDateclose = useCallback(() => {
        setDateshow(false);
    }, []); // Empty dependency array means this function is memoized and won't change across renders


    const renderPreview = (type, preview, index) => {
       
        const { src, _id } = preview;
        const mimetype = (preview.mimetype) ? preview.mimetype : src.split('.').pop().toLowerCase();
        const previewComponents = {
            image: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            video: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            pdf: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
            other: (
                <div className="preview--cell">
                    <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                    {
                        type !== "new" &&
                        <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                    }
                    <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
                </div>
            ),
        };

        if (["jpg", "jpeg", "png", "webp"].includes(mimetype)) {
            return previewComponents.image;
        } else if (mimetype === "mp4") {
            return previewComponents.video;
        } else if (mimetype === "pdf") {
            return previewComponents.pdf;
        } else {
            return previewComponents.other;
        }

        return null;
    };

    useEffect(() => {
        if (currentProject && Object.keys(currentProject).length > 0) {

            dispatch(updateStateData(CURRENT_PROJECT, currentProject))
        }
    }, [currentProject]);

    const handleProjectChange = (project) => {
        dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project'))
        setCurrentProject(project)
    }


    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;
    
        // If there's no destination (i.e., the item was dropped outside), do nothing
        if (!destination) return;
    
        const projectId = draggableId.split('-')[1]; // Extract task ID from draggableId
        const sourceTabId = source.droppableId.split('-')[1]; // Get source tab ID
        const destinationTabId = destination.droppableId.split('-')[1]; // Get destination tab ID
    
        // Clone the projects array to avoid mutating the state directly
        let reorderedProjects = [...projects];
    
        if (sourceTabId === destinationTabId) {
            // If the task was moved within the same tab, reorder the tasks
            const [removed] = reorderedProjects.splice(source.index, 1); // Remove task from the source position
            reorderedProjects.splice(destination.index, 0, removed); // Insert task to the destination position
        } else {
            // Task was moved to a different tab (if needed, handle cross-tab logic here)
            const [removed] = reorderedProjects.splice(source.index, 1); // Remove from source tab
            reorderedProjects.splice(destination.index, 0, removed); // Add to destination tab
        }
    
        // Generate a list of newly ordered projects
        const newOrder = reorderedProjects.map((project, index) => ({
            project_id: project._id, // Adjust this if your project ID key is different
            order: index
        }));
        
        // Dispatch the action with the new order
        dispatch(reorderedProject({ projects: newOrder, filters: filters }));
    
        // Update the state with reordered projects
        setProjects(reorderedProjects);
    };
    

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            pasteOccurred.current = true; // Mark that a paste action is expected
            console.log('Paste keyboard shortcut detected');
        }
    };

    const handleRowDoubleClick = ( project, index ) => { console.log('index is: ', index)
        
        if( project.marked_by && project.marked_by.includes(memberdata._id)){
            setProjects((prevProjects) => {
                // Create a new array from the previous projects
                const updatedProjects = [...prevProjects];
              
                // Access the project at index 1
                const projectToUpdate = updatedProjects[index];
              
                if (projectToUpdate) {
                  // Remove the memberId from the marked_by array
                  const updatedMarkedBy = projectToUpdate.marked_by.filter(id => id !== memberdata._id);
              
                  // Update the project's marked_by column
                  updatedProjects[index] = {
                    ...projectToUpdate,
                    marked_by: updatedMarkedBy,
                  };
                  console.log('project to update:: ', {
                    ...projectToUpdate,
                    marked_by: updatedMarkedBy,
                  })
                }
              
                return updatedProjects; // Return the updated projects array
              });
            dispatch(updateProject(project._id, { marked: false }))
        }else{
            dispatch(updateProject(project._id, { marked: true }))
        }
        
    }

    const handlePaste = (e) => {
        const pastedData = e.clipboardData.getData('text');
        console.log('Pasted content:', pastedData);
        pasteOccurred.current = true; // Set the paste flag to true

        setTimeout(function(){
            pasteOccurred.current = false;
        },500)
    };

    useEffect(() => {
        // Add the paste listener to the editor
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.root.addEventListener('paste', handlePaste);
        }
    
        // Cleanup the event listener on unmount
        return () => {
          if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.root.removeEventListener('paste', handlePaste);
          }
        };
      }, []);


    return (
        <>
            <div className={isActive === 1 ? 'show--details team--page' : isActive === 2 ? ' view--project team--page' : 'team--page'}>
                <div className='page--title px-md-2 pt-3'>
                    <Container fluid>
                        <Row>
                            <Col sm={12} lg={12}>
                                <h2>Projects
                                    <Button variant="primary" className={isActive !== 0 ? 'd-flex ms-auto' : 'd-lg-none ms-auto'} onClick={handleSearchShow}><MdSearch /></Button>
                                    <Button variant="primary" className={isActive !== 0 ? 'd-flex' : 'd-lg-none'} onClick={handleFilterShow}><MdFilterList /></Button>
                                    <Button variant="primary" onClick={() => handleShow('new')}><FaPlus /></Button>
                                    <ListGroup horizontal className={isActive !== 0 ? 'd-none' : 'ms-auto d-none d-lg-flex'}>
                                        <ListGroup.Item key="member-filter-list">
                                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('member', event.target.value)} value={filters['member'] || 'all'}>
                                                <option value={memberdata?._id}>My Projects</option>
                                                {
                                                    allMembers.map((member, index) => {
                                                        return <option key={`member-projects-${index}`} value={member.value}>{member.label}</option>
                                                    })
                                                }
                                                <option value="unassigned">Unassigned</option>
                                            </Form.Select>
                                        </ListGroup.Item>
                                        <ListGroup.Item key="status-filter-list">
                                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('status', event.target.value)} value={filters['status'] || 'all'}>
                                                <option value="all">View All</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="on-hold">On Hold</option>
                                                <option value="completed">Completed</option>
                                            </Form.Select>
                                        </ListGroup.Item>
                                        <ListGroup.Item key="search-filter-list">
                                            <Form>
                                                <Form.Group className="mb-0 form-group">
                                                    <Form.Control type="text" placeholder="Search by Project or Client" onChange={(event) => handlefilterchange('search', event.target.value)} />
                                                </Form.Group>
                                            </Form>
                                        </ListGroup.Item>
                                        <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                                        <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
                                    </ListGroup>
                                </h2>
                                <ListGroup horizontal className={isActive ? 'd-none' : 'd-none d-lg-none mt-3 mt-xl-0'}>
                                    <ListGroup.Item action className="view--icon" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                                    <ListGroup.Item action className="view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
                                </ListGroup>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div className='page--wrapper px-md-2 py-3'>
                    {
                        spinner &&
                        <div className="loading-bar">
                            <img src="images/OnTeam-icon-gray.png" className="flipchar" />
                        </div>
                    }
                    <Container fluid>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Table responsive="xl" className={isActiveView === 1 ? 'project--grid--table' : isActiveView === 2 ? 'project--table draggable--table' : 'project--table'}>
                                <thead>
                                    <tr key="project-table-header">
                                        {/* <th scope="col" width={20} key="project-hash-header">#</th> */}
                                        <th scope="col" width='20%' key="project-name-header"><abbr>#</abbr> Project Name</th>
                                        <th scope="col" width='20%' key="project-client-header" className="onHide">Client Name</th>
                                        <th scope="col" width='30%' key="project-member-header" className="onHide">Assigned Members</th>
                                        <th scope="col" key="project-status-header" className="onHide">Status</th>
                                        <th scope="col" width='25%' key="project-action-header" className="onHide text-md-end">Actions</th>
                                    </tr>
                                </thead>
                                <Droppable droppableId={`droppable-project-table`} type="PROJECTS">
                                            {(provided) => (
                                        <tbody 
                                            id={`projectable-body`}
                                            className="projects--list"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{ overflowY: 'auto', height: '100%' }}>
                                            {
                                                (!spinner && projects && projects.length > 0)
                                                ? projects.map((project, index) => {
                                                    return (<>
                                                        <Draggable
                                                            key={project?._id}
                                                            draggableId={`project-${project?._id}`}
                                                            index={index}
                                                        >
                                                            {(provided) => (
                                                                <tr ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps} 
                                                                    onDoubleClick={(event) => {
                                                                        if( event.target.classList.contains('marked-project')){
                                                                            event.currentTarget.classList.remove('marked-project')
                                                                             
                                                                        }else{
                                                                            event.currentTarget.classList.add('marked-project')
                                                                        }
                                                                        
                                                                         handleRowDoubleClick(project, index)
                                                                    }}
                                                                    key={`project-row-${project._id}`} onClick={() => { handleProjectChange(project) }} className={`${project._id === currentProject?._id ? 'project--active' : ''} ${
                                                                        project.marked_by && project.marked_by.includes(memberdata._id) ? 'marked-project' : ''
                                                                      }`}>
                                                                    <td className="project--title--td" key={`title-index-${index}`} data-label="Project Name" onClick={viewTasks}><span><abbr key={`index-${index}`}>{index + 1}.</abbr> {project.title}</span></td>
                                                                    <td key={`cname-index-${index}`} data-label="Client Name" className="onHide">{project.client?.name || <span className='text-muted'>__</span>}</td>
                                                                    <td key={`amember-index-${index}`} data-label="Assigned Member" className="onHide member--circles">
                                                                        <MemberInitials directUpdate={true} key={`MemberNames-${index}-${project._id}`} members={project.members} showRemove={true} showAssignBtn={true} postId={project._id} type = "project" 
                                                                        // onMemberClick={(memberid, extraparam = false) => handleRemoveMember(project, memberid, `member--${project._id}-${memberid}`)} 
                                                                        />
                                                                    </td>
                                                                    <td key={`status-index-${index}`} data-label="Status" className="onHide">
                                                                        <Dropdown className="select--dropdown" key='status-key'>
                                                                            <Dropdown.Toggle onClick={() => {dispatch(updateStateData(DIRECT_UPDATE, true));handleStatusShow()}} variant={`${project.status === 'in-progress' ? 'warning' : project.status === 'on-hold' ? 'secondary' : project.status === 'completed' ? 'success' : ''}`}>{formatStatus(project.status || "in-progress")}</Dropdown.Toggle>
                                                                        </Dropdown>
                                                                    </td>
                                                                    <td key={`actions-index-${index}`} data-label="Actions" className="onHide text-md-end">
                                                                        <Button variant="outline-primary" onClick={() => setIsActive(1)}>Tasks</Button>
                                                                        <Button variant="outline-primary" className="ms-2" onClick={() => setIsActive(2)}>View</Button>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </Draggable>
                                                    </>)
                                                })
                                                :

                                                !spinner && isActiveView === 2 &&
                                                <>
                                                    <tr key={`noresults-row`} className="no--invite">
                                                        <td key={`empty-index`} colSpan={9} className="text-center">
                                                            <h2 className="mt-2 text-center">No Projects Found</h2>
                                                        </td>
                                                    </tr>
                                                </>
                                            }
                                        </tbody>
                                    )}
                                    </Droppable>
                            </Table>
                        </DragDropContext>
                        {
                            isActiveView === 1 && !spinner && projects && projects.length == 0 &&
                            <div className="text-center mt-5">
                                <h2>No Projects Found</h2>
                            </div>
                        }
                    </Container>
                </div>
            </div>
            <div className="details--projects--grid projects--grid">
                <div className="wrapper--title">
                    <div className="projecttitle">
                        <h3>
                            <strong>{currentProject?.title}</strong>
                            <span>{currentProject?.client?.name}</span>
                        </h3>
                    </div>
                    <ListGroup horizontal className="members--list me-md-0 me-xl-auto ms-auto ms-md-2 d-none d-xxl-flex">
                        <ListGroup.Item key={`memberskey`} className="me-3">Members</ListGroup.Item>
                        {
                            <MemberInitials directUpdate={true} key={`MemberNames-header-${currentProject?._id}`} showRemove={true} members={currentProject?.members || []} showAssignBtn={true} postId={currentProject?._id} type = "project"
                            //  onMemberClick={(memberid, extraparam = false) => handleRemoveMember(currentProject, memberid, `remove-member-${currentProject._id}-${memberid}`)}
                            />
                        }
                    </ListGroup>
                    <ListGroup horizontal className="ms-auto ms-xl-0 mt-0 mt-md-0">
                        <Button variant="outline-primary" className="active btn--view d-none d-lg-flex" onClick={() => { setIsActive(1); }}>Tasks</Button>
                        <Button variant="outline-primary" className="btn--view d-none d-lg-flex" onClick={() => setIsActive(2)}>View</Button>
                        <ListGroup.Item className="d-none d-lg-flex" key={`settingskey`} onClick={() => { dispatch(updateStateData(DIRECT_UPDATE, true));dispatch( togglePopups('workflow', true))}}><FaCog /></ListGroup.Item>
                        <ListGroup.Item key={`gridview`} className="gridView ms-1" action active={activeTab === 'GridView'} onClick={() => setActiveTab('GridView')}><BsGrid /></ListGroup.Item>
                        <ListGroup.Item key={`listview`} className="ListView ms-1" action active={activeTab === 'ListView'} onClick={() => setActiveTab('ListView')}><FaList /></ListGroup.Item>
                        <ListGroup.Item key={`closekey`} onClick={() => setIsActive(0)}><MdOutlineClose /></ListGroup.Item>
                    </ListGroup>
                </div>
                <TasksList activeTab={activeTab} currentProject={currentProject} />
            </div>

            <SingleProject key={`single-project-view-${currentProject?._id}`} currentProject={currentProject} clientlist={clientlist} members={members} closeview={setIsActive} />
            <TaskForm />
            <Modal show={show} onHide={handleClose} centered size="lg" className="add--member--modal modalbox" onShow={() => selectboxObserver()}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="project--form">
                        <div className="project--form--inputs">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-0 form-group">
                                    <FloatingLabel label="Project Title *">
                                        <Form.Control type="text" name="title" placeholder="Project Title" value={fields['title'] || ""} onChange={handleChange} />
                                    </FloatingLabel>
                                    {showError('title')}
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label>
                                        <small>Status</small>
                                        <div className="status--modal" onClick={handleStatusShow}>
                                            <span className={`${fields['status'] === 'in-progress' ? 'progress--circle' : fields['status'] === 'on-hold' ? 'hold--circle' : fields['status'] === 'completed' ? 'complete--circle' : ''} status--circle`}></span> {fields['status']?.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} <FaChevronDown />
                                        </div>
                                    </Form.Label>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label><small>Client</small></Form.Label>
                                    <div className="client--input">
                                        <Form.Select className="form-control custom-selectbox" placeholder="Select Client" id="client-select" name="client" onChange={handleChange} value={fields['client'] || ''}>
                                            <option value="none">None</option>
                                            {
                                                clientlist && clientlist.length > 0 &&
                                                clientlist.map((client, index) => {
                                                    return <option key={client._id} value={client._id}>{client.name}</option>
                                                })
                                            }
                                        </Form.Select>
                                        <Button variant="primary" onClick={handleClientShow}><FaPlus /> Clients</Button>
                                    </div>
                                    <AddClient show={showClient} toggleshow={handleClientClose} />
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label>
                                        <small>Workflow</small>
                                        <div className="workflow--modal" onClick={(handleWorkflowShow)}>
                                            <span className="workflow--selected">{fields['workflow']?.title ? fields['workflow']?.title  : workflowstate?.workflows?.[0]?.title || 'Select' } <FaChevronDown /></span>
                                        </div>
                                    </Form.Label>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label className="w-100 m-0">
                                        <small>Description</small>
                                        {
                                            !isdescEditor &&
                                            <strong className="add-descrp" onClick={setIsDescEditor}><FiFileText /> Add a description</strong>
                                        }
                                    </Form.Label>
                                    <div className={isdescEditor ? 'text--editor show--editor' : 'text--editor'}>
                                            
                                            <ReactQuill 
                                                value={fields['description'] || ''}
                                                onChange={(value) => {
                                                    setFields({...fields, ['description']: value})
                                                    setErrors({ ...errors, ['description']: '' });

                                                    setTimeout(() => {
                                                        dispatch(updateStateData(PROJECT_FORM, { ['description']: value }))
                                                    },800)
                                                }}
                                                formats={formats} 
                                                modules={modules}
                                                onKeyDown={handleKeyDown}
                                                ref={quillRef}
                                            />
                                            
                                        </div>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group pb-0">
                                    <Form.Label>
                                        <small>Start/Due Date</small>
                                    </Form.Label>
                                    
                                    <Row>
                                    {(!fields?.start_date && !fields?.due_date) ? (
                                        <label 
                                            htmlFor="startdate--picker" 
                                            className="task--date--picker" 
                                            onClick={() => { setDateshow(true); }}
                                        >
                                            <FaRegCalendarAlt /> Set due date
                                        </label>
                                    ) : (
                                        <label 
                                            htmlFor="startdate--picker" 
                                            className="task--date--change" 
                                            onClick={() => { setDateshow(true); }}
                                        >
                                            { fields?.start_date && (
                                                new Date(fields.start_date).toISOString().split('T')[0]
                                            )}

                                            { fields?.start_date && fields?.due_date && (
                                                <span>/</span>
                                            )}

                                            { fields?.due_date && (
                                                <>
                                                    {new Date(fields.due_date).toISOString().split('T')[0]}
                                                </>
                                            )}

                                            {(fields?.start_date || fields?.due_date) && (
                                                <MdOutlineCancel 
                                                    onClick={() => {
                                                        dispatch(updateStateData(PROJECT_FORM, { start_date: '', due_date: '' }));
                                                    }} 
                                                />
                                            )}
                                        </label>
                                    )}

                                        <ProjectDatePicker isShow={datepickerShow} close={handleDateclose} ></ProjectDatePicker>
                                    </Row>
                                </Form.Group>
                            </Form>
                        </div>
                        <div className="project--form--actions">
                            <h4>Actions</h4>
                            <ListGroup>
                                <ListGroup.Item onClick={() => { dispatch(togglePopups('members', true)) }}><FaPlus /> Assign to</ListGroup.Item>
                                <p className="m-0">
                                    {fields['members'] && Object.keys(fields['members']).length > 0 && (
                                        <MemberInitials directUpdate={false} key={`MemberNames-header-new`}  showall={true} members={fields['members']} showAssignBtn={false} postId="new" type="project" showRemove={true} 
                                        // onMemberClick={(memberid, extraparam = false) =>  removeMember(memberid)}
                                         />
                                    )}
                                </p>

                                <ListGroup.Item onClick={handleUploadShow}><GrAttachment /> Attach files</ListGroup.Item>
                                <div className="output--file-preview">
                                    <div className="preview--grid">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                                        ))}
                                    </div>
                                </div>
                            </ListGroup>
                            <ListGroup className="mt-auto mb-0">
                                <ListGroup.Item className="text-center">
                                    <Button variant="primary" onClick={handleSubmit} disabled={loader}>{loader ? 'Please wait...' : 'Save'}</Button>
                                </ListGroup.Item>
                            </ListGroup>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <StatusModal key="create-project-status" />
            <MemberModal isedit={isEdit} />
            <WorkFlowModal />
            <FilesModal />
            <FilesPreviewModal showPreview={showPreview} imagePreviews={imagePreviews} toggle={setPreviewShow} filetoPreview={filetoPreview} />
            {/*--=-=Delete Modal**/}
            <Modal show={showDelete} onHide={handleDeleteClose} centered size="md" className="add--member--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Delete Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Deleting a task permanently removes it from your taskboard.</p>
                    <p>You can still access your discussions and attachments in your communication channel.</p>
                    <p><strong>Are you sure you want to continue?</strong></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteClose}>Cancel</Button>
                    <Button variant="danger">Delete</Button>
                </Modal.Footer>
            </Modal>
            
            {/*--=-=Filter Modal**/}
            <Modal show={showFilter} onHide={handleFilterClose} centered size="md" className="filter--modal" onShow={() => selectboxObserver()}>
                <Modal.Header closeButton>
                    <Modal.Title>Filters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        <ListGroup.Item key="showfor-filter-list">
                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('show_for', event.target.value)} value={filters['show_for'] || 'all'}>
                                <option value="all">All Projects</option>
                                <option value="my">My Projects</option>
                            </Form.Select>
                        </ListGroup.Item>

                        <ListGroup.Item key="member-filter-list">
                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('member', event.target.value)} value={filters['member'] || 'all'} >
                                {
                                    allMembers.map((member, index) => {
                                        return <option key={`member-option--${index}`} value={member.value}>{member.label}</option>
                                    })
                                }
                            </Form.Select>
                        </ListGroup.Item>
                        <ListGroup.Item key="status-filter-list">
                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('status', event.target.value)} value={filters['status'] || 'all'}>
                                <option key={`view-all--option`} value="all">View All</option>
                                <option key={`progress--option`} value="in-progress">In Progress</option>
                                <option key={`hold--option`} value="on-hold">On Hold</option>
                                <option key={`completed--option`} value="completed">Completed</option>
                            </Form.Select>
                        </ListGroup.Item>
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleFilterClose}>Cancel</Button>
                    <Button variant="primary" onClick={dofilters}>Save</Button>
                </Modal.Footer>
            </Modal>
            {/*--=-=Search Modal**/}
            <Modal show={showSearch} onHide={handleSearchClose} size="md" className="search--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Search</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        <ListGroup.Item className="border-0 p-0" key="search-filter-list">
                            <Form>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Control type="text" placeholder="Search by Project or Client" onChange={(event) => handlefilterchange('search', event.target.value)} />
                                </Form.Group>
                            </Form>
                        </ListGroup.Item>
                    </ListGroup>
                </Modal.Body>
            </Modal>
            {/*--=-=File Preview Modal**/}
            <>
                <AlertDialog
                    showdialog={showdialog}
                    toggledialog={setShowDialog}
                    msg="Are you sure you want to delete this project?"
                    callback={handledeleteProject}
                />
            </>
        </>
    );
}

export default ProjectsPage;