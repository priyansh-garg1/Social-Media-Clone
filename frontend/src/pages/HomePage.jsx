import { Box, Button, Flex, Text, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { URL } from "../constants";
import useShowToast from "../hooks/useShowToast.js";
import Post from "../components/Post.jsx";
import { useRecoilState } from "recoil";
import postAtom from "../atoms/postAtom.js";
import SuggestedUsers from "../components/SuggestedUsers.jsx";

function HomePage() {
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postAtom);
  const [feed, setFeed] = useState(true);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getFeed = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${URL}/api/posts/feed`, {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts(data);
      } catch (error) {
        console.log(error.message);
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    const getFollow = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${URL}/api/posts/follow`, {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts(data);
      } catch (error) {
        console.log(error.message);
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    if(feed)getFeed();
    else getFollow();
  }, [showToast, setPosts,feed]);
  return (
    <>
      <Flex gap={"10"} alignItems={"self-start"}>
        <Box flex={70}>
          <Flex w={"full"}>
            <Flex
              flex={1}
              borderBottom={!feed ? "1px solid gray" : "1.5px solid white"}
              onClick={() => setFeed(true)}
              justifyContent={"center"}
              pb={"3"}
              color={!feed && "gray.light"}
              cursor={"pointer"}
              
            >
              <Text fontWeight={"bold"}>Feed</Text>
            </Flex>
            <Flex
              flex={1}
              borderBottom={!feed ? "1.5px solid white" : "1px solid gray"}
              justifyContent={"center"}
              onClick={() => setFeed(false)}
              pb={"3"}
              cursor={"pointer"}
              color={feed && "gray.light"}
            >
              <Text fontWeight={"bold"}>Following</Text>
            </Flex>
          </Flex>
          {!loading && posts.length === 0 && (
            <Text mt={3} >Follow some users to see the following feed</Text>
          )}
          {loading && (
            <Flex justify={"center"}>
              <Spinner size={"xl"}></Spinner>
            </Flex>
          )}
          {posts &&
            posts?.map((post) => (
              <Post key={post._id} post={post} postedBy={post.postedBy} />
            ))}
        </Box>
        <Box
          flex={30}
          display={{
            base: "none",
            sm: "block",
          }}
        >
          <SuggestedUsers />
        </Box>
      </Flex>
    </>
  );
}

export default HomePage;
