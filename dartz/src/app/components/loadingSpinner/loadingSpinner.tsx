import { Spinner } from "@nextui-org/react";
import React from "react";

export const LoadingSpinner = ({
  label = "Loading...",
}: {
  label?: string;
}) => {
  return (
    <>
      <Spinner color="success" label={label} />
    </>
  );
};
