"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type UpdateRequest, type UserStruct } from "@/types/authInterfaces";
import { eighteenYearsAgo } from "@/types/authSchemas";
import { formatDate, parseCookie } from "@/utils/lib";
import { AuthService, StoryService } from "@/utils/requests";
import { cn } from "@/utils/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCookie, setCookie } from "cookies-next/client";
import { CalendarIcon, Edit2, Loader2, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";

import { type profileUpdateSchema } from "@/types/authSchemas";

export default function ProfileInfo() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [user, setUser] = useState<UserStruct | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof profileUpdateSchema>>({
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      birthdate: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const userData = parseCookie<UserStruct>("user");
    if (userData.success) setUser(userData.data);
  }, []);

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        birthdate: user.birthdate ? new Date(user.birthdate) : undefined,
        password: "",
        confirmPassword: "",
      });
    }
  }, [user, form]);

  const updateMutation = useMutation<UserStruct, Error, UpdateRequest>({
    mutationFn: (data) => AuthService.updateProfile(data),
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      queryClient.setQueryData(["userProfile"], data);
      deleteCookie("user");
      setCookie("user", JSON.stringify(data));
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const onUpdateSubmit = (data: z.infer<typeof profileUpdateSchema>) => {
    if (!user) return;

    const updatedData: UpdateRequest = {};

    if (data.username && data.username !== user.username) {
      updatedData.username = data.username;
    }
    if (data.email && data.email !== user.email) {
      updatedData.email = data.email;
    }
    if (data.first_name && data.first_name !== user.first_name) {
      updatedData.first_name = data.first_name;
    }
    if (data.last_name && data.last_name !== user.last_name) {
      updatedData.last_name = data.last_name;
    }
    if (
      data.birthdate &&
      (!user.birthdate ||
        new Date(user.birthdate).toISOString() !== data.birthdate.toISOString())
    ) {
      updatedData.birthdate = data.birthdate.toISOString();
    }
    if (data.password) {
      updatedData.password = data.password;
    }

    if (Object.keys(updatedData).length > 0) {
      updateMutation.mutate(updatedData);
    } else {
      toast.info("No changes to update");
      setIsEditing(false);
    }
  };

  const accountDeleteMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await StoryService.deleteAllStories();
      await AuthService.deleteAccount();
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      deleteCookie("user");
      deleteCookie("auth_token");
      queryClient.removeQueries({ queryKey: ["userProfile"] });
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  const onDeleteSubmit = () => {
    accountDeleteMutation.mutate();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing)
      form.reset({
        username: user?.username ?? "",
        email: user?.email ?? "",
        first_name: user?.first_name ?? "",
        last_name: user?.last_name ?? "",
        birthdate: user?.birthdate ? new Date(user.birthdate) : undefined,
        password: "",
        confirmPassword: "",
      });
  };

  const onDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="mx-auto max-w-7xl border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">Profile Information</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
              onClick={handleEditToggle}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit2 className="h-4 w-4" />
              )}
              {isEditing ? "Cancel" : "Edit"}
            </Button>

            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  onDeleteCancel();
                } else {
                  setIsDeleteDialogOpen(true);
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  className="gap-2 cursor-pointer"
                  disabled={accountDeleteMutation.isPending}
                >
                  {accountDeleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {accountDeleteMutation.isPending
                    ? "Deleting..."
                    : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                onClick={onDeleteCancel}
                onEscapeKeyDown={() => onDeleteCancel}
                className="border-border bg-background text-foreground max-w-[95vw] sm:max-w-md mx-2 sm:mx-0 p-4 sm:p-6"
              >
                <AlertDialogHeader className="space-y-4">
                  <AlertDialogTitle className="text-lg sm:text-xl">
                    Confirm Deletion
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm sm:text-base">
                    This will permanently delete your account and all associated
                    stories. All stories you have created will be permanently
                    removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
                  <AlertDialogCancel className="cursor-pointer border-border bg-muted text-muted-foreground hover:bg-muted/90 w-full sm:w-auto">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="cursor-pointer bg-destructive text-white hover:bg-destructive/70 w-full sm:w-auto"
                    onClick={() => onDeleteSubmit()}
                    disabled={accountDeleteMutation.isPending}
                  >
                    {accountDeleteMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirm Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onUpdateSubmit)}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {(["username", "email", "first_name", "last_name"] as const).map(
                (field) => (
                  <FormField
                    key={field}
                    name={field}
                    control={form.control}
                    render={({ field: inputField }) => (
                      <FormItem>
                        <FormLabel>
                          {field
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={!isEditing || updateMutation.isPending}
                            {...inputField}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ),
              )}
              <FormField
                name="birthdate"
                control={form.control}
                render={({ field }) => {
                  let dateValue: Date | undefined = undefined;
                  if (field.value) {
                    if (typeof field.value === "string") {
                      dateValue = new Date(field.value);
                    } else if (
                      field.value &&
                      typeof field.value === "object" &&
                      "getMonth" in field.value
                    ) {
                      dateValue = field.value;
                    }
                  }

                  return (
                    <FormItem>
                      <FormLabel>Birthdate</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !dateValue && "text-muted-foreground",
                              )}
                              disabled={!isEditing || updateMutation.isPending}
                            >
                              {dateValue ? (
                                formatDate(dateValue)
                              ) : (
                                <span>Optional: Pick a date (18+ only)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateValue}
                            onSelect={(newDate) => {
                              field.onChange(newDate);
                            }}
                            disabled={(date) =>
                              date > eighteenYearsAgo ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  );
                }}
              />
            </div>
            {isEditing && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          className="w-full"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
            <div className="text-sm mt-4">
              Joined: {formatDate(user?.date_joined)}
            </div>
            {isEditing && (
              <div className="space-y-4">
                <Button
                  type="submit"
                  className="gap-2 cursor-pointer"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
