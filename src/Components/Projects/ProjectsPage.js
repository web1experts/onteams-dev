import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Modal, Form, FloatingLabel, ListGroup, Table, Dropdown, ListGroupItem } from "react-bootstrap";
import { FaChevronDown, FaPlus, FaList, FaRegTrashAlt, FaRegCalendarAlt, FaCog } from "react-icons/fa";
import { MdFileDownload, MdFilterList, MdOutlineClose, MdOutlineCancel, MdOutlineSearch, MdDragIndicator } from "react-icons/md";
import { FiSidebar } from "react-icons/fi";
import { FiFileText } from "react-icons/fi";
import { GrAttachment, GrExpand } from "react-icons/gr";
import { BsGrid,BsEye } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { TbArrowsSort } from "react-icons/tb";
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
import { togglePopups, updateStateData,toggleSidebar, toggleSidebarSmall } from "../../redux/actions/common.action";
import { MemberInitials } from "../common/memberInitials";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.snow.css';
import AutoLinks from "quill-auto-links";
import { CustomFieldModal } from "../modals/customFields";
import { socket, currentMemberProfile } from "../../helpers/auth";
import ProjectDatePicker from "../Datepickers/projectDatepicker";
import { fetchCustomFields } from "../../redux/actions/customfield.action";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { renderDynamicField } from "../common/dynamicFields";
import { ALL_MEMBERS, ACTIVE_FORM_TYPE, PROJECT_FORM, RESET_FORMS, CURRENT_PROJECT, ALL_CLIENTS, ASSIGN_MEMBER, DIRECT_UPDATE, EDIT_PROJECT_FORM } from "../../redux/actions/types";
Quill.register("modules/autoLinks", AutoLinks);

function ProjectsPage() {
    const memberProfile = currentMemberProfile()
    
    const [isActiveView, setIsActiveView] = useState(2);
    const dispatch = useDispatch();
    const memberdata = getMemberdata()
    const [projects, setProjects] = useState([]);
    const [filters, setFilters] = useState({ member: memberdata?._id, status: 'in-progress' })
    const [fields, setFields] = useState({ title: '', status: 'in-progress', members: [] });
    const [errors, setErrors] = useState({ title: '' });
    const [loader, setLoader] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedMembers, setselectedMembers] = useState([]);
    const [customFields, setCustomFields] = useState([]);
    const projectFeed = useSelector(state => state.project.projects);
    const apiResult = useSelector(state => state.project);
    const clientFeed = useSelector(state => state.client.clients);
    const apiClient = useSelector(state => state.client)
    const memberFeed = useSelector((state) => state.member.members);
    const commonState = useSelector(state => state.common)
    const projectform = useSelector(state => state.common.projectForm)
    const apiCustomfields = useSelector( state => state.customfields)
    const [clientlist, setClientList] = useState([])
    const [members, setMembers] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [isEdit, setIsEdit] = useState(false)
    const [total, setTotal] = useState(0)
    const [isActive, setIsActive] = useState(0);
    const [currentProject, setCurrentProject] = useState({})
    const [showdialog, setShowDialog] = useState(false);
    const [allMembers, setAllmembers] = useState([])
    const [spinner, setSpinner] = useState(false)
    const [ showCustomFields, setShowCustomFields] = useState( false )
    let fieldErrors = {};
    const quillRef = useRef(null);
    const pasteOccurred = useRef(false);
    let active = 2;
    const workflowstate = useSelector(state => state.workflow)
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
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
        dispatch(fetchCustomFields({module: 'projects'}))
    }, [dispatch]);

 

    useEffect(() => {
        if (clientFeed && clientFeed.clientData && clientFeed.clientData.length > 0) {
            setClientList(clientFeed.clientData)
            dispatch(updateStateData(ALL_CLIENTS, clientFeed.clientData))
        }
    }, [clientFeed, dispatch])

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
        if (apiCustomfields.deletedField) {
            setCustomFields((prevCustomFields) =>
                prevCustomFields.filter((field) => field._id !== apiCustomfields.deletedField)
            );
        }
    
    }, [apiCustomfields]);

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
                return updatedFields; // Return the new state
            });
        }
    }, [projectform]);

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
        if (isActive === 2 || isActive === 1) {
            dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project'))
        } else {
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
            if (isActive !== 2 && isActive !== 1) {
                setCurrentProject({})
            }
            setselectedMembers({})
            setImagePreviews([])
        }
        setShow(true);
    }

    const handleStatusClose = () => dispatch(togglePopups('status', false));
    const handleStatusShow = () => dispatch(togglePopups('status', true));
    const handleSidebar = () => dispatch(toggleSidebar(commonState.sidebar_open ? false : true))
    const handleSidebarSmall = () => dispatch(toggleSidebarSmall(commonState.sidebar_small ? false : true))
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
    const [datepickerShow, setDateshow] = useState(false)
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

    useEffect(() => {
        if (currentProject && Object.keys(currentProject).length > 0) {
           
            let fieldsSetup = {
                title: currentProject.title,
                status: currentProject.status,
                client: currentProject.client ? currentProject.client._id || fields['client'] : '',
                description: currentProject.description || '',
                start_date: currentProject.start_date ? new Date(currentProject.start_date).toISOString().split('T')[0] : '',
                due_date: currentProject.due_date ? new Date(currentProject.due_date).toISOString().split('T')[0] : '',
                files: currentProject.files ? currentProject.files.map(image => image._id) : [],
                workflow: currentProject.workflow ? currentProject.workflow : {}
            };

            
            // Set members if present
            if (currentProject.members && currentProject.members.length > 0) {
                let projectMembers = [];
                let membersdrop = {};

                currentProject.members.forEach(member => {
                    const { _id, name } = member;
                    projectMembers.push(_id);
                    membersdrop[_id] = name;
                });

                fieldsSetup.members = membersdrop;
            } else {
                fieldsSetup.members = [];
            }
            dispatch ( updateStateData( EDIT_PROJECT_FORM, fieldsSetup))
        }
    }, [currentProject, dispatch]);

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

    const handleChange = ({ target: { name, value, type, files, checked } }) => {
        const finalValue =
            type === 'checkbox' ? checked : type === 'file' ? files : value;
        setFields({ ...fields, [name]: finalValue })
        dispatch(updateStateData(PROJECT_FORM, { [name]: finalValue }))
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
            const memberarray = []
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

    const toggleCustomFields = () => {
       setShowCustomFields(prev => !prev);
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
            if (found === false) {
                setCurrentProject({})
            }
        }
    }, [projects]);

    useEffect(() => {
        if (apiResult.deletedProject) {
            setIsActive(0)
            setCurrentPage({})
        }

        if (apiResult?.success === true && !apiResult.updatedProject) {
            setIsDescEditor(false)
            setFields({ title: '', status: 'in-progress', members: [] })
            handleClose()
            setSelectedFiles([]);
            setImagePreviews([]);
            setShowDialog(false)
            handleListProjects()
        }

        socket.on('refreshProjects', function (msg) {
            if (apiResult.success || apiResult.deletedProject || apiResult.successfull) {
                handleListProjects()
            }
        });

        if( apiResult.success === true && apiResult.updatedProject){
            // if( apiResult.updatedProject?.status !== currentProject?.status || isNotPresent){ console.log('here now')
            //     handleListProjects()
            // }else{
                setProjects((prevProjects) =>
                    prevProjects.map((project) =>
                      project._id === apiResult.updatedProject._id ? apiResult.updatedProject : project
                    )
                );  
                setCurrentProject(apiResult.updatedProject )
            // } 
        }

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
        }
    };

    const handleRowDoubleClick = (project, index) => {
        if (project.marked_by && project.marked_by.includes(memberdata._id)) {
            
            dispatch(updateProject(project._id, { marked: false }))
        } else {
            dispatch(updateProject(project._id, { marked: true }))
        }
    }

    const handlePaste = (e) => {
        const pastedData = e.clipboardData.getData('text');
        pasteOccurred.current = true; // Set the paste flag to true
        setTimeout(function () {
            pasteOccurred.current = false;
        }, 500)
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

    const [projectToggle, setProjectToggle ] = useState(false)
    const handleToggles = () => {
        if(commonState.sidebar_small === false ){ 
            handleSidebarSmall()
        }else{
            setProjectToggle(false)
            handleSidebarSmall()
            
        }
    }

    return (
        <>
            <div className={ `${isActive === 1 ? 'show--details team--page project-collapse' : isActive === 2 ? 'view--project team--page project-collapse' :  'team--page'} ${projectToggle === true ? 'project-collapse' : ''}`}>
                <div className='page--title px-md-2 py-3 bg-white border-bottom'>
                    <Container fluid>
                        <Row>
                            <Col sm={12} lg={12}>
                                <h2>
                                    <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
                                    Projects
                                    <ListGroup horizontal className={isActive !== 0 ? '' : 'ms-auto d-flex'}>
                                        <ListGroup.Item className={isActive !== 0 ? 'd-none' : 'ms-auto d-none d-xl-flex'} key="member-filter-list">
                                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('member', event.target.value)} value={filters['member'] || 'all'}>
                                                <option value={memberdata?._id} key="my-projects-option">My Projects</option>
                                                {
                                                    (memberProfile?.permissions?.projects?.view_others === true || memberProfile?.role?.slug === 'owner') &&
                                                    <>
                                                    {
                                                        (memberProfile?.permissions?.projects?.selected_members?.length > 0 || memberProfile?.role?.slug === 'owner') && (
                                                            <option key={`member-projects-all`} value={'all'}>All Members</option>
                                                        )
                                                    }
                                                    
                                                    {allMembers.map((member, index) => 
                                                        (memberProfile?.permissions?.projects?.selected_members?.includes(member.value)  || memberProfile?.role?.slug === 'owner') ? (
                                                          <option key={`member-projects-${index}`} value={member.value}>
                                                            {member.label}
                                                          </option>
                                                        ) : null
                                                      )
                                                    }
                                                    </>
                                                }
                                                {
                                                    (memberProfile?.permissions?.projects?.selected_members?.includes('unassigned') || memberProfile?.role?.slug === 'owner') && (
                                                    <option value="unassigned">Unassigned</option>
                                                    )
                                                }
                                                
                                            </Form.Select>
                                        </ListGroup.Item>
                                        <ListGroup.Item className={isActive !== 0 ? 'd-none' : 'd-none d-xl-flex'} key="status-filter-list">
                                            <Form.Select className="custom-selectbox" onChange={(event) => handlefilterchange('status', event.target.value)} value={filters['status'] || 'all'}>
                                                <option value="all">View All</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="on-hold">On Hold</option>
                                                <option value="completed">Completed</option>
                                            </Form.Select>
                                        </ListGroup.Item>
                                        <ListGroup.Item className={isActive !== 0 ? 'd-none' : 'd-none d-xl-flex'} key="search-filter-list">
                                            <Form className="search-filter-list" onSubmit={(e) => {e.preventDefault()}}>
                                                <Form.Group className="mb-0 form-group">
                                                    <MdOutlineSearch />
                                                    <Form.Control type="text" placeholder="Search by Project or Client" onChange={(event) => handlefilterchange('search', event.target.value)} />
                                                </Form.Group>
                                            </Form>
                                        </ListGroup.Item>
                                        <ListGroup horizontal className={isActive !== 0 ? 'd-none' : 'd-none d-lg-flex ms-3'}>
                                            <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 1} onClick={() => setIsActiveView(1)}><BsGrid /></ListGroup.Item>
                                            <ListGroup.Item action className="d-none d-lg-flex view--icon" active={isActiveView === 2} onClick={() => setIsActiveView(2)}><FaList /></ListGroup.Item>
                                        </ListGroup>
                                        <ListGroup horizontal className={isActive !== 0 ? '' : 'bg-white expand--icon ms-3 d-flex'}>
                                            <ListGroup.Item className={isActive !== 0 ? 'd-flex d-xl-none me-1' : 'd-xl-none onHide me-1'} onClick={handleFilterShow}><MdFilterList /></ListGroup.Item>
                                            <ListGroup.Item className="d-none d-lg-flex me-2" key={`settingskey`} onClick={toggleCustomFields }><FaCog /></ListGroup.Item>
                                            <ListGroup.Item className="d-none d-lg-flex" onClick={() => {handleSidebarSmall(false);}}><GrExpand /></ListGroup.Item>
                                            {(memberProfile?.permissions?.projects?.create_edit_delete_project === true  || memberProfile?.role?.slug === 'owner') && (
                                                <ListGroup.Item className="btn btn-primary" onClick={() => handleShow('new') }><FaPlus /></ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    </ListGroup>
                                </h2>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div className='page--wrapper px-md-2 py-3'>
                    {
                        spinner &&
                        <div className="loading-bar">
                            <img src="images/OnTeam-icon.png" className="flipchar" />
                        </div>
                    }
                    <Container fluid className="pb-5 pt-2">
                        {
                            (memberProfile?.permissions?.projects?.update_projects_order === true || memberProfile?.role?.slug === "owner") ? 
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className={isActiveView === 1 ? 'project--grid--table project--grid--new--table table-responsive-xl' : isActiveView === 2 ? 'project--table draggable--table new--project--rows table-responsive-xl' : 'project--table new--project--rows table-responsive-xl'}>
                                <Table>
                                    <thead className="onHide">
                                        <tr key="project-table-header">
                                            <th scope="col" className="sticky p-0 border-bottom-0" key="project-name-header">
                                                <div className="d-flex align-items-center justify-content-between border-end border-bottom ps-3">
                                                    Project <span key="project-action-header" className="onHide">Actions</span>
                                                </div>
                                            </th>
                                            <th scope="col" key="project-status-header" className="onHide p-0 border-bottom-0"><div className="border-bottom padd--x">Status</div> </th>
                                            <th scope="col" width='12%' key="project-member-header" className="onHide p-0 border-bottom-0"><div className="border-bottom padd--x">Assigned Members</div></th>
                                            {Array.isArray(customFields) && customFields
                                                .filter(field => field?.showInTable !== false)
                                                .map((field, idx) => (
                                                    <th scope="col" key={`project-${field.name || idx}-header`} className="onHide p-0 border-bottom-0"><div className="border-bottom padd--x">{field.label}</div></th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
                                    <Droppable droppableId={`droppable-project-table`} type="PROJECTS" direction={isActiveView === 1 ? "horizontal" : "vertical"}>
                                        {(provided) => (
                                            <tbody
                                                id={`projectable-body`}
                                                className="projects--list"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
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
                                                                            (memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner')
                                                                                ?
                                                                                    handleRowDoubleClick(project, index)
                                                                                    : console.log('not allowed')
                                                                            }}
                                                                            key={`project-row-${project._id}`} onClick={() => { handleProjectChange(project) }} className={`${project._id === currentProject?._id ? 'project--active' : ''} ${project.marked_by && project.marked_by.includes(memberdata._id) ? 'marked-project' : ''
                                                                                }`}>
                                                                            <td className="project--title--td sticky border-bottom" key={`title-index-${index}`} data-label="Project Name" onClick={viewTasks}>
                                                                                <div className="d-flex justify-content-between border-end flex-wrap">
                                                                                    <div className="project--name">
                                                                                        <div className="drag--indicator"><abbr key={`index-${index}`}>{index + 1}</abbr><MdDragIndicator /></div>
                                                                                        <div className="title--initial">{project.title.charAt(0)}</div>
                                                                                        <div className="title--span flex-column align-items-start gap-0">
                                                                                            <span>{project.title}</span>
                                                                                            <strong key={`cname-index-${index}`} data-label="Client Name">{project.client?.name || <span className='text-muted'></span>}</strong>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div key={`actions-index-${index}`} data-label="Actions" className="onHide task--buttons">
                                                                                        <Button variant="primary" className="me-2" 
                                                                                            onClick={() => {
                                                                                                setIsActive(2);
                                                                                            }}>
                                                                                            <BsEye /></Button>
                                                                                        <Button variant="primary" onClick={() => {
                                                                                            
                                                                                            if (
                                                                                                memberProfile?.permissions?.projects?.view === true ||
                                                                                                memberProfile?.role?.slug === 'owner'
                                                                                            ) {
                                                                                            setIsActive(1);
                                                                                            } else {
                                                                                                console.log('not allowed to view tasks');
                                                                                            }
                                                                                        }}
                                                                                        >
                                                                                            <BiEdit />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            
                                                                            <td key={`status-index-${index}`} data-label="Status" className="onHide status__key">
                                                                                <Dropdown className="select--dropdown" key='status-key'>
                                                                                    <Dropdown.Toggle onClick={() => { 
                                                                                        if (memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner') {
                                                                                            dispatch(updateStateData(DIRECT_UPDATE, true));
                                                                                            handleStatusShow();
                                                                                        } else {
                                                                                            console.log('Not allowed');
                                                                                        }
                                                                                    }} variant={`${project.status === 'in-progress' ? 'warning' : project.status === 'on-hold' ? 'danger' : project.status === 'completed' ? 'success' : ''}`}>{formatStatus(project.status || "in-progress")}</Dropdown.Toggle>
                                                                                </Dropdown>
                                                                            </td>
                                                                            {/* <td key={`cname-index-${index}`} data-label="Client Name" className="onHide project--title--td"><span>{project.client?.name || <span className='text-muted'>__</span>}</span></td> */}
                                                                            <td key={`amember-index-${index}`} data-label="Assigned Member" className="onHide member--circles min__width">
                                                                                <MemberInitials directUpdate={true} key={`MemberNames-${index}-${project._id}`} members={project.members} showRemove={(memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner') ? true : false} showAssignBtn={(memberProfile?.permissions?.members?.view === true || memberProfile?.role?.slug === 'owner') ? true : false} postId={project._id} type="project"/>
                                                                            </td>
                                                                            <td className="task--last--buttons">
                                                                                <div className="d-flex justify-content-between">
                                                                                    <div key={`actions-index-${index}`} data-label="Actions" className="onHide">
                                                                                        <Button variant="dark" className="me-2 px-3 py-1" 
                                                                                            onClick={() => {
                                                                                                setIsActive(2);
                                                                                            }}>
                                                                                            <BsEye/> Details</Button>
                                                                                        <Button variant="dark" className="px-3 py-1" onClick={() => {
                                                                                            
                                                                                            if (
                                                                                                memberProfile?.permissions?.projects?.view === true ||
                                                                                                memberProfile?.role?.slug === 'owner'
                                                                                            ) {
                                                                                            setIsActive(1);
                                                                                            } else {
                                                                                                console.log('not allowed to view tasks');
                                                                                            }
                                                                                        }}
                                                                                        >
                                                                                           <BiEdit /> Tasks
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            {Array.isArray(customFields) && customFields
                                                                            .filter(field => field?.showInTable !== false)
                                                                            .map((field, idx) => {
                                                                                const fieldname = field.name;
                                                                                let mvalue = project?.customFields?.[fieldname]?.meta_value;
                                                                                if (field.type === 'badge' && Array.isArray(field.options)) {
                                                                                    const matchedOption = field.options.find(opt => opt.value === mvalue);
                                                                                    if (matchedOption) {
                                                                                    mvalue = (
                                                                                        <span
                                                                                            className="priority--badge"
                                                                                            style={{
                                                                                                backgroundColor: matchedOption.color,
                                                                                                color: '#fff',
                                                                                                display: 'inline-block',
                                                                                                borderColor: matchedOption.color,
                                                                                                borderStyle: 'solid',
                                                                                                borderWidth: '1px'
                                                                                            }}
                                                                                        >
                                                                                        {project?.customFields?.[fieldname]?.meta_value}
                                                                                        </span>
                                                                                    );
                                                                                    }
                                                                                }
                                                                                return (
                                                                                    <td key={`project-${fieldname || idx}-${mvalue}`} className="onHide new--td">
                                                                                        {mvalue}
                                                                                    </td>
                                                                                );
                                                                            })}
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
                            </div>
                        </DragDropContext>
                        :
                        <Table responsive="xl" className={isActiveView === 1 ? 'project--grid--table project--grid--new--table' : isActiveView === 2 ? 'project--table draggable--table new--project--rows' : 'project--table new--project--rows'}>
                             <thead className="onHide">
                                <tr key="project-table-header">
                                    <th scope="col" className="sticky pe-0 py-0" key="project-name-header">
                                        <div className="d-flex align-items-center justify-content-between border-end">
                                            Project <span key="project-action-header" className="onHide">Actions</span>
                                        </div>
                                    </th>
                                    <th scope="col" key="th-project-status-header" className="onHide">Status</th>
                                    {/* <th scope="col" key="th-project-priority-header" className="onHide">Priority</th> */}
                                    <th scope="col" key="th-project-member-header" className="onHide">Assigned Members</th>
                                </tr>
                            </thead>
                            <tbody id={`projectable-body`} className="projects--list">
                                {
                                    (!spinner && projects && projects.length > 0)
                                        ? projects.map((project, index) => {
                                            return (<>
                                                <tr onDoubleClick={(event) => { 
                                                    (memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner')
                                                        ?
                                                            handleRowDoubleClick(project, index)
                                                            : console.log('not allowed')
                                                    }}
                                                    key={`project-row-${project._id}`} onClick={() => { handleProjectChange(project) }} className={`${project._id === currentProject?._id ? 'project--active' : ''} ${project.marked_by && project.marked_by.includes(memberdata._id) ? 'marked-project' : ''
                                                        }`}>
                                                    <td className="project--title--td sticky border-bottom" key={`title-index-${index}`} data-label="Project Name" onClick={viewTasks}>
                                                        <div className="d-flex justify-content-between border-end flex-wrap">
                                                            <div className="project--name">
                                                                <div className="drag--indicator"><abbr key={`index-${index}`}>{index + 1}</abbr><MdDragIndicator /></div>
                                                                <div className="title--initial">{project.title.charAt(0)}</div>
                                                                <div className="title--span flex-column align-items-start gap-0">
                                                                    <span>{project.title}</span>
                                                                    <strong key={`cname-index-${index}`} data-label="Client Name">{project.client?.name || <span className='text-muted'></span>}</strong>
                                                                </div>
                                                            </div>
                                                            <div key={`actions-index-${index}`} data-label="Actions" className="onHide task--buttons sticky">
                                                                <Button variant="primary" className="me-2" 
                                                                    onClick={() => {
                                                                        setIsActive(2);
                                                                    }}>
                                                                    <BsEye /></Button>
                                                                <Button variant="primary" onClick={() => {
                                                                    
                                                                    if (
                                                                        memberProfile?.permissions?.projects?.view === true ||
                                                                        memberProfile?.role?.slug === 'owner'
                                                                    ) {
                                                                    setIsActive(1);
                                                                    } else {
                                                                        console.log('not allowed to view tasks');
                                                                    }
                                                                }}
                                                                >
                                                                    <BiEdit />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    
                                                    <td key={`td-status-index-${index}`} data-label="Status" className="onHide status__key">
                                                        <Dropdown className="select--dropdown" key='status-key'>
                                                            <Dropdown.Toggle onClick={() => { 
                                                                if (memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner') {
                                                                    dispatch(updateStateData(DIRECT_UPDATE, true));
                                                                    handleStatusShow();
                                                                } else {
                                                                    console.log('Not allowed');
                                                                }
                                                            }} variant={`${project.status === 'in-progress' ? 'warning' : project.status === 'on-hold' ? 'danger' : project.status === 'completed' ? 'success' : ''}`}>{formatStatus(project.status || "in-progress")}</Dropdown.Toggle>
                                                        </Dropdown>
                                                    </td>
                                                    <td key={`td-priority-index-${index}`} data-label="Status" className="onHide status__key">
                                                        <Dropdown className="select--dropdown" key='status-key'>
                                                            <Dropdown.Toggle onClick={() => { 
                                                                if (memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner') {
                                                                    dispatch(updateStateData(DIRECT_UPDATE, true));
                                                                    handleStatusShow();
                                                                } else {
                                                                    console.log('Not allowed');
                                                                }
                                                            }} variant={`${project.status === 'in-progress' ? 'warning' : project.status === 'on-hold' ? 'danger' : project.status === 'completed' ? 'success' : ''}`}>{formatStatus(project.status || "in-progress")}</Dropdown.Toggle>
                                                        </Dropdown>
                                                    </td>
                                                    {/* <td key={`cname-index-${index}`} data-label="Client Name" className="onHide project--title--td"><span>{project.client?.name || <span className='text-muted'>__</span>}</span></td> */}
                                                    <td key={`amember-index-${index}`} data-label="Assigned Member" className="onHide member--circles min__width">
                                                        <MemberInitials directUpdate={true} key={`MemberNames-${index}-${project._id}`} members={project.members} showRemove={(memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner') ? true : false} showAssignBtn={(memberProfile?.permissions?.members?.view === true || memberProfile?.role?.slug === 'owner') ? true : false} postId={project._id} type="project"/>
                                                    </td>
                                                </tr>
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
                                
                        </Table>
                        }
                        {
                            isActiveView === 1 && !spinner && projects && projects.length == 0 &&
                            <div className="text-center mt-5">
                                <h2>No Projects Found</h2>
                            </div>
                        }
                    </Container>
                </div>
            </div>
            <div className="details--projects--grid projects--grid common--project--grid">
                <div className="wrapper--title py-2 bg-white border-bottom">
                    <span className="open--sidebar me-2 d-flex d-xl-none" onClick={() => {handleSidebarSmall(false);setIsActive(0);}}><FiSidebar /></span>
                    <div className="projecttitle">
                        <Dropdown>
                            <Dropdown.Toggle variant="link" id="dropdown-basic">
                                <div className="title--initial">{currentProject?.title?.charAt(0)}</div>
                                <div className="title--span flex-column align-items-start gap-0">
                                    <h3>
                                        <strong>{currentProject?.title}</strong>
                                        <span>{currentProject?.client?.name}</span>
                                    </h3>
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <div className="drop--scroll">
                                    {projects.map((project, index) => {
                                        return (<>
                                            <Dropdown.Item value={project._id} onClick={() => { handleProjectChange(project) }} className={(currentProject?._id === project?._id) ? 'active-project': ''}>
                                                <div className="title--initial">{project.title.charAt(0)}</div>
                                                <div className="title--span flex-column align-items-start gap-0">
                                                    <strong>{project.title}</strong>
                                                    <span>{project.client?.name || <span className='text-muted'>__</span>}</span>
                                                </div>
                                            </Dropdown.Item>
                                        </>
                                        )
                                    })}
                                </div>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <ListGroup horizontal className="members--list me-md-0 me-xl-auto ms-auto ms-md-2 d-none d-xxl-flex">
                        <ListGroup.Item key={`memberskey`} className="me-3">Members</ListGroup.Item>
                        {<MemberInitials directUpdate={true} key={`MemberNames-header-${currentProject?._id}`} showRemove={(memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner') ? true : false} showAssignBtn={(memberProfile?.permissions?.members?.view === true || memberProfile?.role?.slug === 'owner') ? true : false} members={currentProject?.members || []}  postId={currentProject?._id} type="project"/>}
                    </ListGroup>
                    <ListGroup horizontal className="ms-auto ms-xl-0 p-0 mt-0 mt-md-0 d-none d-sm-flex">
                        <ListGroup horizontal className="bx--shadow">
                            <Button variant="secondary" className="btn--view d-none d-sm-flex" onClick={() => setIsActive(2)}><BsEye className="me-1"/> Details</Button>
                            <Button variant="primary" className="active btn--view d-none d-sm-flex" onClick={() => { setIsActive(1); }}><BiEdit className="me-1"/> Tasks</Button>
                        </ListGroup>
                    </ListGroup>
                    <ListGroup horizontal className="expand--icon gap-2 p-0 b-0 rounded-0 align-items-center">
                        {
                        (memberProfile?.permissions?.projects?.create_edit_delete_project === true || memberProfile?.role?.slug === 'owner') && (
                            <ListGroup.Item className="d-lg-flex me-2" key={`work-settingskey`} onClick={() => { dispatch(updateStateData(DIRECT_UPDATE, true)); dispatch(togglePopups('workflow', true)) }}><FaCog /></ListGroup.Item>
                        )
                        }
                        <ListGroup.Item onClick={handleToggles} className="d-none d-lg-flex"><GrExpand /></ListGroup.Item>
                        <ListGroupItem className="btn btn-primary" key={`closekey`} onClick={() => {setIsActive(0);dispatch(toggleSidebarSmall( false))}}><MdOutlineClose /></ListGroupItem>
                    </ListGroup>
                </div>
               {isActive === 1 && <TasksList activeTab={activeTab} currentProject={currentProject} memberProfile={memberProfile} />} 
            </div>

            {isActive === 2 && <SingleProject key={`single-project-view-${currentProject?._id}`} projects={projects} currentProject={currentProject} clientlist={clientlist} members={members} closeview={setIsActive} memberProfile={memberProfile} toggleSidebars={handleToggles} projectChange={handleProjectChange} customFields={customFields} /> }
            { commonState?.taskForm && <TaskForm memberProfile={memberProfile}/> }
            
            { showCustomFields && <CustomFieldModal toggle={setShowCustomFields} module='projects' />}
            {show &&
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
                                        {
                                            (memberProfile?.permissions?.clients?.view === true && clientlist && clientlist.length > 0 || memberProfile?.role?.slug === "owner" && clientlist && clientlist.length > 0) ?
                                            <Form.Select className="form-control custom-selectbox" placeholder="Select Client" id="client-select" name="client" onChange={handleChange} value={fields['client'] || ''}>
                                                <option value="none">None</option>
                                                {
                                                    clientlist?.map((client, index) => {
                                                        return <option key={client._id} value={client._id}>{client.name}</option>
                                                    })
                                                }
                                            </Form.Select>
                                            :
                                            <Form.Label><small>None</small></Form.Label>
                                            }
                                            {/* { (memberProfile?.permissions?.clients?.create_edit_delete === true || memberProfile?.role?.slug === 'owner') && (
                                                <Button variant="primary" onClick={handleClientShow}><FaPlus /> Clients</Button>
                                            )} */}
                                        </div>
                                        {/* <AddClient show={showClient} toggleshow={handleClientClose} /> */}
                                    </Form.Group>
                                    <Form.Group className="mb-0 form-group">
                                        <Form.Label>
                                            <small>Workflow</small>
                                            <div className="workflow--modal" onClick={(handleWorkflowShow)}>
                                                <span className="workflow--selected">{fields['workflow']?.title ? fields['workflow']?.title : workflowstate?.workflows?.[0]?.title || 'Select'} <FaChevronDown /></span>
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
                                                    setFields({ ...fields, ['description']: value })
                                                    setErrors({ ...errors, ['description']: '' });

                                                    // setTimeout(() => {
                                                    //     dispatch(updateStateData(PROJECT_FORM, { ['description']: value }))
                                                    // }, 10)
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
                                                    {fields?.start_date && (
                                                        new Date(fields.start_date).toISOString().split('T')[0]
                                                    )}

                                                    {fields?.start_date && fields?.due_date && (
                                                        <span>/</span>
                                                    )}

                                                    {fields?.due_date && (
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
                                    {customFields.length > 0 &&
                                        <>
                                        <hr />
                                            <ListGroup>
                                                <p className="m-0"> Other Fields</p>
                                            </ListGroup>
                                        
                                        {customFields.map((field, index) =>
                                            renderDynamicField({
                                            name: `custom_field[${field.name}]`,
                                            type: field.type,
                                            label: field.label,
                                            value: fields[`custom_field[${field.name}]`] || '',
                                            options: field?.options || [],
                                            onChange: (e) => handleChange(e, field.name),
                                            fieldId: `new-${field.name}-${index}`,
                                            range_options: field?.range_options || {}
                                            })
                                        )}
                                        </>
                                    }

                                </Form>
                            </div>
                            <div className="project--form--actions">
                                <h4>Actions</h4>
                                <ListGroup>
                                    <ListGroup.Item onClick={() => { dispatch(togglePopups('members', true)) }}><FaPlus /> Assign to</ListGroup.Item>
                                    <p className="m-0">
                                        {fields['members'] && Object.keys(fields['members']).length > 0 && (
                                            <MemberInitials directUpdate={false} key={`MemberNames-header-new`} showall={true} members={fields['members']} showAssignBtn={false} postId="new" type="project" showRemove={true} />
                                        )}
                                    </p>
                                    <ListGroup.Item onClick={handleUploadShow}><GrAttachment /> Attach files</ListGroup.Item>
                                    <div className="output--file-preview">
                                        <div className="preview--grid">
                                            {imagePreviews?.map((preview, index) => (
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
            }
           
            {commonState?.statusModal && <StatusModal key="create-project-status" /> }
            {commonState?.membersModal && <MemberModal isedit={isEdit} />}
            {commonState?.workflowmodal && <WorkFlowModal /> }
            {commonState?.filesmodal && <FilesModal /> }
            { showPreview && <FilesPreviewModal showPreview={showPreview} imagePreviews={imagePreviews} toggle={setPreviewShow} filetoPreview={filetoPreview} /> }
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
                                    allMembers?.map((member, index) => {
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