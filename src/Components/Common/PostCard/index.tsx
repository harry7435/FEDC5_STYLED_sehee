/* eslint-disable no-underscore-dangle */
import { useTheme } from 'styled-components';
import Icon from '@/Components/Base/Icon';
import Button from '@/Components/Base/Button';
import DEFAULT_USER_IMAGE_SRC from '@/Constants/defaultUserImage';
import { useState } from 'react';
import {
  StyledPostCardWrapper,
  StyledPostCardHeader,
  StyledPostCardBody,
  StyledProfileAvatar,
  StyledProfileName,
  StyledProfileContainer,
  HeartIconStyle,
  StyledPostCardTitle,
  StyledPostCardImage,
} from './style';
import { PostCardProps } from './type';

const PostCard = ({
  postId,
  authUser,
  imageUrl,
  content,
  authorName,
  authorThumbnail,
  authorId,
  isFollower,
  isLike,
  width = '80%',
  fontSize,
  objectFit = 'contain',
  onImageClick,
  onUserNameClick,
  onUserAvatarClick,
  onFollowBtnClick,
  onLikeIconClick,
}: PostCardProps) => {
  const [likeState, setLikeState] = useState(isLike);
  const [followState, setFollowState] = useState(isFollower);
  const { colors } = useTheme();

  const followBtnBgColor = followState ? colors.read : colors.follow;
  const followBtnHoverBgColor = followState
    ? 'rgba(0, 149, 246, 0.7)'
    : 'rgba(119, 82, 254, 0.7)';
  const followBtnTextColor = colors.buttonText;

  /**
   * 상위 컴포넌트로 바뀔 follow 상태와 userId를 넘기는 함수
   * @param id userId
   */
  const handleFollowClick = (id: string) => {
    setFollowState(!isFollower);
    if (onFollowBtnClick) {
      onFollowBtnClick(!isFollower, id, () => setFollowState(isFollower));
    }
  };

  /**
   * 상위 컴포넌트로 바뀔 like 상태와 postId를 넘기는 함수
   * @param id postId
   */
  const handleClickLike = (targetPostId: string, targetAuthorId: string) => {
    setLikeState(!likeState);
    if (onLikeIconClick) {
      console.log(likeState);
      onLikeIconClick(targetPostId, targetAuthorId, !likeState, () =>
        setLikeState(likeState),
      );
    }
  };

  return (
    <StyledPostCardWrapper
      width={width}
      fontSize={fontSize}
    >
      <StyledPostCardHeader>
        <StyledProfileContainer>
          {/* 아바타 컴포넌트 삽입 필요 */}
          <StyledProfileAvatar
            src={authorThumbnail || DEFAULT_USER_IMAGE_SRC}
            alt="프로필 아바타"
            onClick={onUserAvatarClick}
          />
          <StyledProfileName onClick={onUserNameClick}>
            {authorName}
          </StyledProfileName>
          {authUser?._id !== authorId ? (
            <Button
              className="follow-btn"
              width="5rem"
              height="2rem"
              borderRadius="0.5rem"
              textSize="1rem"
              textColor={followBtnTextColor}
              backgroundColor={followBtnBgColor}
              hoverBackgroundColor={followBtnHoverBgColor}
              hoverTextColor={followBtnTextColor}
              onClick={() => handleFollowClick(authorId)}
            >
              {followState ? '팔로잉' : '팔로우'}
            </Button>
          ) : null}
        </StyledProfileContainer>
        <Icon
          name={likeState ? 'favorite' : 'favorite_border'}
          style={{ color: `${colors.alert}`, ...HeartIconStyle }}
          onClick={() => handleClickLike(postId, authorId)}
        />
      </StyledPostCardHeader>
      <StyledPostCardTitle>{content}</StyledPostCardTitle>
      <StyledPostCardBody onClick={onImageClick}>
        <StyledPostCardImage
          src={imageUrl}
          alt="포스트 카드 이미지"
          $objectFit={objectFit}
        />
      </StyledPostCardBody>
    </StyledPostCardWrapper>
  );
};

export default PostCard;
