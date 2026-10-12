import { useOutletContext } from "react-router-dom";

// { group, me, isAdmin, openInvite }
export const useGroupContext = () => useOutletContext();
