import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export default NextAuth({
    providers: [
        CognitoProvider({
            clientId: "",
            clientSecret: "",
            issuer: "",
        }),
    ],
    pages: {
        signIn: "",
        newUser: "",
    },
    session: {
        strategy: "jwt",
    },
});
