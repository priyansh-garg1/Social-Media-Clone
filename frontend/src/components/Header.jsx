import { Button, Flex, Image, Text, useColorMode } from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link, useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import {
  BsFillChatQuoteFill,
  BsSearch,
  BsSearchHeart,
  BsSearchHeartFill,
} from "react-icons/bs";
import { CgSearch } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";

function Header() {
  const logout = useLogout();
  const { colorMode, toggleColorMode } = useColorMode();
  const [authscreen, setAuthScreen] = useRecoilState(authScreenAtom);
  const user = useRecoilValue(userAtom);
  return (
    <Flex justifyContent="space-between" mt={6} mb="12">
      {user && (
        <Link to={"/"}>
          <AiFillHome size={24} />
        </Link>
      )}
      {!user && <Link onClick={() => setAuthScreen("login")}>Log in</Link>}
      <Image
        cursor="pointer"
        alt="logo"
        w={6}
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        onClick={toggleColorMode}
      />
      {user && (
        <Flex alignItems={"center"} gap={4}>
          <Link to={"/search"}>
            <IoSearch size={20} />
          </Link>
          <Link to={"/chat"}>
            <BsFillChatQuoteFill size={20} />
          </Link>
          <Link to={`${user.username}`}>
            <RxAvatar size={24} />
          </Link>

          <Button ml={-3} size={"sm"} onClick={logout}>
            <FiLogOut size={20} />
          </Button>
        </Flex>
      )}
      {!user && <Link onClick={() => setAuthScreen("singup")}>Signup</Link>}
    </Flex>
  );
}

export default Header;
