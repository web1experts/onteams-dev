// CommentThread.js
import React, {useState} from 'react';
import { Card, Button, Form, ButtonGroup } from 'react-bootstrap';
import { BsTrash } from 'react-icons/bs'
import { getMemberdata } from '../../helpers/commonfunctions';
import { socket, SendComment, DeleteComment, UpdateComment } from '../../helpers/auth';
const Comment = ({ comment, memberdata, parentId, allowReply }) => {
  const [selectedComment, setSelectedComment] = useState({})
   const handleDelete = (comment_id, post) => {
    DeleteComment(comment_id, post, 'post')
   }
   const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReplySubmit = (e) => {
      e.preventDefault();
      if (!replyText.trim()) return;

      // Here, you'd send the replyText to your backend or state handler
      SendComment('post', replyText,comment?.post , memberdata?._id, selectedComment?._id)

      // Clear and close reply input
      setReplyText('');
      setShowReply(false);
    };
  return (              
    <Card className="mb-2">
        <Card.Body>
            <Card.Title>{comment.author?.name}</Card.Title>
            <Card.Text>{comment.text}</Card.Text>
            <BsTrash
              className="position-absolute top-0 end-0 m-2 text-danger cursor-pointer"
              role="button"
              onClick={() => handleDelete(comment._id, comment?.post)}
            />
            {allowReply === true && 
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => {setShowReply(!showReply);setSelectedComment(comment);}}
              >
                {showReply ? 'Cancel' : 'Reply'}
              </Button>
            }

            {showReply && (
              <Form onSubmit={handleReplySubmit} className="mt-2">
                <Form.Group controlId={`reply-${comment.id}`}>
                  <Form.Control
                    type="text"
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" size="sm" className="mt-1">
                  Submit
                </Button>
              </Form>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 ps-4 border-start border-2">
                {comment.replies.map((reply) => (
                  <Comment key={reply.id} comment={reply} parentId={comment._id} allowReply={false} />
                ))}
              </div>
            )}
        </Card.Body>
    </Card>
  );
};

const CommentThread = ({ comments, post, toggle }) => {
const memberdata = getMemberdata()
const [comment, setComment] = useState('')
 const postComment = () => {
    SendComment('post',comment, post, memberdata?._id);
    setComment('');
  }

  return (
    <div>
        {comments?.length > 0 &&
            <div className="bg-light p-3 rounded-4 mt-3 d-flex flex-column align-items-start gap-3 border-light">
            {comments.map(comment => (
                <Comment key={comment._id} comment={comment} memberdata={memberdata} allowReply={true} />
            ))}
            </div>
        }
      <div className="bg-light p-3 rounded-4 mt-3 d-flex flex-column align-items-end gap-3 border-light">
        <textarea
            className="form-control"
            placeholder="Write a comment..."
            rows={3}
            value={comment || ''}
            onChange={(e) => {
            setComment( e.target.value)
            }}
        />
        <ButtonGroup>
            <Button variant="primary" className='mr-2' onClick={() => toggle(false)}>Cancel</Button>
            <Button variant="primary" onClick={postComment}>Post</Button>
        </ButtonGroup>
        </div>
    </div>
  );
};

export default CommentThread;
