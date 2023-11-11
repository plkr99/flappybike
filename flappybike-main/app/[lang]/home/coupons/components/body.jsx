"use client";
import { useEffect, useState } from "react";
import SettingsLayout from "../../components/settings_layout";
import ButtonInfo from "./button_info";
import supabase from "@/app/config/supabaseClient";
import Loading from "@/app/[lang]/components/loading";

const options = [
  {
    id: 1,
    title: "10 % Restaurant",
    credit: "1000",
    barcode: "barcode123",
  },
  {
    id: 2,
    title: "20 % Laden",
    credit: "2000",
    barcode: "barcode123",
  },
  {
    id: 3,
    title: "10 % Laden",
    credit: "1000",
    barcode: "barcode123",
  },
  {
    id: 4,
    title: "10 % auf nächtsten Einkauf",
    credit: "1000",
    barcode: "barcode123",
  },
  {
    id: 5,
    title: "10 % auf nächtsten Einkauf",
    credit: "1000",
    barcode: "barcode123",
  },
  {
    id: 6,
    title: "Gratis Popcorn Kinobesuch",
    credit: "2000",
    barcode: "barcode123",
  },
];
export default function BodyCard({ lang, dict }) {
  const [loading, setLoading] = useState(true);
  const [focusedElement, setFocusedElement] = useState();
  const [user, setUser] = useState();
  const [options, setOptions] = useState();
  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      var { data, error } = await supabase
        .from("profiles")
        .select("user_id,credits")
        .eq("user_id", user.id);
      if (data) setUser(data[0]);
      else console.log(error);
      var { data, error } = await supabase
        .from("rewards")
        .select("reward_id,name,cost, available_count");
      if (data) setOptions(data);
      else console.log(error);
      setLoading(false);
    };
    getUserInfo();
  }, []);
  return (
    <SettingsLayout
      lang={lang}
      title={dict.page.coupons.title}
      loading={loading}
    >
      <div className="grid grid-cols-2 mx-auto w-full max-w-xl gap-5">
        {options?.map((info) => (
          <ButtonInfo
            dict={dict.page.coupons}
            key={info.reward_id}
            info={info}
            user={user}
            setUser={setUser}
            focusedElement={focusedElement}
            setFocusedElement={setFocusedElement}
          />
        ))}
      </div>
    </SettingsLayout>
  );
}
