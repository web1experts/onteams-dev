import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, ListGroup, Accordion, Form, FloatingLabel, Dropdown } from "react-bootstrap";
import { FaPlus, FaPlay, FaPause, FaRegTimesCircle, FaEllipsisV } from "react-icons/fa";
import { TASK_FORM, RESET_FORMS, TASK_FORM_TYPE, ACTIVE_FORM_TYPE, CURRENT_TASK } from "../../redux/actions/types";
import { togglePopups, updateStateData } from "../../redux/actions/common.action";
import { ListTasks, updateTask, createTask, reorderTasks } from "../../redux/actions/task.action";
import { GrAttachment } from "react-icons/gr";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getFieldRules, validateField } from '../../helpers/rules';
import { TiInputChecked } from "react-icons/ti";
import { MemberInitials } from "../common/memberInitials";
const TasksList = React.memo((props) => {
    const dispatch = useDispatch()
    const [fields, setFields] = useState({ title: '' })
    const [errors, setErrors] = useState({})
    const commonState = useSelector(state => state.common)
    const apiResult = useSelector(state => state.task);
    const [showtaskform, setShowtaskform] = useState({})
    const taskFeed = useSelector(state => state.task.tasks);
    const [taskslists, setTasksLists] = useState([])
    const [showProject, setProjectShow] = useState(false);
    const handleProjectClose = () => setProjectShow(false);
    const handleProjectShow = () => setProjectShow(true);
    const [showTask, setTaskShow] = useState(false);
    const handleTaskClose = () => setTaskShow(false);
    const handleTaskShow = () => dispatch(togglePopups('taskform', true))
    const [currentProject, setCurrentProject] = useState({})
    const [spinner, setSpinner] = useState(false)
    const [loader, setLoader] = useState(false);

    let fieldErrors = {};
    const handleListTasks = async () => {
        // let selectedfilters = { currentPage: currentPage }
        // if (Object.keys(filters).length > 0) {
        //     selectedfilters = { ...selectedfilters, ...filters }
        // }
        await dispatch(ListTasks(commonState?.currentProject?._id));
        setSpinner(false)
    }

    useEffect(() => {
        if (commonState.currentProject) {
            setCurrentProject(commonState.currentProject)
        }
    }, [commonState.currentProject])

    useEffect(() => {
        if (commonState?.currentProject && commonState?.currentProject?._id) {
            handleListTasks()
            setSpinner(true)
        }

    }, [commonState?.currentProject])

    useEffect(() => {
        if (taskFeed?.taskData && Object.keys(taskFeed.taskData).length > 0) {
            setTasksLists(taskFeed.taskData)
            if (apiResult.currentTask && apiResult.currentTask._id && taskFeed?.taskData?.[apiResult.currentTask.tab] && taskFeed?.taskData?.[apiResult.currentTask.tab].tasks) {
                const taskToUpdate = taskFeed.taskData[apiResult.currentTask.tab].tasks.find(task => task._id === apiResult.currentTask._id);

                if (taskToUpdate) {
                    dispatch(updateStateData(CURRENT_TASK, taskToUpdate));
                }
            }
        }
    }, [taskFeed, dispatch])

    useEffect(() => {

        if (apiResult.success) {
            handleListTasks()
            // setSpinner(true)
            setShowtaskform(false)
        }

    }, [apiResult])



    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // If there's no destination (i.e., the item was dropped outside), do nothing
        if (!destination) return;
        const taskId = draggableId.split('-')[1];
        // Check if the task was moved within the same tab or to a different tab
        const sourceTabId = source.droppableId.split('-')[1]; // Get source tab ID
        const destinationTabId = destination.droppableId.split('-')[1]; // Get destination tab ID
        let replacedTaskId = null;

        if (sourceTabId === destinationTabId) {
            // Handle reordering within the same tab
            const reorderedTasks = Array.from(taskslists[sourceTabId].tasks);
            replacedTaskId = reorderedTasks[destination.index]?._id;

            const [removed] = reorderedTasks.splice(source.index, 1); // Remove task from the source position
            reorderedTasks.splice(destination.index, 0, removed); // Add task to the destination position



            // Update the state with the reordered tasks
            setTasksLists({
                ...taskslists,
                [sourceTabId]: { ...taskslists[sourceTabId], tasks: reorderedTasks }
            });
            
           
            const tasksToUpdate =
            {
                task_id: taskId,
                tabId: sourceTabId,
                order: destination.index,

            }
            dispatch(reorderTasks({ tasks: tasksToUpdate }));
        } else {
            // Handle moving between different tabs
            const sourceTasks = Array.from(taskslists[sourceTabId].tasks);
            const destinationTasks = Array.from(taskslists[destinationTabId].tasks);

            replacedTaskId = destinationTasks[destination.index]?._id;

            const [movedTask] = sourceTasks.splice(source.index, 1); // Remove task from the source tab
            destinationTasks.splice(destination.index, 0, movedTask); // Add task to the destination tab

            // Update the state for both source and destination tabs
            setTasksLists({
                ...taskslists,
                [sourceTabId]: { ...taskslists[sourceTabId], tasks: sourceTasks },
                [destinationTabId]: { ...taskslists[destinationTabId], tasks: destinationTasks }
            });

            const tasksToUpdate =
            {
                task_id: taskId,
                tabId: destinationTabId,
                order: destination.index,
                tab_update: true

            }
            dispatch(reorderTasks({ tasks: tasksToUpdate }));

            console.log(`Task ${taskId} moved from tab ${sourceTabId} to tab ${destinationTabId} from position ${source.index} to ${destination.index}`);
            if (replacedTaskId) {
                console.log(`Task ${replacedTaskId} was replaced at position ${destination.index} in tab ${destinationTabId}`);
            }

        }
    };

    const handleChange = ({ target: { name, value } }) => {
        setFields({ ...fields, [name]: value })
        setErrors({ ...errors, [name]: '' });

    };

    const removeMember = (id, task) => {
        let taskMembers = [];

        task.members.forEach(member => {

            if (member._id !== id) {
                taskMembers.push(member._id)
            }
        });

        dispatch(updateTask(task._id, { members: taskMembers }))
    };

    const handleTasksubmit = async (e) => {

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
                formData.append(key, value)
            }
            let payload = formData;


            await dispatch(createTask(payload))
            setLoader(false)
            closetask(fields['tab'])

        }
    }

    const closetask = (tabid) => {
        setShowtaskform({ [tabid]: false })
    }

    // const MemberInitials = ({ id, children, title }) => {
    //     return (
    //         <OverlayTrigger placement="bottom" overlay={<Tooltip id={id}>{title}</Tooltip>}>
    //             {children}
    //         </OverlayTrigger>
    //     )
    // };


    return (
        <>
            {
                spinner &&
                <div className="loading-bar">
                    <img src="images/OnTeam-icon-gray.png" className="flipchar" />
                </div>
            }
            {props.activeTab === 'GridView' && (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="task--list">
                        {currentProject && Object.keys(currentProject).length > 0 && currentProject?.workflow?.tabs?.length > 0 &&
                            currentProject?.workflow?.tabs.map((tab, index) => (
                                <div key={tab._id} className={`task--grid workflow--color-${index}`}>
                                    <h5>
                                        {tab.title}
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setFields({ title: '', tab: tab._id, project_id: currentProject?._id, order: 0 })
                                                // dispatch(updateStateData(ACTIVE_FORM_TYPE, 'task_create'));
                                                // dispatch(updateStateData(TASK_FORM, { tab: tab._id, project_id: currentProject?._id }));
                                                setShowtaskform({ [tab._id]: true })
                                                // handleTaskShow();
                                            }}
                                        >
                                            <FaPlus />
                                        </Button>
                                    </h5>
                                    <Droppable droppableId={`droppable-${tab._id}`} type="TASKS">
                                        {(provided) => (
                                            <ul
                                                id={`workflow-tab-${tab._id}`}
                                                className="tasks--list"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{ overflowY: 'auto', height: '100%' }}
                                            >
                                                {
                                                    showtaskform[tab._id] && showtaskform[tab._id] === true &&
                                                    <li class="task--button">
                                                        <Form onSubmit={(e) => {
                                                            handleTasksubmit(e)
                                                            //closetask(tab._id)

                                                        }} onBlur={(e) => {
                                                            handleTasksubmit(e)
                                                            //closetask(tab._id)

                                                        }}>
                                                            <Form.Group className="mb-0 form-group">
                                                                <FloatingLabel label="Task Title *">
                                                                    <Form.Control type="text" name="title" placeholder="Task Title" onChange={handleChange} readOnly={loader} />
                                                                </FloatingLabel>
                                                                <span className="close-task" onClick={() => { closetask(tab._id) }}><FaRegTimesCircle /></span>
                                                            </Form.Group>
                                                            <Form.Text muted>Press enter to add</Form.Text>
                                                        </Form>
                                                    </li>
                                                }

                                                {
                                                    taskslists[tab._id]?.tasks &&  taskslists[tab._id]?.tasks?.length > 0 && 

                                                    taskslists[tab._id]?.tasks?.map((task, index) => (
                                                    <Draggable
                                                        key={task?._id}
                                                        draggableId={`task-${task?._id}`}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <li
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="task--button"
                                                                onClick={async () => {
                                                                    await dispatch(updateStateData(ACTIVE_FORM_TYPE, 'task_edit'));
                                                                    await dispatch(updateStateData(CURRENT_TASK, task))
                                                                    handleTaskShow();
                                                                }}
                                                            >
                                                                {task.title}
                                                                <div className="tasks-form-action">
                                                                    {
                                                                        task.subtasks && task.subtasks.length > 0 && (
                                                                            <>
                                                                                <span className="subtask-count" key={`subtask-count-${task._id}`}>
                                                                                    <TiInputChecked />
                                                                                    {task.subtasks.filter(subtask => subtask.status === true).length} / {task.subtasks.length}
                                                                                </span>
                                                                            </>
                                                                        )
                                                                    }
                                                                    {
                                                                        task.files && task.files.length > 0 &&
                                                                            <>
                                                                                <span className="files-count" key={`files-count-${task._id}`}>
                                                                                    <GrAttachment />
                                                                                   {task.files.length}
                                                                                </span>
                                                                            </>
                                                                    }
                                                                    <p className="m-0 ms-auto">
                                                                        {task?.members && task?.members.length > 0 && (
                                                                            <MemberInitials  directUpdate={true} members={task?.members} showRemove={false} showAssign={false} postId={task._id} type = "task"
                                                                            //  onMemberClick={(memberid, extraparam = false) => removeMember( memberid,task)} 
                                                                             />

                                                                            // task.members.slice(0, 3).map((member, index) => (
                                                                            //     <ListGroup.Item action key={`key-member-${index}`}>
                                                                            //         {/* Assuming `member` is an object with a `name` or `title` */}
                                                                            //         <MemberInitials title={member.name || member} id={`assign_member-${index}`}>
                                                                            //             <span className={`team--initial nm-${member.name.charAt(0).toLowerCase()}`}>{(member.name || member)?.charAt(0).toUpperCase()}</span>
                                                                            //         </MemberInitials>
                                                                            //         <span className="remove-icon" onClick={(e) => { e.stopPropagation(); removeMember(member._id, task) }}>
                                                                            //             <MdOutlineClose />
                                                                            //         </span>
                                                                            //     </ListGroup.Item>
                                                                            // ))
                                                                        )}
                                                                        {/* {task?.members.length > 3 && (
                                                                            <ListGroup.Item key={`more-member-${task._id}`} className="more--member">
                                                                                <span>+{task.members.slice(3).length}</span>
                                                                            </ListGroup.Item>
                                                                        )} */}
                                                                    </p>
                                                                </div>
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                </div>
                            ))
                        }
                    </div>
                </DragDropContext>
            )}
            {props?.activeTab === 'ListView' && (
                <Accordion defaultActiveKey="0" className="bg-light p-3">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Assigned Task</Accordion.Header>
                        <span type="button" variant="primary" className="btn btn-primary" onClick={handleTaskShow}><FaPlus /></span>
                        <Accordion.Body>
                            <ListGroup>
                                <ListGroup.Item key={"design"} className="active--task">
                                    <span className="play--timer">
                                        <FaPlay />
                                        <FaPause className="d-none" />
                                    </span>
                                    Design Landing Page
                                </ListGroup.Item>
                            </ListGroup>
                            <ListGroup>
                                <ListGroup.Item key={"designi"}>
                                    <span className="pause--timer">
                                        <FaPlay className="d-none" />
                                        <FaPause />
                                    </span>
                                    Design Landing Page
                                    <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                            </ListGroup>

                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>In Progress</Accordion.Header>
                        <Accordion.Body>
                            <ListGroup>
                                <ListGroup.Item key={"design1"} className="active--task">
                                    <span className="play--timer">
                                        <FaPlay />
                                        <FaPause className="d-none" />
                                    </span>
                                    Design Landing Page
                                    {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                            </ListGroup>
                            <ListGroup>
                                <ListGroup.Item key={"design2"}>
                                    <span className="pause--timer">
                                        <FaPlay className="d-none" />
                                        <FaPause />
                                    </span>
                                    Design Landing Page
                                    <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                            </ListGroup>

                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>In Review</Accordion.Header>
                        <Accordion.Body>
                            <ListGroup>
                                <ListGroup.Item key={"design3"} className="active--task">
                                    <span className="play--timer">
                                        <FaPlay />
                                        <FaPause className="d-none" />
                                    </span>
                                    Design Landing Page
                                    {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                            </ListGroup>
                            <ListGroup>
                                <ListGroup.Item key={"design4"}>
                                    <span className="pause--timer">
                                        <FaPlay className="d-none" />
                                        <FaPause />
                                    </span>
                                    Design Landing Page
                                    <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                            </ListGroup>

                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>Completed</Accordion.Header>
                        <Accordion.Body>
                            <ListGroup>
                                <ListGroup.Item key={"design6"} className="active--task">
                                    <span className="play--timer">
                                        <FaPlay />
                                        <FaPause className="d-none" />
                                    </span>
                                    Design Landing Page
                                    {/* <span class="time--span">01:22:32</span> */}
                                </ListGroup.Item>
                            </ListGroup>
                            <ListGroup>
                                <ListGroup.Item key={"design7"}>
                                    <span className="pause--timer">
                                        <FaPlay className="d-none" />
                                        <FaPause />
                                    </span>
                                    Design Landing Page
                                    <span className="time--span">01:22:32</span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            )}
        </>
    )
})

export default TasksList