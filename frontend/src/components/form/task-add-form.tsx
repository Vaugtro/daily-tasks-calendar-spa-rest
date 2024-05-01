"use client";

import React, { useEffect, useRef, useReducer } from "react";

// Import the axios library to make HTTP requests
import defaultApi from "@/services/api";

// Import needed styles
import "@/styles/task_add_form.css";

// Import the components from the shadcn/ui module.
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Import the form utilities from the react-hook-form and zod libraries.
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Import the date-fns library to format and compare dates.
import { isAfter, isEqual, differenceInSeconds } from "date-fns";
import useAuth from "@/hooks/auth";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";

// Define action types
enum ActionType {
  AddTag,
  RemoveTag,
}

// Define action interfaces
interface AddTagAction {
  type: ActionType.AddTag;
  payload: string;
}

interface RemoveTagAction {
  type: ActionType.RemoveTag;
  payload: number;
}

// Define reducer function
const reducer = (state: string[], action: AddTagAction | RemoveTagAction): string[] => {
  switch (action.type) {
    case ActionType.AddTag:
      if (action.payload && !state.includes(action.payload) && state.length < 5){
        return [...state, action.payload];
      }
      return [...state]; 
    case ActionType.RemoveTag:
      state.splice(action.payload, 1);
      return [...state];
    default:
      return state;
  }
};

const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "The title must not be empty",
    })
    .max(256, {
      message: "The title must not exceed 256 characters",
    }),
  description: z
    .string()
    .max(512, {
      message: "The description must not exceed 512 characters",
    })
    .optional(),
  interval: z
    .object({
      start: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/i, {
        message: "Must be a valid date in the format YYYY-MM-DDTHH:MM",
      }),
      end: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/i, {
        message: "Must be a valid date in the format YYYY-MM-DDTHH:MM",
      }),
    })
    .superRefine((schema, ctx) => {
      if (
        isAfter(schema.start, schema.end) &&
        !isEqual(schema.start, schema.end)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end"],
          message: "The end date must be after the start date.",
        });
      }
    }),
  tag: z.string().optional(),
});

const AddTaskForm: React.FC = () => {

  const utilTags = useRef<string[]>([]);

  const requestedTags: string[] = [];

  // Initialize state and dispatch function using useReducer
  // @ts-expect-error: the tags variable is not being used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tags, dispatch] = useReducer(reducer, utilTags.current);


  const context = useAuth();
  const navigator = useNavigate();

  // Function to add a new tag
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addTag = (tag: string) => {
    dispatch({ type: ActionType.AddTag, payload: tag });
  };

  // Function to remove a tag
  const removeTag = (index: number) => {
    dispatch({ type: ActionType.RemoveTag, payload: index });
  };

  useEffect(() => {
    if (!context.signed) {
      navigator("/");
    }
  }, [context.signed, navigator]);

  // Define a form using the `useForm` hook from `react-hook-form` and the `zodResolver` from `@hookform/resolvers/zod`.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      interval: { start: "", end: "" },
      tag: "",
    },
  });

  // Define a function to handle the form submission.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    const start: Date = new Date(values.interval.start);
    const end: Date = new Date(values.interval.end);

    const duration: number = differenceInSeconds(end, start);

    defaultApi
      .post<{
        title: string;
        description: string;
        date_start: string;
        duration: number;
      }>("/task", {
        title: values.title,
        description: values.description,
        date_start: start.toISOString(),
        duration: duration,
        tags: utilTags.current,
      })
      .then((response: unknown) => {
        console.log(response);
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title..." maxLength={256} {...field} />
              </FormControl>
              <FormDescription>Inform your task name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description..."
                  maxLength={512}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Inform your task description (Optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interval.start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Date/Time</FormLabel>
              <FormControl>
                <input
                  className="input-datetime"
                  type="datetime-local"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Inform the initial date/time of your task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interval.end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ending Date/Time</FormLabel>
              <FormControl>
                <input
                  className="input-datetime"
                  type="datetime-local"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Inform the ending date/time of your task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div>
                <div className="flex flex-1">
                  <Input list="tags" {...field} />
                  <Button className="ml-2" type="button"
                    onClick={() => {
                      if (field.value && !utilTags.current.includes(field.value) && utilTags.current.length < 5) {
                        utilTags.current.push(field.value);
                      }
                    }}>Add</Button>
                  <datalist id="tags">
                    {requestedTags.map((tag, index) => (
                      <option key={index} value={tag} />
                    ))}
                  </datalist>
                </div>
                <div className="my-1">
                  {utilTags.current.map((tag, index) => (
                    <a key={index} className="cursor-pointer m-0.5" onClick={() => removeTag(index)}><Badge>{tag}</Badge></a>
                  ))}
                </div>
                </div>
              </FormControl>
              <FormDescription>
                Add tags to your task, at max of 5 (Click on a setted tag to remove it).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default AddTaskForm;

