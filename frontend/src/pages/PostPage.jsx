import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import Actions from "../components/Actions";
import Comment from "../components/Comment";
import useGetUserProfie from "../hooks/useGetUserProfie";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../constants";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import postAtom from "../atoms/postAtom";

function PostPage({}) {
  const { user, loading } = useGetUserProfie();
  const currentUser = useRecoilValue(userAtom);
  const [posts,setPosts] = useRecoilState(postAtom);
  const showToast = useShowToast();
  const { pid } = useParams();
  const navigate = useNavigate();
  const currentPost = posts[0];

  useEffect(() => {
    const getPost = async () => {
      setPosts([]);
      try {
        const res = await fetch(`${URL}/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          return showToast("Error", data.error, "error");
        }
        setPosts([data]);
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };
    getPost();
  }, [showToast,pid,setPosts]);

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const res = await fetch(`${URL}/api/posts/${post._id}`, {
        credentials: "include",
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!currentPost) return null;

  return (
    <>
      <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
          <Avatar src={user?.profilePic} size={"md"} name="Mark Zuckerberg" />
          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user?.username}
            </Text>
          </Flex>
          <Image src="/verified.png" w={4} h={4} mt={1} ml={"-10px"} />
        </Flex>
        <Flex gap={4} alignItems={"center"}>
          <Text
            fontSize={"xs"}
            width={36}
            textAlign={"right"}
            color={"gray.500"}
          >
            {formatDistanceToNow(new Date(currentPost?.createdAt))} ago
          </Text>
          {currentUser?._id === user._id && (
            <DeleteIcon
              cursor={"pointer"}
              size={20}
              onClick={handleDeletePost}
            />
          )}
        </Flex>
      </Flex>
      <Text my={3}>{currentPost?.text}</Text>
      {currentPost?.img && (
        <Box
          borderRadius={6}
          overflow={"hidden"}
          border={"1px solid"}
          borderColor={"gray.light"}
        >
          <Image w={"full"} src={currentPost?.img} />
        </Box>
      )}
      <Flex gap={3} my={3}>
        <Actions post={currentPost} />
      </Flex>

      <Divider my={4} />
      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>👏</Text>
          <Text color={"gray.light"}>Get the app to like, reply and post</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>
      <Divider my={4} />
      {currentPost?.replies.map((reply) => (
        <Comment key={reply._id} reply={reply} lastReply={reply._id === currentPost.replies[currentPost.replies.length-1]._id}/>
      ))}
    </>
  );
}

export default PostPage;
