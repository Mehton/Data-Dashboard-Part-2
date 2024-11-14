import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <>
      <h1 style={{ color: "white", padding: "1rem" }}>Marvel Comics</h1>
      <h1>There's nothing in here!</h1>
      <Link style={{ color: "black", padding: "1rem" }} to="/">
        Back to Home
      </Link>
    </>
  );
};
export default NotFound;
