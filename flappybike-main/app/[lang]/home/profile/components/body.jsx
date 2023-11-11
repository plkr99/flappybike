"use client";
import { useCallback, useEffect, useState } from "react";
import SettingsLayout from "../../components/settings_layout";
import FileInput from "./file_input";
import ErrorAlert from "@/app/[lang]/auth/components/error_alert";
import { useForm } from "react-hook-form";
import supabase from "@/app/config/supabaseClient";
import LoadingButton from "@/app/[lang]/components/loading_button";

export default function BodyCard({ dict, lang }) {
  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [user, setUser] = useState();
  const [avatar_url, setAvatarUrl] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      let { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, profile_pic`)
        .eq("user_id", user?.id);

      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        console.log("email", user.email);
        console.log("full_name", data[0].full_name);
        setValue("email", user.email);
        setValue("fullName", data[0].full_name);
        setAvatarUrl(data[0].profile_pic);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);
  const onSubmit = async (values) => {
    setLoadingUpdate(true);
    if (values.profile_pic?.length > 0)
      uploadAvatar(values.profile_pic[0], values.fullName);
    else {
      updateProfile(avatar_url, values.fullName);
    }
    // setErrorMessage(error.message);
  };
  const uploadAvatar = async (profile_pic, fullName) => {
    try {
      const fileExt = profile_pic.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, profile_pic);

      if (uploadError) {
        throw uploadError;
      }

      updateProfile(filePath, fullName);
    } catch (error) {
      console.log(error);
      alert("Error uploading avatar!");
    }
  };
  async function updateProfile(avatar_url, fullname) {
    try {
      let { error } = await supabase
        .from("profiles")
        .update({
          profile_pic: avatar_url,
          full_name: fullname,
        })
        .eq("user_id", user?.id);
      if (error) throw error;
      alert("Profile update successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingUpdate(false);
    }
  }
  return (
    <SettingsLayout
      lang={lang}
      title={dict.page.home.menu.profile}
      loading={loading}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Personal Information
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {dict.page.signup.email.label}
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:border disabled:border-gray-300 disabled:text-gray-900 disabled:cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="full-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {dict.page.signup.fullName.label}
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="full-name"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    {...register("fullName", {
                      required: dict.page.signup.fullName.required,
                      minLength: {
                        value: 5,
                        message: dict.page.signup.fullName.minLength,
                      },
                    })}
                  />
                  {errors.fullName && (
                    <ErrorAlert text={errors.fullName.message} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <FileInput url={avatar_url} register={register} />
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          {loadingUpdate ? (
            <div className="w-fit">
              <LoadingButton />
            </div>
          ) : (
            <button
              type="submit"
              className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Save
            </button>
          )}
        </div>
      </form>
    </SettingsLayout>
  );
}
