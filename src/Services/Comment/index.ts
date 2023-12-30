import axiosInstance from '@/Api/axiosInstance';
import { DOMAIN } from '@/Constants/Api';
import { CommentType } from '@/Types/CommentType';
import { PostCommentRequestType } from '@/Types/Request';

/**
 * @brief 특정 포스트에 댓글을 작성합니다.
 * @details {} 중괄호 내부에 반드시 comment, postId 설정해야 합니다.
 * @return 실패할 경우, null을 반환합니다.
 */
export const createComment = async ({
  comment,
  postId,
}: PostCommentRequestType) => {
  try {
    const res = await axiosInstance.post<CommentType>(DOMAIN.CREATE_COMMENT, {
      params: {
        comment,
        postId,
      },
    });

    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * @brief 특정 포스트에 작성한 내 댓글을 삭제합니다.
 * @return 실패할 경우, null을 반환합니다.
 */
export const deleteComment = async (commentId: string) => {
  try {
    const res = await axiosInstance.delete<CommentType>(DOMAIN.DELETE_COMMENT, {
      params: {
        id: commentId,
      },
    });

    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};
