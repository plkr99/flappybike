"use client";
import ErrorAlert from "@/app/[lang]/auth/components/error_alert";
import LoadingButton from "@/app/[lang]/components/loading_button";
import supabase from "@/app/config/supabaseClient";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { Fragment, useState } from "react";
import Barcode from "react-jsbarcode";

export default function ScanBarCodeModal({
  dict,
  setOpen,
  info,
  user,
  setUser,
}) {
  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleRedeem = async () => {
    if (user.credits < info.cost) {
      setErrorMessage("Not enough credits");
      return;
    }
    setLoading(true);
    var { error } = await supabase.from("redeemed_rewards").insert({
      user_id: user.user_id,
      reward_id: info.reward_id,
    });
    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      console.log(error);
      return;
    }
    const newCredits = user.credits - info.cost;
    var { error } = await supabase
      .from("profiles")
      .update({
        credits: newCredits,
      })
      .eq("user_id", user?.user_id);
    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      console.log(error);
      return;
    }
    setUser((currentUser) => ({
      ...currentUser,
      credits: newCredits,
    }));
    var { error } = await supabase
      .from("rewards")
      .update({
        available_count: info.available_count - 1,
      })
      .eq("reward_id", info?.reward_id);
    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      console.log(error);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-white p-6 rounded-3xl text-left align-middle shadow-xl transition-all">
                <>
                  <Dialog.Title
                    as="div"
                    className="flex items-start justify-between"
                  >
                    <h3 className="text-lg text-gray-900">
                      {dict.modal.title}
                    </h3>
                    <XMarkIcon
                      onClick={() => setOpen(false)}
                      className="h-6 w-6 cursor-pointer"
                    />
                  </Dialog.Title>
                  <div className="mt-2 flex justify-center flex-col items-center">
                    {success ? (
                      <>
                        <CheckCircleIcon className="w-12 h-12 text-green-500" />
                        <span className="text-sm text-green-500">
                          Success Redeem
                        </span>
                      </>
                    ) : (
                      <>
                        <Barcode value={"barCode123"} />
                        {info.available_count <= 10 && (
                          <span className="flex space-x-2 test-sm text-orange-600 bg-orange-100 w-full rounded-lg p-2 mt-3 self-start ">
                            <InformationCircleIcon className="w-7 h-7" />
                            <span>{info.available_count} items left</span>
                          </span>
                        )}
                        {errorMessage && (
                          <div className="w-full">
                            <ErrorAlert text={errorMessage} />
                          </div>
                        )}
                        {loading ? (
                          <LoadingButton />
                        ) : (
                          <button
                            onClick={handleRedeem}
                            type="submit"
                            className="flex w-full justify-center rounded-lg bg-green-200 py-3 px-6 text-lg font-semibold leading-6 text-green-600 shadow-sm outline-none outline-offset-0 mt-2 disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed"
                            disabled={info.available_count === 0}
                          >
                            {/* {dict.login.loginButton} */}
                            Redeem
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
