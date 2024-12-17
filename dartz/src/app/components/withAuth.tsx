"use client";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./userProvider/userProvider";
import { useRouter } from "next/navigation";

import { Spinner } from "@nextui-org/react";

export const withAuth = (WrappedComponent: React.FC<any>) => {
  return function WithAuth(props: any) {
    const router = useRouter();
    const userContext = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!userContext?.user) {
        router.replace("/login"); // Redirect to login if no user
      }
      setLoading(false); // Session check complete
    }, [userContext?.user, router]);

    if (loading || !userContext?.user) {
      return <Spinner color="warning" label="Loading..." />;
    }

    return <WrappedComponent {...props} />;
  };
};
