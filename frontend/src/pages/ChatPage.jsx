import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Conversation from "../components/Conversation";
import useShowToast from "../hooks/useShowToast";
import MessageCotainer from "../components/MessageCotainer";
import { URL } from "../constants";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationsAtom,
} from "../atoms/messagesAtom";
import { GiConversation } from "react-icons/gi";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

function ChatPage() {
  const showToast = useShowToast();
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationsAtom
  );
  const currentUser = useRecoilValue(userAtom);
  const [searchText, setSearchText] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const {socket,onlineUsers} = useSocket();

  useEffect(()=> {
    socket?.on("messageSeen",({conversationId}) => {
        setConversations(prev => {
          const updatedConversations = prev.map(conversation => {
            if (conversation._id === conversationId) {
              return {
               ...conversation,
                lastMessage: {
                 ...conversation.lastMessage,
                  seen: true,
                },
              };
            }
            return conversation;
          })
          return updatedConversations;
        });
      
    })
  },[socket,setConversations])

  useEffect(() => {
    const getConversation = async () => {
      setLoadingConversation(true);
      try {
        const res = await fetch(`${URL}/api/messages/conversations`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setConversations(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversation(false);
      }
    };
    getConversation();
  }, [showToast, setConversations]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    if(searchText.length===0)return;
    setSearchingUser(true);
    try {
      const res = await fetch(`${URL}/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      if (searchedUser.error) {
        showToast("Error", searchedUser.error, "error");
        return;
      }
      const messageYourself = searchedUser._id === currentUser._id;
      if(messageYourself){
        showToast("Errro","You cannot message yourself","error")
        return;
      }
      const conversationAlreadyExists = conversations.find(conversation => conversation.participants[0]._id === searchedUser._id);
      if(conversationAlreadyExists){
        setSelectedConversation({
          _id:conversations.find(conversation => conversation.participants[0]._id === searchedUser._id)._id,
          userId:searchedUser._id,
          username:searchedUser.username,
          userProfilePic:searchedUser.userProfilePic,
        })
        setSearchText('');
        return;
      }
      const mockConversation = {
        mock:true,
        lastMessage:{
          text:"",
          sender:""
        },
        _id:Date.now(),
        participants:[
          {
            _id:searchedUser._id,
            username:searchedUser.username,
            profilePic:searchedUser.userProfilePic,
          }
        ]
      }
      setConversations((prevCons) => [
       ...prevCons,
        mockConversation,
      ]); 
      setSearchText('')
    } catch (error) {
      showToast("Error", error.message, "error");
    }finally{
      setSearchingUser(false);
    }
  };

  return (
    <Box
      position={"absolute"}
      left={"50%"}
      w={{
        base: "100vw",
        md: "80vw",
        lg: "60vw",
      }}
      p={4}
      transform={"translateX(-50%)"}
    >
      <Flex
        gap={4}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        maxW={{
          sm: "400px",
          md: "full",
        }}
        mx={"auto"}
      >
        <Flex
          flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{
            base: "250px",
            md: "100%",
          }}
        >
          <Text
            fontWeight={700}
            color={useColorModeValue("gray.600", "gray.400")}
          >
            Your Conversations
          </Text>
          <form onSubmit={handleConversationSearch}>
            <Flex gap={2} alignItems={"center"}>
              <Input
                placeholder="search for a user"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                size={"sm"}
                onClick={handleConversationSearch}
                isLoading={searchingUser}
              >
                <SearchIcon />
              </Button>
            </Flex>
          </form>
          {loadingConversation &&
            [1].map((_, i) => {
              return (
                <Flex
                  key={i}
                  gap={2}
                  alignItems={"center"}
                  p={1}
                  borderRadius={"md"}
                >
                  <Box>
                    <SkeletonCircle size={10} />
                  </Box>
                  <Flex w={"full"} flexDirection={"column"} gap={3}>
                    <Skeleton h={"10px"} w={"80px"} />
                    <Skeleton h={"8px"} w={"90%"} />
                  </Flex>
                </Flex>
              );
            })}
          {!loadingConversation && conversations &&
            conversations?.map((conversation) => (
              <Conversation setConversations={setConversations}
                key={conversation._id}
                isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                conversation={conversation}
              />
            ))}
        </Flex>
        {!selectedConversation._id && (
          <Flex
            flex={70}
            borderRadius={"md"}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"400px"}
          >
            <GiConversation size={100} />
            <Text fontSize={20}>Select a conversation to start message</Text>
          </Flex>
        )}

        {selectedConversation._id && <MessageCotainer setConversationsAfterDelete={setConversations} />}
      </Flex>
    </Box>
  );
}

export default ChatPage;
