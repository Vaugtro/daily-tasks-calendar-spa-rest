import React, { createContext } from "react";

import defaultApi from "@/services/api";

interface Props {
  children: React.ReactNode;
}

interface AuthContextProvider {
  signed: boolean;
  authLogin(username: string, password: string): Promise<string>;
  authLogout(): void;
}

const AuthContext = createContext<AuthContextProvider>({} as AuthContextProvider);

/**
 * AuthProvider component provides authentication functionality to its children components.
 */
const AuthProvider: React.FC<Props> = ({ children }: Props) => {
  const [signed, setSigned] = React.useState(Boolean(false));

  React.useEffect(() => {
    if (localStorage.getItem("signed") === "true") {
      setSigned(true);
    }
  }, []);

  /**
   * Authenticates the user with the provided username and password.
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns A Promise that resolves to a string representing the authentication response.
   */
  async function authLogin(
    username: string,
    password: string
  ): Promise<string> {
    const response = await defaultApi
      .post<{ message: string }>("/auth/login", {
        username: username,
        password: password,
      })
      .then(() => {
        return null;
      })
      .catch((error) => {
        return error.response.data.message;
      });

    return response;
  }

  /**
   * Logs out the authenticated user.
   */
  function authLogout() {
    defaultApi.defaults.headers.Authorization = "";
  }

  return (
    <AuthContext.Provider
      value={{
        signed: Boolean(signed),
        authLogin,
        authLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
export type { AuthContextProvider };
