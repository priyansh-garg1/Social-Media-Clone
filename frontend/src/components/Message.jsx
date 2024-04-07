import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { selectedConversationsAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";

function Message({ ownMessage, message }) {
  const selectedConversation = useRecoilValue(selectedConversationsAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoader, setImgLoader] = useState(false);
  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"}>
          {message.text && (
            <Text maxW={"350px"} bg={"green.500"} p={1} borderRadius={"md"}>
              <Text color={"white"}>{message.text}</Text>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.900" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Text>
          )}
          {message.img && !imgLoader && (
            <Flex mt={5} w={"200px"}>
              <Image
                hidden
                onLoad={() => setImgLoader(true)}
                src={message.img}
                alt={"Message Image"}
                borderRadius={4}
              />
              <Skeleton w="200px" h="200px" />
            </Flex>
          )}
          {message.img && imgLoader && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt={"Message Image"} borderRadius={4} />
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.900" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          <Avatar src={user.profilePic} w={7} h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePic} w={7} h={7} />
          {message.text && (
            <Text
              maxW={"350px"}
              bg={"gray.400"}
              p={1}
              borderRadius={"md"}
              color={"black"}
            >
              {message.text}
            </Text>
          )}
          {message.img && !imgLoader && (
            <Flex mt={5} w={"200px"}>
              <Image
                hidden
                onLoad={() => setImgLoader(true)}
                src={message.img}
                alt={"Message Image"}
                borderRadius={4}
              />
              <Skeleton w="200px" h="200px" />
            </Flex>
          )}
          {message.img && imgLoader && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt={"Message Image"} borderRadius={4} />
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
}

export default Message;
