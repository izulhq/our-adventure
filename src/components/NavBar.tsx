import React, { useState } from "react";
import Image from "next/image";
import { ChevronUp, Table2, X } from "lucide-react";
import Dropdown from "./Dropdown";
import TabsFloating from "./TabsFloating";
import { FaQuestion } from "react-icons/fa6";

export default function NavBar({
  view,
  setView,
}: {
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTabs, setShowTabs] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleTabs = () => {
    setShowTabs(!showTabs);
  };

  return (
    <>
      <div className="fixed z-[9999] w-auto min-w-[320px] h-20 md:h-16 -translate-x-1/2 backdrop-blur-lg bg-[#f5f5f5]/40 border-[1px] border-gray-400 rounded-[12px] bottom-4 left-1/2 shadow-xl">
        <div className="h-full px-6 flex flex-col items-center justify-between">
          <div className="flex flex-auto items-center justify-between w-full">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={40}
                className="w-30 h-auto md:w-20 md:h-auto"
              />
            </div>

            <div className="flex items-center gap-2 ml-6">
              {/* Table2/X button with slide animation */}
              <div className="relative">
                <button
                  onClick={toggleTabs}
                  className={`p-3 md:p-2 rounded-full shadow-md overflow-hidden ${
                    showTabs
                      ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:bg-gradient-to-l"
                      : "bg-gradient-to-r from-gray-500 to-gray-700 hover:bg-gradient-to-l"
                  } focus:outline-none`}
                >
                  {/* First icon that slides out */}
                  <span
                    className={`absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 ease-out transition-all ${
                      showTabs
                        ? "translate-y-full opacity-0"
                        : "translate-y-0 opacity-100 text-gray-200"
                    }`}
                  >
                    <FaQuestion className="w-6 h-6 md:w-5 md:h-5" />
                  </span>

                  {/* Second icon that slides in */}
                  <span
                    className={`absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 ease-out transition-all ${
                      showTabs
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0"
                    }`}
                  >
                    <X className="w-6 h-6 md:w-5 md:h-5 " />
                  </span>

                  {/* Invisible span for maintaining button dimensions */}
                  <span className="relative invisible">
                    <FaQuestion className="w-6 h-6 md:w-5 md:h-5" />
                  </span>
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    window.open(
                      "https://docs.google.com/spreadsheets/d/1ar8gpojbDlqihP_DcMB0ut-S-1BSwHzybnRynIu5tlg/edit?gid=0#gid=0",
                      "_blank"
                    )
                  }
                  className="p-3 md:p-2 rounded-full shadow-md bg-gradient-to-r from-gray-500 to-gray-700 hover:bg-gradient-to-l group"
                >
                  <Table2 className="w-6 h-6 md:w-5 md:h-5 text-white" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 border border-gray-400 shadow-md bg-white text-gray-800 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Input Data Here
                  </div>
                </button>
              </div>

              {/* ChevronUp button */}
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className={`p-3 md:p-2 rounded-full shadow-md ${
                    isDropdownOpen
                      ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:bg-gradient-to-l"
                      : "bg-gradient-to-r from-gray-500 to-gray-700 hover:bg-gradient-to-l"
                  } hover:bg-gradient-to-br focus:outline-none`}
                >
                  <ChevronUp
                    className={`w-6 h-6 md:w-5 md:h-5 ${
                      isDropdownOpen ? "text-white" : "text-gray-200"
                    } ${
                      isDropdownOpen ? "rotate-180" : ""
                    } transition-transform`}
                  />
                </button>
                <Dropdown isVisible={isDropdownOpen} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showTabs && (
        <div className="fixed inset-0 flex items-center justify-center z-[9998]">
          <div className="max-w-4xl w-full px-14 transform -translate-y-6">
            <TabsFloating
              isVisible={true}
              view={view}
              setView={setView}
              toggleTabs={toggleTabs}
            />
          </div>
        </div>
      )}
    </>
  );
}
