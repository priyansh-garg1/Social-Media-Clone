import {
  Text,
  Box,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { URL } from "../constants";
import useShowToast from "../hooks/useShowToast";
import SuggestedUser from "./SuggestedUser";
import {useNavigate} from 'react-router-dom'
function SearchUser() {
  const [search, setSearch] = useState("");
  const [searchedUser, setSearchedUser] = useState();
  const [loading, setLoading] = useState(false);
  const [found,setFound] = useState(true);
  let userSearch; 
  const navigate = useNavigate();
  const showToast = useShowToast();
  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${URL}/api/users/profile/${search}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.error) {
        setSearchedUser();
        setFound(false);
        return;
      }
      setSearchedUser(data);
      console.log(search);
      userSearch = search;
      console.log(userSearch)
    } catch (error) {
      showToast("Error", error.message, "error");
    }
    finally{
      setLoading(false);
    }
  };
  return (
    <>
      <form onSubmit={handleSearch} style={{ flex: 95 }}>
        <InputGroup>
          <Input
            type="text"
            placeholder="Enter Username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputRightElement onClick={handleSearch} cursor={"pointer"}>
            <IoSendSharp isLoaing={loading} />
          </InputRightElement>
        </InputGroup>
      </form>
      {searchedUser && (
        <Box mt={10} onClick={() => navigate(`/${search}`)}>
          <SuggestedUser user={searchedUser} />
        </Box>
      )}
      {!searchedUser && !found && <Text mt={10}>User not found</Text>}
    </>
  );
}

export default SearchUser;
