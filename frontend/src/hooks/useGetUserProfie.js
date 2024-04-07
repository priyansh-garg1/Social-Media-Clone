import { useParams } from "react-router-dom";
import useShowToast from "./useShowToast";
import { useEffect, useState } from "react";
import { URL } from "../constants";

function useGetUserProfie() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { username } = useParams();
  const showToast = useShowToast();
  useEffect(() => {
    const getUser = async () => {
        try {
          const res = await fetch(`${URL}/api/users/profile/${username}`);
          const data = await res.json();
          if (data.error) {
            showToast("Error", data.error, "error");
            return;
          }
          setUser(data);
        } catch (error) {
          showToast("Error", error.message, "error");
          setUser(null);
        }
        finally{
            setLoading(false);
        }
      };
      getUser();
  }, [username, showToast]);
  return { user, loading };
}

export default useGetUserProfie;
