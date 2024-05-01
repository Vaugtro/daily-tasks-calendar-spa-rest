import {AuthContext, AuthContextProvider} from "@/context/auth";

import { useContext } from "react";

function useAuth() {
	const context = useContext<AuthContextProvider>(AuthContext);
	if (!context) {
		throw new Error("useAuth can't be used outside a ProvideAuth.");
	}
	return context;
}

export default useAuth;
