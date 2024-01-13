/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-underscore-dangle */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Outlet, useNavigate } from 'react-router-dom';
import { StyledContainer, StyledDiv } from './style';
import MessageList from '@/Components/DirectMessage/MessageList';
import ConversationList from '@/Components/DirectMessage/ConversationList';
import { useFetchConversations } from '@/Hooks/Api/Message';
import { UserType } from '@/Types/UserType';
import useAuthUserStore from '@/Stores/AuthUser';
import { checkAuth } from '@/Services/Auth';

const DirectMessagePage = () => {
  const { conversations, isConversationsLoading, conversationsRefetch } =
    useFetchConversations();
  const [receiver, setReceiver] = useState<UserType | null>(null);
  const navigator = useNavigate();
  const [isMobileSize, setIsMobileSize] = useState(window.innerWidth < 768);
  const [isClickedUserCard, setIsClickedUserCard] = useState(false);

  const { setAuthUser, user } = useAuthUserStore();

  const { data: userData, isSuccess } = useQuery({
    queryKey: ['currentUser'],
    queryFn: checkAuth,
  });

  useEffect(() => {
    if (!isSuccess) return;
    if (isSuccess && !userData) {
      navigator('/');
      return;
    }
    if (isSuccess && userData) {
      setAuthUser(userData);
    }
  }, [isSuccess, userData, setAuthUser, navigator]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileSize(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <StyledContainer>
      {isMobileSize &&
        (!isClickedUserCard ? (
          <ConversationList
            isMobileSize={isMobileSize}
            setIsClickedUserCard={setIsClickedUserCard}
            setReceiver={setReceiver}
            conversations={conversations}
            isConversationsLoading={isConversationsLoading}
            conversationsRefetch={conversationsRefetch}
            loginUser={user}
          />
        ) : (
          receiver && (
            <MessageList
              isMobileSize={isMobileSize}
              isClickedUserCard={isClickedUserCard}
              setIsClickedUserCard={setIsClickedUserCard}
              receiver={receiver}
              conversationsRefetch={conversationsRefetch}
              loginUser={user}
            />
          )
        ))}
      {!isMobileSize && (
        <>
          <ConversationList
            setReceiver={setReceiver}
            conversations={conversations}
            isConversationsLoading={isConversationsLoading}
            conversationsRefetch={conversationsRefetch}
            loginUser={user}
          />
          {!receiver ? (
            <StyledDiv>친구에게 메시지를 보내보세요!</StyledDiv>
          ) : (
            <MessageList
              receiver={receiver}
              conversationsRefetch={conversationsRefetch}
              loginUser={user}
            />
          )}
        </>
      )}
      <Outlet />
    </StyledContainer>
  );
};

export default DirectMessagePage;
