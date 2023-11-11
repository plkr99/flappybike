/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import supabase from "@/app/config/supabaseClient";
const FileInput = ({ register, url }) => {
  const { onChange, ref, ...params } = register("profile_pic");
  const profilePicRefs = useRef(null);
  const [selectedFile, setSelectedFile] = useState();
  const [loadingPic, setLoadingPic] = useState(false);

  const handleClick = () => {
    profilePicRefs.current?.click();
  };
  const handleChange = (e) => {
    const urls = URL.createObjectURL(e.currentTarget.files[0]);
    setSelectedFile(urls);
    onChange(e);
  };

  useEffect(() => {
    async function downloadImage(path) {
      setLoadingPic(true);
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        setSelectedFile(url);
      } catch (error) {
        console.log(error);
        console.log("Error downloading image: ", error);
      } finally {
        setLoadingPic(false);
      }
    }
    if (url) downloadImage(url);
  }, [url]);
  return (
    <div className="border-b border-gray-900/10 pb-12">
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label
            htmlFor="photo"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Photo
          </label>
          <div className="mt-2 flex items-center gap-x-3">
            {loadingPic ? (
              <div className="border flex justify-center items-center h-12 w-12 rounded-full border-gray-200">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin fill-black"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            ) : !selectedFile ? (
              <UserCircleIcon
                className="h-12 w-12 text-gray-300"
                aria-hidden="true"
              />
            ) : (
              <img
                src={selectedFile}
                alt=""
                className="h-12 w-12 object-cover rounded-full object-center border-2 border-green-400"
              />
            )}

            <button
              onClick={handleClick}
              type="button"
              className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <span>Change</span>
              <input
                type="file"
                ref={(e) => {
                  ref(e);
                  profilePicRefs.current = e; // you can still assign to ref
                }}
                className="hidden"
                {...params}
                accept="image/*"
                onChange={handleChange}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileInput;
