import { Box, Flex, Skeleton, SkeletonCircle, Text} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import SuggestedUser from "./SuggestedUser";
import useShowToast from '../hooks/useShowToast.js'
import {URL} from '../constants.js'

function SuggestedUsers() {
  const [loading,setLoading] = useState(false);
  const [suggestedUsers,setSuggestedUsers] = useState([])
  const showToast = useShowToast();


  useEffect(() => {
    const getSuggestedUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${URL}/api/users/suggested`,{
          credentials: "include",
        });
        const data = await res.json();
        if(data.error){
          showToast("Error", data.error, "error");
          return;
        }
        setLoading(false);
        setSuggestedUsers(data);
      } catch (error) {
        showToast("Error",error.message,"error");
      }
      finally{
        setLoading(false);
      }
    };
    getSuggestedUsers();
  },[showToast])
  return (
    <>
      <Text mb={4} fontWeight={"bold"}>
        Suggested Users
      </Text>
      <Flex direction={"column"} gap={4}>
        {!loading &&
          suggestedUsers.map((user) => (
            <SuggestedUser key={user._id} user={user} />
          ))}
        {loading &&
          suggestedUsers.map((_, idx) => (
            <Flex
              key={idx}
              gap={2}
              alignItems={"center"}
              p={"1"}
              borderRadius={"md"}
            >
              <Box>
                <SkeletonCircle size={"10"} />
              </Box>
              <Flex w={"full"} flexDirection={"column"} gap={2}>
                <Skeleton h={"8px"} w={"80px"} />
                <Skeleton h={"8px"} w={"90px"} />
              </Flex>
              <Flex>
                <Skeleton h={"20px"} w={"60px"} />
              </Flex>
            </Flex>
          ))}
      </Flex>
    </>
  );
}

export default SuggestedUsers;
