import React, { useEffect } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
      } from "@/components/ui/card"

import SignUpForm from "@/components/form/sign-up-form";
import SignInForm from "@/components/form/sign-in-form";

import "@/styles/auth_page.css";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/auth";

const AuthPage: React.FC = () => {
	const context = useAuth();
	const navigator = useNavigate();

	useEffect(() => {
		if(context.signed){
			navigator("/task");
		}
	}, [context.signed, navigator]);
  return (
	<div id="auth-page">
    <Tabs defaultValue="sign-in">
      <TabsList className="auth-tabs">
        <TabsTrigger value="sign-in">Sign-In</TabsTrigger>
        <TabsTrigger value="sign-up">Sign-Up</TabsTrigger>
      </TabsList>
      <TabsContent value="sign-in">
        <Card className="auth-card">
		<CardHeader>
			<CardTitle>Sign-In</CardTitle>
			<CardDescription>Sign in to your account</CardDescription>
		</CardHeader>
		<CardContent>
			<SignInForm/>
		</CardContent>
	</Card>
      </TabsContent>
      <TabsContent value="sign-up">
        <Card className="auth-card">
		<CardHeader>
			<CardTitle>Sign-Up</CardTitle>
			<CardDescription>Create a new account</CardDescription>
		</CardHeader>
		<CardContent>
			<SignUpForm />
		</CardContent>
	</Card>
      </TabsContent>
    </Tabs>
    </div>
  );
};

export default AuthPage;
