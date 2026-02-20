// CommentThread.js
import React, { useState } from "react";
import { Card, Button, Form, Dropdown } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { FaEllipsisV } from 'react-icons/fa';
import { getMemberdata } from "../../helpers/commonfunctions";
import {
  SendComment,
  DeleteComment
} from "../../helpers/auth";
const Comment = ({ comment, memberdata, parentId, allowReply }) => {
  const [selectedComment, setSelectedComment] = useState({});
  const handleDelete = (comment_id, post) => {
    DeleteComment(comment_id, post, "post");
  };
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Here, you'd send the replyText to your backend or state handler
    SendComment(
      "post",
      replyText,
      comment?.post,
      memberdata?._id,
      selectedComment?._id
    );

    // Clear and close reply input
    setReplyText("");
    setShowReply(false);
  };
  return (
    <Card className="mb-2">
      <div className="title--initial">{comment.author?.name?.charAt(0)}</div>
      <Card.Body>
        <Card.Title>
          {comment.author?.name}
          {memberdata?._id === comment.author?._id && (
            <Dropdown className="edit--dropdown">
              <Dropdown.Toggle variant="dark"><FaEllipsisV /></Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleDelete(comment._id, comment?.post)}><BsTrash /> Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            // <Button variant="danger" size="sm" className="delete--button px-2 py-1" onClick={() => handleDelete(comment._id, comment?.post)}><BsTrash /></Button>
          )}
        </Card.Title>
        <Card.Text><pre>{comment.text}</pre></Card.Text>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 ps-4 border-start border-2">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                parentId={comment._id}
                allowReply={false}
              />
            ))}
          </div>
        )}
        {allowReply === true && (
          <Button
            variant="dark"
            size="sm"
            className="px-2 py-1"
            onClick={() => {
              setShowReply(!showReply);
              setSelectedComment(comment);
            }}
          >
            {showReply ? "Cancel" : "Reply"}
          </Button>
        )}

        {showReply && (
          <Form onSubmit={handleReplySubmit} className="mt-2 d-flex gap-2">
            <Form.Group
              className="form-group w-100 pb-0"
              controlId={`reply-${comment.id}`}
            >
              <Form.Control
                type="text"
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary" size="sm">
              Submit
            </Button>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

const CommentThread = ({ comments, post, toggle }) => {
  const memberdata = getMemberdata();
  const [comment, setComment] = useState("");
  const postComment = () => {
    SendComment("post", comment, post, memberdata?._id);
    setComment("");
  };

  return (
    <div>
      {comments?.length > 0 && (
        <div className="comments--list p-3 rounded-4 mt-3 d-flex flex-column align-items-start gap-3 border-light">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              memberdata={memberdata}
              allowReply={true}
            />
          ))}
        </div>
      )}
      <div className="comment--box bg-light p-3 rounded-4 mt-3 d-flex flex-column align-items-end gap-3 border-light">
        <textarea
          className="form-control"
          placeholder="Write a comment..."
          rows={3}
          value={comment || ""}
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
        <div className="d-flex gap-3 align-items-center justify-content-end">
          <Button
            variant="secondary"
            className="mr-2"
            onClick={() => toggle(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={postComment}>Post</Button>
        </div>
      </div>
    </div>
  );
};

export default CommentThread;
