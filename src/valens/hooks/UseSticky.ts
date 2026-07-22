import { useEffect, useState } from "react";

const UseSticky = () => {
  const [sticky, setSticky] = useState(false);

  const stickyHeader = () => {
    if (window.scrollY > 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", stickyHeader);
  }, []);

  return {
    sticky,
  };
};

export default UseSticky;
