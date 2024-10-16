import React, { useEffect, useState, useRef } from 'react';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, ListGroup, Row, Col, InputGroup, Dropdown, Image} from "react-bootstrap";
import { MdFileDownload } from "react-icons/md";
import { FaEllipsisV, FaPlus, FaRegTrashAlt, FaChevronDown, FaCheck } from "react-icons/fa";
import { selectboxObserver, getMemberdata, makeLinksClickable, formatTimeAgo, parseDateWithoutTimezone } from "../../helpers/commonfunctions";
import { updateStateData, togglePopups } from '../../redux/actions/common.action';
import { TASK_FORM, RESET_FORMS, ACTIVE_FORM_TYPE, CURRENT_TASK } from '../../redux/actions/types';
import { FiFileText } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { FaPaperPlane, FaRegCalendarAlt } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import { GrDrag } from "react-icons/gr";
import { LuWorkflow } from "react-icons/lu";
import { FilesPreviewModal } from '../modals';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { getFieldRules, validateField } from '../../helpers/rules';
import { updateTask, deleteTask } from '../../redux/actions/task.action';
import { socket, SendComment, DeleteComment, UpdateComment } from '../../helpers/auth';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { MemberInitials } from '../common/memberInitials';
import DatePicker from "react-multi-date-picker";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
        

export const TaskForm = () => {
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
        }
      };

      const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link'
      ];
      

      
    const dispatch = useDispatch()
    const quillRef = useRef(null);
    const pasteOccurred = useRef(false); 
    const memberdata = getMemberdata()
    const [workflowstatus, setWorkflowStatus]  = useState(false)
    const [datePickerModal, setDatePickerModal]  = useState(false)
    const modalstate = useSelector(state => state.common.taskmodal);
    const taskForm = useSelector( state => state.common.taskForm)
    const apiResult = useSelector(state => state.task);
    const commonState = useSelector( state => state.common)
    const members = useSelector((state) => state.common.allmembers);
    const [currentProject, setCurrentProject] = useState({})
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loader, setLoader] = useState(false);
    const [fields, setFields] = useState({title: apiResult?.currentTask?.title || '', members: [], description: apiResult?.currentTask?.description || ''})
    const [ errors, setErrors ] = useState({})
    const [subtasks, setSubtasks] = useState([]);
    const handleUploadShow = () => dispatch(togglePopups('files', true)) 
    const [isdescEditor, setIsDescEditor] = useState(false);
    const [filetoPreview, setFiletoPreview] = useState(null);
    const [showPreview, setPreviewShow] = useState(false);
    const handlePreviewClose = () => setPreviewShow(false);
    const [ currentTask, setCurrentTask] = useState(apiResult.currentTask || {})
    const [ enablesubtaskedit, setEnableSubtakEdit ] = useState({})
    const [ShowCommentModel, setShowCommentModel] = useState(false);
    const handleCloseCommentModel = () => setShowCommentModel(false);
    const handleDatetModal = () => setDatePickerModal(false);
    const [ editmessage, setEditMessage] = useState({})
    const [comments, setComments] = useState([]);
    const [workflowstatuses, setFlowstatus ] =  useState([])
    const handleNewComment = (event) => {
        setComments(event.target.value);
    }

   

    const [search, setSearch] = useState('');
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const filteredStatuses = workflowstatuses.filter(status => 
        status.title.toLowerCase().includes(search.toLowerCase())
    );
    
    const handleShowCommentModel = (image) => {
        // handleSelectedImage(image);
        setShowCommentModel(true);
    }
    let fieldErrors = {};
    const handlePreviewShow = (file) => {
        setFiletoPreview(file)
        setPreviewShow(true)
    };

    useEffect(() => {
        if( modalstate === true ){
            dispatch(updateStateData(TASK_FORM, { title: '' }))
        }
    }, [ modalstate ])

    useEffect(() => {
        if (apiResult.currentTask) { console.log('hello task')
            setCurrentTask(apiResult.currentTask)
            // setImagePreviews([]);
            // setSubtasks([])
            
        }

    }, [apiResult.currentTask])


    useEffect(() => {
        if (currentTask && Object.keys(currentTask).length > 0) { 
            console.log('here at current task:: ', currentTask)
            setImagePreviews([]);
            let fieldsSetup = {
                title: currentTask.title,
                tab: currentTask.tab,
                description: currentTask.description || '',
                files: currentTask.files ? currentTask.files.map(image => image._id) : [],
                order: currentTask.order ? currentTask.order : '',
                subtasks: currentTask.subtasks ? currentTask.subtasks : [],
                due_date: currentTask.due_date ? new Date(currentTask.due_date).toISOString().split('T')[0] : ''
            };

            // if(currentTask.subtasks && currentTask.subtasks.length > 0 ){
                // for (let index = 0; index < currentTask.subtasks.length; index++) {
                //     let subtask = currentTask.subtasks[index];
                // }
                setSubtasks(currentTask.subtasks ? currentTask.subtasks : [])
            // }

            if (currentTask.description && currentTask.description !== "") {
                setIsDescEditor(true);
            }else{
                setIsDescEditor(false);
            }

            // Set members if present
            if (currentTask.members && currentTask.members.length > 0) {
                let taskMembers = [];
                let membersdrop = {};

                currentTask.members.forEach(member => {
                    const { _id, name } = member;
                    taskMembers.push(_id);
                    membersdrop[_id] = name;
                });

                fieldsSetup.members = membersdrop;
               // setselectedMembers(membersdrop);
            } else {
                fieldsSetup.members = [];
                //setselectedMembers({});
            }
            setTimeout(function () {
                selectboxObserver()
            }, 150)
            dispatch ( updateStateData( TASK_FORM, fieldsSetup))
        }
    }, [currentTask]);
    
    const refreshstates = (formtype) => { 
        switch (formtype) {
          case 'task':
            const stateObject = {}
            // stateObject['status'] = commonState.projectForm.status
            stateObject['formtype'] = commonState.active_formtype
           return stateObject
           
          case 'edit_task':
            const editstateObject = {}
            // editstateObject['status'] = commonState.editProjectForm.status
            editstateObject['formtype'] = commonState.active_formtype
           return editstateObject
          
          default:
            return {}
            break;
        }
    }
    
    const handleCommentSubmit = async () => {
        const newComment = { text: comments };
        SendComment(comments, currentTask?._id, memberdata?._id);
        setComments('');
    };

    useEffect(() => { 
        if (taskForm) {
            setFields(prevFields => {
                const updatedFields = {
                    ...prevFields, // Retain the existing properties of fields
                    ...taskForm // Merge properties from commonState.taskForm
                };
                return updatedFields; // Return the new state
            });
            
        }
    }, [taskForm]);

  
    useEffect(() => { 
        if (commonState.taskForm.images?.length > 0) {
            const selectedFiles = commonState.taskForm.images
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
    }, [taskForm.images])

    const TaskUpdate = async () => {
        if( currentTask?.description === fields?.description){
            return false;
        }
        const formData = new FormData();
            for (const [key, value] of Object.entries(fields)) {
                if( key === "subtasks"){
                    console.log(value)
                }
                if (typeof value === 'object' && key === 'images') {
                    
                    value.forEach(attach => {
                        formData.append('images[]', attach);
                    });
                } else if (typeof value === 'object' && key === 'members') {
                    const memberids = Object.keys(fields['members'])
                    if( memberids.length > 0){
                        memberids.forEach(item => {
                            formData.append(`members[]`, item); // Append with the same key for non-empty arrays
                        });
                    }else{
                        formData.append(`members`, '[]');
                    }
                } else if (typeof value === 'object' && key === "subtasks") {
                        value.forEach((obj, index) => {
                            if( typeof obj === "object"){
                                formData.append(`${key}[${index}]`, JSON.stringify(obj));
                            }else{
                                formData.append(`${key}[${index}]`, obj);
                            }
                      });
                } else if (Array.isArray(value)) { // Check if the value is an array
                    if (value.length === 0) {
                        formData.append(`${key}[]`, []); // Append an empty array
                    } else {
                        value.forEach(item => {
                            formData.append(`${key}[]`, item); // Append with the same key for non-empty arrays
                        });
                    }
                } else {
                    formData.append(key, value)
                }
            }
            let payload = formData;

            
            await dispatch(updateTask(currentTask._id, payload))
    }

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        setLoader(true)
       
        const updatedErrorsPromises = Object.entries(fields).map(async ([fieldName, value]) => {
            // Get rules for the current field
            const rules = getFieldRules('task', fieldName);
            // Validate the field
            const error = await validateField('task', fieldName, value, rules);
            // If error exists, return it as part of the resolved promise
            return { fieldName, error };
        });
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
                if( key === "subtasks"){
                    console.log(value)
                }
                if (typeof value === 'object' && key === 'images') {
                    
                    value.forEach(attach => {
                        formData.append('images[]', attach);
                    });
                } else if (typeof value === 'object' && key === 'members') {
                    const memberids = Object.keys(fields['members'])
                    if( memberids.length > 0){
                        memberids.forEach(item => {
                            formData.append(`members[]`, item); // Append with the same key for non-empty arrays
                        });
                    }else{
                        formData.append(`members`, '[]');
                    }
                } else if (typeof value === 'object' && key === "subtasks") {
                        value.forEach((obj, index) => {
                            if( typeof obj === "object"){
                                formData.append(`${key}[${index}]`, JSON.stringify(obj));
                            }else{
                                formData.append(`${key}[${index}]`, obj);
                            }
                      });
                } else if (Array.isArray(value)) { // Check if the value is an array
                    if (value.length === 0) {
                        formData.append(`${key}[]`, []); // Append an empty array
                    } else {
                        value.forEach(item => {
                            formData.append(`${key}[]`, item); // Append with the same key for non-empty arrays
                        });
                    }
                } else {
                    formData.append(key, value)
                }
            }
            let payload = formData;

            
            await dispatch(updateTask(currentTask._id, payload))
            setLoader(false)
            
        }
    }

    const handleDelteComment = async (commentId, feedId) => {
        DeleteComment(commentId, feedId)
    }

    const showError = (name) => {
        if (errors[name]) return (<span className="error">{errors[name]}</span>)
        return null
    }

    const handleRemovefiles = (id) => {
        let previousfiles = fields['files']
        const updatedFiles = previousfiles.filter(file => file !== id);
        setFields({ ...fields, ['files']: updatedFiles })
        const previewfiles = currentTask.files.filter(file => file._id !== id);
        dispatch(updateStateData(CURRENT_TASK, { ...currentTask, ['files']: previewfiles }));
    }

    const handleRemove = (indexToRemove) => {
        const selectedFiles = commonState.projectForm.images
        const updatedSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
        // setSelectedFiles(updatedSelectedFiles);
        dispatch(updateStateData(TASK_FORM, { images: updatedSelectedFiles }))
        setImagePreviews(updatedImagePreviews);
    };

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

    // Function to remove the last member
    const removeMember = (member) => {
        const updatedSelectedMembers = { ...commonState.taskForm.members };
        delete updatedSelectedMembers[member];
        delete fields['members'][member]
        // dispatch(updateStateData(TASK_FORM, { members: updatedSelectedMembers }))
       
         dispatch(updateTask(currentTask._id, {members: Object.keys(updatedSelectedMembers)}))
    };
    
    const [taskModalState, setTaskModalState] = useState(refreshstates(commonState.active_formtype || false))

    const handlesubtaskChange = (index, oldval, newval ) => {
       
        const newSubtasks = [...subtasks];
        newSubtasks[index] = (typeof oldval === "object" && oldval._id ) ? {...oldval, ['title']: newval } : newval ; // Update the specific subtask
        setSubtasks(newSubtasks); // Update the local state with the new subtasks array
        setFields({...fields, ['subtasks']: newSubtasks})
        // Dispatch the updated subtasks to global state
        dispatch(updateStateData(TASK_FORM, { subtasks: newSubtasks }));
       
        
    }

    const handleChange = ({ target: { name, value } }) => {
        
            // Handle other form inputs
            setFields({...fields, [name]: value})
            dispatch(updateStateData(TASK_FORM, { [name]: value }));
            setErrors({ ...errors, [name]: '' });
        // }
    };
    const addSubtask = () => {
        setSubtasks([...subtasks, '']);
    }

    const removeSubtask = (index) => {
        const newSubtasks = subtasks.filter((_, i) => i !== index); // Remove the subtask at the given index
        setSubtasks(newSubtasks); // Update local state
        dispatch(updateStateData(TASK_FORM, { subtasks: newSubtasks })); // Dispatch the updated subtasks
        dispatch(updateTask(currentTask._id, {subtasks: newSubtasks}))
    };

    // Function to handle blur event on subtask input
    const handleBlur = (index) => { 
        const subtaskValue = subtasks[index];
        if (subtaskValue === '') {
            removeSubtask(index);
        }else{
             dispatch(updateTask(currentTask._id, {subtasks: subtasks}))
             
        }
    };

    useEffect(() => {
        console.log("enablesubtaskedit:: ", enablesubtaskedit)
    }, [enablesubtaskedit])

    const updateSubtask = (ischecked, index) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index] = {...newSubtasks[index], ['status']: ischecked }; // Update the specific subtask
        setSubtasks(newSubtasks); 
        dispatch( updateTask( currentTask._id, { subtasks: newSubtasks}))
    }

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        // Check if the item was dropped outside the list or in the same place
        if (!destination || (source.index === destination.index)) {
            return; // Do nothing if not moved
        }

        // Create a new array to update subtasks
        const newSubtasks = Array.from(subtasks);
        // Move the dragged subtask to the new position
        const [removed] = newSubtasks.splice(source.index, 1);
        newSubtasks.splice(destination.index, 0, removed);

        // Update the order for each subtask based on the new index
        const updatedSubtasks = newSubtasks.map((subtask, index) => ({
            ...subtask,
            order: index // Set the order to the current index
        }));

        // Update the state with the new order
        setSubtasks(updatedSubtasks);
        dispatch( updateTask( currentTask._id, { subtasks: updatedSubtasks}))
    };

   
    const renderSubtasks = () => { 
        
        return subtasks.map((subtask, index) => (
            
            <Draggable
                key={`subtaskindex-${index}`}
                draggableId={`sub-task-${index}`}
                index={index}
            >
                {(provided) => (
                <li 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Form.Group className="mb-0 form-group pb-0" key={`subtask-${index}`}>
                        {
                            (typeof subtask === 'object' ) &&
                            <>
                                <GrDrag />
                                <input type='checkbox' onChange={(e) => {updateSubtask(e.target.checked, index)}} checked={
                                    subtask?.status || false
                                } />
                            </>
                        }
                         
                         {typeof subtask !== 'object' ? (
                            <input 
                                className="form-control" 
                                rows="2" 
                                onBlur={() => handleBlur(index)}
                                name={`subtask-${index}`} 
                                placeholder="Enter subtask" 
                                value={subtask} 
                                onChange={({ target: { value } }) => handlesubtaskChange(index, subtask, value)} 
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault(); // Prevent form submission on Enter
                                        handleBlur(index); // Handle saving on Enter
                                    }
                                }}
                            />
                        ) : (
                            <div
                                className="form-control"
                                contentEditable={typeof subtask === 'object' && enablesubtaskedit[subtask._id] === true}
                                suppressContentEditableWarning={true}
                                onClick={(e) => {
                                    if (e.target.tagName === 'A') return;
                                    if (typeof subtask === 'object') {
                                        setEnableSubtakEdit({ [subtask._id]: true });

                                        // Set caret to the end after enabling edit
                                        setTimeout(() => {
                                            const editableDiv = document.getElementById(`editable-subtask-${subtask._id}`);
                                            editableDiv.focus();
                                            const range = document.createRange();
                                            const selection = window.getSelection();
                                            range.selectNodeContents(editableDiv);
                                            range.collapse(false);
                                            selection.removeAllRanges();
                                            selection.addRange(range);
                                        }, 0);
                                    }
                                }}
                                onBlur={(e) => {
                                    if (typeof subtask === 'object') {
                                        setEnableSubtakEdit({ [subtask._id]: false });
                                        // Save content, converting <br> to \n
                                        const content = e.target.innerHTML.replace(/<br\s*\/?>/gm, '\n');
                                        handlesubtaskChange(index, subtask, content);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault(); // Prevent new line on Enter
                                        e.target.blur(); // Trigger blur to save and disable editing
                                    }
                                }}
                                id={`editable-subtask-${subtask._id}`}
                                style={{
                                    cursor: enablesubtaskedit[subtask._id] ? 'text' : 'pointer',
                                    border: 'none',
                                    padding: '0.5rem 0',
                                    minHeight: '2rem',
                                    overflowWrap: 'break-word',
                                }}
                                placeholder="Enter subtask"
                                dangerouslySetInnerHTML={{
                                    __html: typeof subtask === 'object' 
                                        ? makeLinksClickable(subtask.title.replace(/\n/g, '<br/>')) // Convert line breaks to <br> for display
                                        : makeLinksClickable(subtask.replace(/\n/g, '<br/>')),       // Handle string subtasks as well
                                }}
                            ></div>
                        )}

                        <button type="button"  variant="primary" onClick={() => removeSubtask(index)}>
                            <FaRegTrashAlt />
                        </button>
                    </Form.Group>
                </li>
                )}
                </Draggable>
           
            
        ));
    };

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            pasteOccurred.current = true; // Mark that a paste action is expected
            console.log('Paste keyboard shortcut detected');
        }
    };

    const handlePaste = (e) => {
        const pastedData = e.clipboardData.getData('text');
        console.log('Pasted content:', pastedData);
        pasteOccurred.current = true; // Set the paste flag to true

        setTimeout(function(){
            pasteOccurred.current = false;
        },500)
    };

    const handleDescBlur = debounce(async() => {
        if (pasteOccurred.current) {
            pasteOccurred.current = false; // Reset the flag after handling paste
            return;
        }
       // setTimeout(async function(){
            await dispatch(updateTask(currentTask._id, { description: fields['description'] }));
       // },1000)
        // Perform onBlur logic here
        
    
    },2000)

    const Initials = ({ id, children, title }) => {
        return (
            <OverlayTrigger placement="bottom" overlay={<Tooltip id={id}>{title}</Tooltip>}>
                {children}
            </OverlayTrigger>

        )
    };

    return (
        <>
        <Modal show={modalstate} onHide={async () => { 
            TaskUpdate()
            dispatch(updateStateData(CURRENT_TASK, {}));dispatch(updateStateData(ACTIVE_FORM_TYPE, 'edit_project')); dispatch(togglePopups('taskform', false));
            }
            } centered size="lg" className="add--member--modal edit--task--modal modalbox" onShow={() => selectboxObserver()}>
            <Modal.Header closeButton>
                {/* <Modal.Title>{currentTask?._id ? '' : 'Create New Task'}</Modal.Title> */}
            </Modal.Header>
            <Modal.Body>
                <div className="project--form">
                    <div className="project--form--inputs" data-tabid={fields['tab']}>
                        <Form onSubmit={() => {return false}} key={`taskform-${commonState?.taskForm?.tab}`}>
                            <Form.Group className="mb-0 form-group task--title">
                                <Form.Label><small>Title</small></Form.Label>
                                <Form.Control type="text" key={`task-title-${commonState?.taskForm?.tab}`} name="title" placeholder="Task Title" value={fields['title'] || ""} onChange={handleChange} onBlur={(e) => {
                                    if(currentTask.title !== fields['title']){
                                        dispatch( updateTask( currentTask._id, {title: fields['title']}))
                                    }
                                }} />
                                {showError('title')}
                                <span className='pencil--edit'><BiSolidPencil /></span>
                            </Form.Group>
                            {/* <Form.Group className="mb-0 form-group">
                                <Form.Label>
                                    <small>Workflow status</small>
                                    {
                                        commonState.currentProject && commonState.currentProject.workflow && commonState.currentProject.workflow.tabs && commonState.currentProject.workflow.tabs.length > 0 &&
                                        
                                        <div className="status--modal" onClick={() => {
                                            setFlowstatus(commonState.currentProject.workflow.tabs);
                                            setWorkflowStatus( true )
                                        }}>
                                             {commonState.currentProject.workflow.tabs.map((status, index) => 
                                                // Directly compare and return if matched
                                                status._id === commonState?.taskForm?.tab ? (
                                                    <div key={`status-${index}`} className="status-item">
                                                        <span className={`status--circle workflow--color-${index}`}></span>
                                                        {status.title} <FaChevronDown />
                                                    </div>
                                                ) : null // Return null for non-matching items
                                            )}
                                            
                                        </div>
                                    }
                                </Form.Label>
                            </Form.Group> */}
                            
                           
                            <Form.Group className="mb-0 form-group">
                                <Form.Label className="w-100 m-0">
                                    <small onClick={() => {
                                        setIsDescEditor(prevState => !prevState);
                                    }}>Description</small>
                                    {
                                        !isdescEditor &&
                                        <strong className="add-descrp" onClick={() => {
                                            setIsDescEditor(prevState => !prevState);
                                        }}><FiFileText /> Add a description</strong>
                                    }
                                    
                                    
                                </Form.Label>
                                <div className={isdescEditor ? 'text--editor show--editor' : 'text--editor'}>
                                        <ReactQuill 
                                        value={fields['description'] || ''}
                                        onChange={(value) => { 
                                            // dispatch(updateStateData(TASK_FORM, { ['description']: sanitizeEmptyQuillValue(value) }));
                                            
                                                console.log('Pasted value:', value);
                                                setFields((prevFields) => ({
                                                ...prevFields,
                                                description: value,
                                                }));
                                                setErrors((prevErrors) => ({ ...prevErrors, description: '' }));
                                            
                                        }}
                                        onKeyDown={handleKeyDown}
                                        //  onBlur={handleDescBlur} // Custom blur handler
                                        ref={(el) => {
                                            if (el) {
                                                const editor = el.getEditor();
                                                editor.root.addEventListener('paste', handlePaste); // Listen for paste
                                            }
                                        }}
                                        modules={modules}
                                        formats={formats}
                                        // onBlur={async (e) => {
                                        //     if (!isPaste) {
                                        //         console.log('no')
                                        //     }else{
                                        //         console.log('yes')
                                        //     }
                                        //     // await dispatch(updateTask(currentTask._id, {description: fields['description']}))
                                        // }}
                                        />
                                    </div>
                            </Form.Group>
                            {/* <Form.Group className="mb-0 form-group">
                                <Form.Label>
                                    <small>Due Date</small>
                                </Form.Label>
                                <Row>
                                    <Col sm={12} lg={6}>
                                        <Form.Control type="date" name="due_date" onChange={async (e) => {
                                             await dispatch(updateTask(currentTask._id, {due_date: e.target?.value}))
                                        }} value={fields['due_date'] || ''} />
                                    </Col>
                                </Row>
                            </Form.Group> */}

                            <Form.Group className="mb-0 form-group pb-0">
                                <Form.Label className="w-100 m-0">
                                    <small>Subtasks</small>
                                </Form.Label>
                            </Form.Group>
                            
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId={`droppable-subtasks-List-${currentTask?._id}`} type="SUBTASKS">
                                    {(provided) => (
                                        <div className='subtasks-List' ref={provided.innerRef} {...provided.droppableProps}>
                                            <ul
                                                id={`subtasks-ul`}
                                                className="subtasks--list"
                                                style={{ overflowY: 'auto', height: '100%' }}
                                            >
                                                {renderSubtasks()}
                                                {provided.placeholder} {/* Important for spacing during drag */}
                                            </ul>
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                           
                            <small
                                className="add-subtasks"
                                style={{ cursor: 'pointer', opacity: subtasks.length && subtasks.some(subtask => subtask === '') ? 0.5 : 1 }}
                                onClick={subtasks.length && subtasks.some(subtask => subtask === '') ? null : addSubtask}
                            >
                                <FaPlus /> Add subtasks
                            </small>

                            
                            <Form.Group className="mb-0 mt-3 form-group">
                                <Form.Label className="w-100 m-0">
                                    <small>Task chat</small>
                                </Form.Label>
                                {
                                    currentTask && currentTask.comments && currentTask.comments.length > 0 &&
                                    <Row>
                                        <Col sm={12}>
                                            
                                                {
                                                    currentTask.comments.map((comment, index) => {
                                                        if( editmessage[comment._id] && editmessage[comment._id]['show'] === true ){
                                                            return (
                                                                <div className='message--edit'>
                                                                    <Form.Control type='text' value={editmessage[comment._id].msg} onChange={(e) => {
                                                                        setEditMessage(prev => ({
                                                                            ...prev, // Spread the previous state
                                                                            [comment._id]: {
                                                                                show: true,
                                                                                msg: e.target.value // Update with the current input value
                                                                            }
                                                                        }));
                                                                    }}
                                                                    ></Form.Control>
                                                                    <ListGroup horizontal className='task--action--buttons'>
                                                                        <ListGroup.Item key={`edit-comment-${comment._id}`} className="more--actions">
                                                                            <Button variant='secondary' onClick={(e) => {
                                                                                setEditMessage(prev => ({
                                                                                    ...prev, // Spread the previous state
                                                                                    [comment._id]: {
                                                                                        show: false,
                                                                                        msg: e.target.value // Update with the current input value
                                                                                    }
                                                                                }));
                                                                            }}>Cancel</Button>
                                                                            </ListGroup.Item>
                                                                            <ListGroup.Item key={`delete-comment-${comment?._id}`} className="more--actions">
                                                                                <Button variant='primary' onClick={() => {
                                                                                    UpdateComment(comment._id, editmessage[comment?._id]['msg'])
                                                                                    setEditMessage({[comment._id]: { show: false, msg: editmessage[comment?._id]['msg']}})
                                                                                }}>Save</Button>
                                                                            </ListGroup.Item>
                                                                    </ListGroup>
                                                                </div>
                                                            )
                                                        }else{
                                                            return (
                                                                <p className='d-flex align-items-center task--message' key={`comment-${comment._id}`}>
                                                                    <div className='msg-member-info'>
                                                                        {
                                                                            comment?.author?.avatar && comment?.author?.avatar !== null ?

                                                                            <Image src={comment?.author?.avatar} roundedCircle />
                                                                            :
                                                                            <Initials title={comment?.author?.name}>
                                                                                <span className={`team--initial nm-${comment?.author?.name?.substring(0, 1).toLowerCase()}`}>
                                                                                    {comment?.author?.name?.substring(0, 1).toUpperCase()}
                                                                                </span>
                                                                            </Initials>
                                                                        }
                                                                        
                                                                        
                                                                        <p>
                                                                            <small>{formatTimeAgo(comment?.createdAt)}</small>
                                                                            {comment.text} 
                                                                        </p>
                                                                    </div>
                                                                    <Dropdown>
                                                                        <Dropdown.Toggle variant="primary" id={`toogle-btn-${currentTask?._id}`}>
                                                                            <FaEllipsisV />
                                                                        </Dropdown.Toggle>
                                                                        <Dropdown.Menu>
                                                                            <div className="over--scroll">
                                                                                <Dropdown.Item key={`dropdown-member-${index}`}>
                                                                                    <Button onClick={() => {setEditMessage({[comment._id]: {show: true, msg: comment.text}})}}>Edit message</Button>
                                                                                    <Button onClick={() => handleDelteComment(comment?._id, currentTask?._id)}>Delete message</Button>
                                                                                </Dropdown.Item>
                                                                            </div>
                                                                        </Dropdown.Menu>
                                                                    </Dropdown>
                                                                </p>
                                                            )
                                                        }
                                                    })
                                                }
                                            
                                        </Col>
                                    </Row>
                                }
                                
                                <Row>
                                    <Col sm={12}>
                                        <InputGroup className="mb-0">
                                            <Form.Control
                                                placeholder="Message"
                                                name="message"
                                                onChange={handleNewComment} value={comments || ''}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        event.preventDefault(); // Prevent the default behavior (like form submission)
                                                        handleCommentSubmit()// Call your function to handle the Enter press
                                                    }
                                                }}
                                            />
                                            <Button variant="outline-secondary" id="send-message" onClick={(() => handleCommentSubmit())}><FaPaperPlane /></Button>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Form>
                    </div>
                    <div className="project--form--actions">
                        <h4>Actions</h4>
                        <ListGroup>
                            <ListGroup.Item onClick={() => { dispatch(togglePopups('members', true)) }}><FaPlus />Assign to</ListGroup.Item>
                            <p className="m-0">
                                {fields['members'] && Object.keys(fields['members']).length > 0 && (
                                    <MemberInitials directUpdate={true} members={fields['members']} showRemove={true}  showall={true} showAssign={false} postId={`${currentTask?._id}`} type = "task" />
                                )}
                            </p>

                            <ListGroup.Item onClick={handleUploadShow}><GrAttachment />Attach files</ListGroup.Item>
                            <div className="output--file-preview">
                                <div className="preview--grid">
                                    {
                                        currentTask && currentTask.files && currentTask.files.length > 0 &&
                                        currentTask.files.map((preview, index) => (
                                            <div key={index}>{renderPreview('old', preview, index)}</div>
                                        ))
                                    }
                                    {imagePreviews.map((preview, index) => (
                                        <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                                    ))}
                                </div>
                            </div>
                            <ListGroup.Item onClick={() => { setDatePickerModal ( true )}}>
                                <label for='date--picker'><FaRegCalendarAlt /> Due date</label>
                                <label for='date--picker' className='date--new mb-0'>{fields['due_date']}</label>
                            </ListGroup.Item>
                            <ListGroup.Item onClick={() => { setFlowstatus(commonState.currentProject.workflow.tabs); setWorkflowStatus( true )}}>
                                <LuWorkflow />Workflow status
                                <Form.Group className="mb-0 form-group pb-0">
                                    <Form.Label>
                                        {
                                            commonState.currentProject && commonState.currentProject.workflow && commonState.currentProject.workflow.tabs && commonState.currentProject.workflow.tabs.length > 0 &&
                                            <div className="status--modal" >
                                                {commonState.currentProject.workflow.tabs.map((status, index) => 
                                                    // Directly compare and return if matched
                                                    status._id === commonState?.taskForm?.tab ? (
                                                        <div key={`status-${index}`} className="status-item">
                                                            <span className={`status--circle workflow--color-${index}`}></span>
                                                            {status.title} <FaChevronDown />
                                                        </div>
                                                    ) : null // Return null for non-matching items
                                                )}
                                                
                                            </div>
                                        }
                                    </Form.Label>
                                </Form.Group>
                            </ListGroup.Item>
                            <ListGroup.Item className='text-danger' onClick={async () => {
                                setLoader( true)
                                await dispatch(deleteTask(currentTask._id))
                                setLoader( false)
                                dispatch(togglePopups('taskform', false))
                                }} disabled={loader}><FaRegTrashAlt 
                            /> {loader ? 'Please wait...' : 'Delete'}</ListGroup.Item>
                        </ListGroup>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        <Modal show={datePickerModal} onHide={() => { setDatePickerModal( false )}} centered size="md" className="date--picker--modal">
                <Modal.Header closeButton>
                    {/* <Modal.Title>Workflow status</Modal.Title> */}
                </Modal.Header>
                <Modal.Body>
                    <DatePicker 
                        name="due_date"
                        id='date--picker'
                        value={fields['due_date'] ? parseDateWithoutTimezone(fields['due_date']) : ''} 
                        onChange={async (value) => {
                            const date = value.toDate();
                            // Manually format the date to YYYY-MM-DDTHH:mm:ss.sss+00:00 without converting to UTC
                            const year = date.getFullYear();
                            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
                            const day = date.getDate().toString().padStart(2, '0');
                            const hours = date.getHours().toString().padStart(2, '0');
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            const seconds = date.getSeconds().toString().padStart(2, '0');
                            const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
                            // Combine into the desired format
                            const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
                            dispatch(updateStateData(TASK_FORM, { ['due_date']: formattedDate }));
                            setDatePickerModal(false)
                        }
                        }                    
                        className="form-control"
                        placeholder="dd/mm/yyyy"
                    />
                </Modal.Body>
            </Modal> 
        <FilesPreviewModal showPreview={showPreview} imagePreviews={imagePreviews}  toggle={setPreviewShow} filetoPreview={filetoPreview} />
            <Modal show={workflowstatus} onHide={() => { setWorkflowStatus( false )}} centered size="md" className="status--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Workflow status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Control type="text" placeholder="Search here" value={search} onChange={handleSearchChange} />
                        </Form.Group>
                    </Form>
                    <ListGroup className="status--list">
                    {
                      filteredStatuses.map((status, index) => (
                        <ListGroup.Item key={`status-${status._id}`} className={commonState?.taskForm?.tab == status._id ? "status--active": ""} onClick={async () => {
                            await dispatch(updateTask(currentTask._id, {tab: status._id}))
                            setWorkflowStatus( false )
                          }}>
                            <p><span class={`workflow--color-${index} status--circle`}></span> {status.title} {commonState?.taskForm?.tab === status._id && <FaCheck />}</p>
                        </ListGroup.Item>
                       ))}
                        
                    </ListGroup>
                </Modal.Body>
            </Modal>                

        </>
    )
}