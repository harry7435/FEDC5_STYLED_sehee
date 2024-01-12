import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '../../Alert';
import AsideHeader from './AsideHeader';
import ImageUpload from '../../ImageUpload';
import Modal from '..';
import Spinner from '@/Components/Base/Spinner';
import TitleEditor from './TitleEditor';

import { createPost, getPostDetail, updatePost } from '@/Services/Post';
import { getChannel } from '@/Services/Channel';

import {
  StyledAside,
  StyledMainHeader,
  StyledMain,
  StyledWrapper,
} from './style';

import { ImageFileType } from '../../ImageUpload/type';
import {
  PostCreatePostRequestType,
  PutUpdatePostRequestType,
} from '@/Types/Request';
import { Props } from './type';
import validatePostFieldProps from './validatePostField';
import QUERY_KEYS from '@/Constants/queryKeys';

// * 하위 컴포넌트로부터 갱신된 데이터를 통합적으로 관리

// DONE: 컴포넌트 설계
// DONE: Props 설정, 타입 지정
// DONE: 대략적인 스타일링
// DONE: 컴포넌트 구현
// DONE: 해당 컴포넌트로 데이터를 모아 쿼리 통신 구현
// DONE: 기타 에러 핸들링
// DONE: 게시글 수정 모달로 확장 (post 있는 상태면 해당 값으로 초기화, 아니면 빈 값으로)

const AddOrEditPostModal = ({ onChangeOpen }: Props) => {
  const navigate = useNavigate();
  const isAuthUser = !!sessionStorage.getItem('AUTH_TOKEN');
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [image, setImage] = useState<ImageFileType | string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { postId } = useParams();

  /**
   * 컴포넌트의 역할이 '게시글 수정'일 때의 로직 ▼
   * @brief param을 통해 가져온 postId가 존재할 경우, 각 폼에 초기값을 할당합니다.
   */
  const { data: editingPost } = useQuery({
    queryKey: postId
      ? [QUERY_KEYS.EDITING_POST_ID, postId]
      : [QUERY_KEYS.EDITING_POST_ID, 'no-id'],
    queryFn: () => (postId ? getPostDetail(postId) : null),
    enabled: !!postId,
  });

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setCategory(editingPost.channel.name);
      if (editingPost.image) {
        setImage(editingPost.image);
      }
      console.log(editingPost);
    }
  }, [editingPost]);

  /**
   * @brief 카테고리명을 채널ID로 변환하는 mutateChannel과, 포스트 수정/작성을 요청하는 mutateUpdatePost/mutatePost함수가 연쇄적으로 호출됩니다.
   * @exception title, category, image를 작성하지 않았을 경우, 에러 Alert와 함께 요청이 거부됩니다.
   * @exception 포스트 수정의 경우, 이미지 변경 사항이 없으면 null을 반환하며 기존 값들은 그대로 param에 담아 요청합니다.
   */
  const { mutate: mutatePost, status: postStatus } = useMutation({
    mutationFn: (postFormData: PostCreatePostRequestType) =>
      createPost(postFormData),
    onSuccess: (res) => res && navigate('/'),
  });

  const { mutate: mutateUpdatePost, status: updatePostStatus } = useMutation({
    mutationFn: (postFormData: PutUpdatePostRequestType) =>
      updatePost(postFormData),
    onSuccess: (res) => res && navigate('/'),
    // TODO: 게시물 목록 fetch해야할 듯
  });

  const { mutate: mutateChannel, status: channelStatus } = useMutation({
    mutationFn: (channelName: string) => getChannel(channelName),
    onSuccess: (res) => {
      // editingPost가 존재할 경우, updatePost인데
      // editing.image랑 image가 같은 경우 image에 null을 담아, 다른 경우 기존처럼 업로드한 파일 바로 담아
      if (res && image && editingPost) {
        mutateUpdatePost({
          postId: editingPost._id,
          title,
          image:
            editingPost.image !== image && typeof image !== 'string'
              ? image.file
              : null,
          channelId: res._id,
        });
      }

      // 새로운 포스트 작성일 경우
      if (res && image && typeof image !== 'string') {
        mutatePost({ title, image: image.file, channelId: res._id });
      }
    },
  });

  const handleSubmit = () => {
    const error = validatePostFieldProps({ title, category, image });

    if (error) {
      setErrorMessage(error);
      return;
    }

    mutateChannel(category);
  };

  return isAuthUser ? (
    <>
      {(postStatus === 'pending' ||
        channelStatus === 'pending' ||
        updatePostStatus === 'pending') && (
        <Spinner
          isBackground
          isFixedCenter
        />
      )}
      <Modal onChangeOpen={onChangeOpen}>
        <StyledWrapper>
          <StyledMain>
            <StyledMainHeader>
              {editingPost ? '게시물 수정하기' : '새로운 게시물'}
            </StyledMainHeader>
            <ImageUpload
              width="100%"
              height="80%"
              onUpload={setImage}
              initialValue={editingPost?.image}
            />
          </StyledMain>
          <StyledAside>
            <AsideHeader
              onSubmit={handleSubmit}
              onSelectChannel={setCategory}
              initialValue={editingPost?.channel.name}
            />
            <TitleEditor
              onEditing={setTitle}
              initialValue={editingPost?.title}
            />
          </StyledAside>
        </StyledWrapper>

        {errorMessage && (
          <Alert
            message={errorMessage}
            onChangeOpen={() => setErrorMessage(null)}
          />
        )}
      </Modal>
    </>
  ) : (
    <Alert
      message="로그인 후 이용해주세요"
      onChangeOpen={onChangeOpen}
    />
  );
};

export default AddOrEditPostModal;

// 1. 특정 포스트 요청하면 이미지가 URL(string)으로 날아옴
// 2. URL을 저장하고, ImageUpload 컴포넌트로 InitialValue로 전달하고 있음
// 3. 그래서 initialValue가 존재하는 경우 ImageUpload 컴포넌트의 imageFile 상태값을 initialValue로 초기화하고 싶음 (useEffect)
// 3-1. 그럼 imageFile의 타입에 string도 추가되어야 함
// 3-2. 클릭하면 새로운 이미지 업로드 가능해야 함
// 3-3. submit할 때, initialValue와 imageFile이 같다면 사진을 변경하지 않았다는 뜻이므로, null을 담아 보내면 됨
// 4. 그럼 imageFile State에 string 추가해야 함
// 5. 따라서 게시글 수정 시 이미지 변경안됐으면 null, 변경됐으면 기존처럼 이미지 파일 보내주면 됨. 클라우드에서 알아서 string으로 변환