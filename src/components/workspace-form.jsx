import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { useSelector } from "react-redux";
import { navigate } from "wouter/use-browser-location";
import { useSaveWorkspace } from "../hooks/useSaveWorkspace"; 

const schema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required"),
  visibility: z.enum(["private", "public"]),
});

export default function WorkspaceForm({onWorkspaceCreated}) {
  const user = useSelector((state) => state.me.me);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      workspaceName: "",
      visibility: "private",
    },
  });

  const saveWorkspace = useSaveWorkspace(); 

  const onSubmit = (data) => {
    const newWorkspace = {
      workspaceName: data.workspaceName,
      visibility: data.visibility,
      owner: user?.email,
      subscribers: [],
    };

    saveWorkspace.mutate(
      { email: user.email, workspace: newWorkspace },
      {
        onSuccess: () => {
          if (onWorkspaceCreated) onWorkspaceCreated();
          navigate("/admin");
        },
        onError: (err) => console.error("Save failed", err),
      }
    );

    

  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Add Workspace</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="workspaceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Analytics Team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="pt-4">
              <Button
                type="submit"
                disabled={saveWorkspace.isLoading}
                className="bg-[#2196F3] hover:bg-[#1976D2] text-white flex items-center gap-2 rounded-lg"
              >
                {saveWorkspace.isLoading ? "Saving..." : "Add Workspace"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
