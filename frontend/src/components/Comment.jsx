import { Avatar, Divider, Flex, Text } from '@chakra-ui/react';
import React, { useState } from 'react'


function Comment({reply,lastReply}) {
  return (
    <>
    <Flex gap={4} py={2} my={2} w={"full"}>
        <Avatar src={reply?.userProfilePic} size={"sm"} />
        <Flex gap={1} w={"full"} flexDirection={"column"} >
            <Flex alignItems={"center"} justifyContent={"space-between"} w={"full"}>
                <Text fontSize={"sm"} fontWeight={"bold"}>{reply?.username}</Text>
            </Flex>
            <Text>{reply?.text}</Text>
        </Flex>
    </Flex>
    {!lastReply ? 
    <Divider />:null}
    </>
  )
}

export default Comment
