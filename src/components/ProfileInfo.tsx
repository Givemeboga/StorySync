'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { env } from '@/env';
import { getAccessToken } from '@/lib';
import { type UserStruct } from '@/types/authInterfaces';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCookie, getCookie, setCookie } from 'cookies-next/client';
import { Edit2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const updateUserProfile = async (
  updatedData: Partial<UserStruct>,
): Promise<UserStruct | null> => {
  const NEXT_PUBLIC_AUTH_API_URL = env.NEXT_PUBLIC_AUTH_API_URL;
  const authToken = getAccessToken();
  if (!authToken) {
    return null;
  }

  try {
    const response = await fetch(`${NEXT_PUBLIC_AUTH_API_URL}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      console.error('Failed to update profile');
      return null;
    }

    const responseData = (await response.json()) as {
      message: string;
      user: UserStruct;
    };
    return responseData.user;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

export default function ProfileInfo() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const router = useRouter();

  const [user, setUser] = useState<UserStruct | null>(null);

  useEffect(() => {
    const userData = getCookie('user');
    if (userData) {
      setUser(JSON.parse(userData) as UserStruct);
    }
  }, []);

  const form = useForm<Partial<UserStruct>>({
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      if (data) {
        form.setValue('username', data.username);
        form.setValue('email', data.email);
        form.setValue('first_name', data.first_name);
        form.setValue('last_name', data.last_name);

        queryClient.setQueryData(['userProfile'], data);
        deleteCookie('user');
        setCookie('user', JSON.stringify(data));
        setIsEditing(false);
      }
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });

  const onSubmit = (formData: Partial<UserStruct>) => {
    mutation.mutate(formData);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Could not load profile. Please re-login and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="cursor-pointer"
            onClick={() => router.push('/login')}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Profile Information</CardTitle>
            <CardDescription>
              View and manage your personal information
            </CardDescription>
          </div>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mt-2">Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isEditing}
                      placeholder="Username"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mt-2">Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isEditing}
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="first_name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mt-2">First Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isEditing}
                      placeholder="First Name"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="last_name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mt-2">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isEditing}
                      placeholder="Last Name"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="mt-4 text-sm text-gray-500">
              Joined:{' '}
              {user?.date_joined
                ? new Date(user.date_joined).toLocaleDateString('en-GB')
                : 'N/A'}
            </div>

            {isEditing && (
              <>
                {mutation.isError && (
                  <div className="mt-2 text-sm text-red-500">
                    {mutation.error instanceof Error
                      ? mutation.error.message
                      : 'An unexpected error occurred. Please try again.'}
                  </div>
                )}
                <Button
                  type="submit"
                  className="cursor-pointer w-full md:w-auto"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
