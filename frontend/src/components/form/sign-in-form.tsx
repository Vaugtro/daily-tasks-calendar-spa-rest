"use client";

import React, { useEffect, useRef} from "react";

// Import the components from the shadcn/ui module.
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

// Import the form utilities from the react-hook-form and zod libraries.
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useAuth from "@/hooks/auth";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  username: z
    .string({
      required_error: "A username is required.",
    })
    .min(3, {
      message: "The username must be at least 3 characters.",
    })
    .max(32, {
      message: "The username must not exceed 32 characters.",
    }),
    password: z
    .string({
      required_error: "A password is required.",
    }),
});

const SignInForm: React.FC = () => {

  // Use the `useAuth` hook to access the authentication context.
  const context = useAuth();

  // Define a navigate function to navigate to the home page updated after the a successful login.
  const navigate = useNavigate();

  // Define a reference to a paragraph element to display the API response.
  const apiResponseRef = useRef<HTMLParagraphElement>(null);

  // Define a form using the `useForm` hook from `react-hook-form` and the `zodResolver` from `@hookform/resolvers/zod`.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if(context.signed){
      navigate("/task");
    }
  }, [context.signed, navigate]);

  // Define a function to handle the form submission.
  function onSubmit(values: z.infer<typeof formSchema>) {
    const element = apiResponseRef.current;


    // Make a POST request to the `/auth/login` endpoint with the username and password values.
    const message:Promise<string> = context.authLogin(values.username, values.password);

    message.then((message) => {
      if (message){
        if (element) {
          element.textContent = message;
          element.style.color = "rgb(222 74 74)";
        }
      } else {
        navigate("../task");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your username" />
              </FormControl>
              <FormMessage {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  placeholder="Enter your password"
                />
              </FormControl>
              <FormMessage {...field} />
            </FormItem>
          )}
        />
        <p ref={apiResponseRef}></p>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default SignInForm;
