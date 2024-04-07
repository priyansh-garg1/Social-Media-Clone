import React, { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast.js";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import { URL } from "../constants.js";
import Post from "../components/Post.jsx";
import useGetUserProfie from "../hooks/useGetUserProfie.js";
import { useRecoilState } from "recoil";
import postAtom from "../atoms/postAtom.js";

function UserPage() {
  const {user,loading} = useGetUserProfie();
  const { username } = useParams();
  const showToast = useShowToast();
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [posts, setPosts] = useRecoilState(postAtom);
  useEffect(() => {
    
    const getPosts = async () => {
      setFetchingPosts(true);
      try {
        const res = await fetch(`${URL}/api/posts/user/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };
    getPosts();
  }, [username, showToast,setPosts]);

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }
  if (!user && !loading) return <h1>User not found</h1>;
  return (
    <>
      <UserHeader user={user} />
      {!fetchingPosts && posts.length === 0 && <Text>User has no post.</Text>}
      {fetchingPosts && (
        <Flex justifyContent={"center"} my={12}>
          <Spinner size={"xl"}></Spinner>
        </Flex>
      )}
      {posts.map((post) => (
        <Post key={post?._id} post={post} postedBy={post?.postedBy}  />
      ))}
    </>
  );
}

export default UserPage;
