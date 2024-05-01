"use client";

import React, { useRef } from "react";

// Import the axios library to make HTTP requests
import axios from "axios";

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
    .object({
      password: z
        .string({
          required_error: "A password is required.",
        })
        .min(4, {
          message: "A recommended password must be at least 4 characters.",
        }),
      match: z.string(),
    })
    .superRefine((schema, ctx) => {
      if (schema.password !== schema.match) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["match"],
          message: "The passwords must match.",
        });
      }
    }),
});

const SignUpForm: React.FC = () => {
  // Define a reference to a paragraph element to display the API response.
  const apiResponseRef = useRef<HTMLParagraphElement>(null);

  // Define a form using the `useForm` hook from `react-hook-form` and the `zodResolver` from `@hookform/resolvers/zod`.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: { password: "", match: "" },
    },
  });

  // Define a function to handle the form submission.
  function onSubmit(values: z.infer<typeof formSchema>) {
    const element = apiResponseRef.current;

    axios
      .post<{ message: string }>("http://localhost:8080/auth/signup", {
        username: values.username,
        password: values.password.password,
      })
      .then((response) => {
        if (element) {
          element.textContent = response.data.message;
          element.style.color = "rgb(74 222 128)";
        }
      })
      .catch((error) => {
        if (element) {
          element.textContent = error.response.data.message;
          element.style.color = "rgb(222 74 74)";
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
          name="password.password"
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
        <FormField
          control={form.control}
          name="password.match"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  placeholder="Confirm your password"
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

export default SignUpForm;
