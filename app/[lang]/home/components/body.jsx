"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import marker from "@/assets/images/marker.png";
import { classNames } from "@/helpers/constants";
import SidebarWidget from "./sidebar";
import SlideWithMouse from "./SlideWithMouse";
import Loading from "@/app/[lang]/components/loading";
import InfoModal from "./modals/info";
import supabase from "@/app/config/supabaseClient";
import { UserCircleIcon } from "@heroicons/react/24/outline";
const MyAwesomeMap = dynamic(() => import("./map/map"), {
  loading: () => <Loading text={"Wait a Second Map is Loading..."} />,
  ssr: false,
});

export default function BodyCard({ lang, dict }) {
  const [user, setUser] = useState();
  const [position, setPosition] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState({ open: false });
  const [startEndPoints, setStartEndPoints] = useState([]);
  const [profileImage, setImage] = useState();
  const [updateLocation, setUpdateLocation] = useState(Date.now());

  const getCoordinate = (position) => [position.lng, position.lat];
  function secondsToMinutes(seconds) {
    return parseInt(seconds / 60000, 10);
  }

  function metersTokilometers(meters) {
    return (meters / 1000).toFixed(1);
  }

  useEffect(() => {
    setUpdateLocation(Date.now());
  }, [enabled]);
  useEffect(() => {
    const insertData = async (type, coordinates) => {
      const { error } = await supabase.from("rides").insert({
        user_id: user?.user_id,
        x: coordinates[1],
        y: coordinates[0],
        type: type,
      });
      if (error) console.log(error);
    };
    if (position !== null) {
      if (enabled) {
        const coordinates = getCoordinate(position);
        insertData("start", coordinates);
        setStartEndPoints(coordinates);
        return;
      }
      if (startEndPoints.length) {
        setInfo((info) => ({ ...info, loading: true, open: true }));
        const coordinates = getCoordinate(position);
        insertData("end", coordinates);
        fetch("https://graphhopper.com/api/1/route?key=d980a185-2dcc-4f41-ad11-9a06e1b8f0b6", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            points: [startEndPoints, coordinates],
            snap_preventions: ["motorway", "ferry", "tunnel"],
            details: ["road_class", "surface"],
            profile: "bike",
            locale: "en",
            instructions: true,
            calc_points: true,
            points_encoded: false,
          }),
        })
          .then(async (res) => {
            let data = await res.text();
            data = JSON.parse(data);
            const newCredits =
              user?.credits + parseInt(data.paths[0].distance, 10);
            const { error } = await supabase
              .from("profiles")
              .update({
                credits: newCredits,
              })
              .eq("user_id", user?.user_id);
            if (error) console.log(error);
            setInfo((info) => ({
              ...info,
              time: secondsToMinutes(data.paths[0].time),
              distance: metersTokilometers(data.paths[0].distance),
              credit: parseInt(data.paths[0].distance, 10),
              loading: false,
              polyline: data.paths[0].points.coordinates.map((subArray) => [
                subArray[1],
                subArray[0],
              ]),
            }));
            setUser((currentUser) => ({
              ...currentUser,
              credits: newCredits,
            }));
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            setStartEndPoints([]);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id,full_name, credits,profile_pic")
        .eq("user_id", user.id);
      if (data) setUser(data[0]);
      else console.log(error);
    };
    getUserInfo();
  }, []);
  useEffect(() => {
    async function downloadImage(path) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        setImage(url);
      } catch (error) {
        console.log(error);
        console.log("Error downloading image: ", error);
      }
    }
    if (user?.profile_pic) downloadImage(user?.profile_pic);
  }, [user?.profile_pic]);
  return (
    <>
      <SidebarWidget
        lang={lang}
        dict={dict.page.home.menu}
        user={user}
        profileImage={profileImage}
        open={open}
        setOpen={setOpen}
      />
      <div className="relative z-10 w-full h-full flex flex-col">
        <button
          type="button"
          className="absolute h-20 w-20 top-7 left-7 rounded-full flex justify-center items-center overflow-hidden bg-red-300 border-2 border-green-600 z-[500]"
          onClick={() => setOpen(true)}
        >
          <span className="absolute -inset-0.5" />
          <span className="sr-only">Open menu</span>
          {profileImage ? (
            <Image
              width={300}
              height={300}
              src={profileImage}
              alt="profile"
              className="w-20 h-20 object-cover object-bottom"
            />
          ) : (
            <UserCircleIcon className="w-20 h-20 text-white" />
          )}
        </button>
        <div className="flex-1 overflow-hidden">
          <MyAwesomeMap
            info={info}
            enabled={enabled}
            position={position}
            setPosition={setPosition}
            updateLocation={updateLocation}
          />
          <div
            className={classNames(
              enabled ? "flex" : "hidden",
              "items-center justify-center flex-col space-y-24 h-full"
            )}
          >
            <span className="font-bold text-5xl max-w-xs text-center">
              {dict.page.home.driveCarefully}
            </span>
            <Image
              src={marker}
              alt="marker"
              className="w-36 h-36 object-cover object-bottom"
            />
          </div>
        </div>
        <div className="flex justify-center items-center py-5">
          <SlideWithMouse
            dict={dict.page.home.button}
            enabled={enabled}
            setEnabled={setEnabled}
          />
        </div>
      </div>
      {info.open && (
        <InfoModal dict={dict.page.home.modal} info={info} setInfo={setInfo} />
      )}
    </>
  );
}
