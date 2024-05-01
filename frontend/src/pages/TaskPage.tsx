import React, { useEffect, useRef } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import "@/styles/task_page.css";
import AddTaskForm from "@/components/form/task-add-form";
import useAuth from "@/hooks/auth";
import { useNavigate } from "react-router-dom";
import { AuthProvider } from "@/context/auth";
import defaultApi from "@/services/api";

//mport { useParams } from 'react-router-dom';

/*
interface Params extends Record<string, string>{

}*/

const TaskPage: React.FC = () => {
	const [user, setUser] = React.useState("");


	useEffect(() => {
		defaultApi.get("/user/profile").then((response) => {
			setUser(response.data.data.username);
		}).catch((error) => {
			switch (error.response.status) {
				case 401:
					localStorage.removeItem("signed");
					break;
				default:
					console.error("Error fetching user profile");
			}
		});
	});

  return (
	<div id="task-page">
    <AuthProvider>
      <NavigationMenu className="m-2">
        <NavigationMenuList className="flex flex-1" >
		<NavigationMenuItem>
		<p className="mx-2 p-2 align-middle">Welcome, {user}</p>
			</NavigationMenuItem>
          <NavigationMenuItem >
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Add Task</Button>
              </DialogTrigger>
              <DialogContent className="add-task">
                <DialogHeader>
                  <DialogTitle>Create a Task</DialogTitle>
                </DialogHeader>
                <AddTaskForm />
              </DialogContent>
            </Dialog>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <hr />
    </AuthProvider>
    </div>
  );
};

export default TaskPage;
