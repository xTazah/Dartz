"use client";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./userProvider/userProvider";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "./loadingSpinner/loadingSpinner";

export const withAuth = (WrappedComponent: React.FC<any>) => {
  return function WithAuth(props: any) {
    const router = useRouter();
    const userContext = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!userContext?.user) {
        router.replace("/login"); // redirect to login if no user
      }
      setLoading(false); // session check complete
    }, [userContext?.user, router]);

    if (loading || !userContext?.user) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};
