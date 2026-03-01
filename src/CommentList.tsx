import { groupBy, last, map } from "lodash-es";
import { LoadingSpinner } from "./common/components/LoadingSpinner";
import CommentItem from "./common/components/comments/CommentItem";
import CommentSenderGroup from "./common/components/comments/CommentSenderGroup";
import ViewContentLayout from "./common/components/ViewContentLayout";
import { useComments } from "./common/hooks/useComments";
import { Comment } from "./domain/comment";
import CommentListContainer from "./common/components/comments/CommentListContainer";
import CommentDateGroup from "./common/components/comments/CommentDateGroup";
import { Tooltip } from "react-tooltip";
import { deleteComment } from "./actions/deleteComment";
import useCurrentUser from "./common/hooks/useCurrentUser";
import { convertToLocaleDateString } from "./common/dateUtils";

interface CommentGroup {
  heading: string;
  senderGroups: {
    userId: string;
    userPhotoURL?: string | null;
    userDisplayName?: string;
    comments: Comment[];
  }[];
}

function groupComments(comments: Comment[]): CommentGroup[] {
  const commentsByDate = groupBy(comments, (comment) =>
    convertToLocaleDateString(comment.createdOn),
  );
  return map(commentsByDate, (dateComments, heading): CommentGroup => {
    const senderGroups: CommentGroup["senderGroups"] = [];
    dateComments.forEach((comment) => {
      const { userId, userPhotoURL, userDisplayName } = comment;
      let senderGroup = last(senderGroups);
      if (!senderGroup || senderGroup.userId !== userId) {
        // Start a new message group
        senderGroup = {
          userId,
          userPhotoURL,
          userDisplayName,
          comments: [],
        };
        senderGroups.push(senderGroup);
      }
      senderGroup.comments.push(comment);
    });
    return { heading, senderGroups };
  });
}

export const CommentList = (props: { playId?: string }) => {
  const [user] = useCurrentUser();
  const { playId } = props;
  const [comments, loading, error] = useComments(playId);

  if (error) {
    return (
      <ViewContentLayout>
        Permission denied. Ask permissions from panu.vuorinen@gmail.com.
      </ViewContentLayout>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (comments.length === 0) {
    return (
      <div className="w-full text-center">
        No comments yet. Be the first one to comment! 😎
      </div>
    );
  }

  const groups = groupComments(comments);

  const onCommentDelete = (commentId: string) => {
    if (confirm(`Are you sure you want to permanently delete your comment?`)) {
      deleteComment(commentId);
    }
  };

  return (
    <CommentListContainer className="mx-2">
      <Tooltip />
      {groups.map((group, groupIdx) => (
        <CommentDateGroup key={groupIdx} heading={group.heading}>
          {group.senderGroups.map(
            ({ userDisplayName, userPhotoURL, comments }, idx) => (
              <CommentSenderGroup
                key={idx}
                userDisplayName={userDisplayName}
                userPhotoURL={userPhotoURL}
              >
                {comments.map((comment, messageIdx) => (
                  <CommentItem
                    date={comment.createdOn}
                    key={messageIdx}
                    onDelete={
                      comment.userId === user?.uid
                        ? () => onCommentDelete(comment.id)
                        : null
                    }
                  >
                    {comment.comment}
                  </CommentItem>
                ))}
              </CommentSenderGroup>
            ),
          )}
        </CommentDateGroup>
      ))}
    </CommentListContainer>
  );
};
