import { TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

export default function TableFloating() {
  return (
    <TabsContent value="table">
      <Card className="bg-transparent">
        <CardHeader className="pb-2">
          <CardTitle className=" text-black text-center text-xl">
            Data Table
          </CardTitle>
          <CardDescription className="text-gray-600 text-center">
            View Data displayed on this Map from Google Spreadsheet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col-2 items-center justify-center gap-6 pb-4">
            <Image
              src="/google-sheets.png"
              alt="Google Sheets"
              width={100}
              height={100}
              className="w-20 h-auto md:w-20 md:h-auto"
            />
            <div className="flex flex-col gap-2">
              <p className="text-black text-sm font-semibold">
                On this spreadsheet, there are multiple entries such a:
              </p>
              <p className="text-black text-sm pb-2">
                Group, Icon (Custom Image and Size), Latitude, Longitude,
                <br></br>
                Name, Second Name, Description, Address, and Image.
              </p>
              <Button
                className="shadow-md hover:bg-gradient-to-br from-blue-400 to-blue-700 hover:text-white max-w-3xl w-max"
                onClick={() =>
                  window.open(
                    "https://docs.google.com/spreadsheets/d/1VNLNWbg5-ENYoQGQIjDT-W0OotmR_WmQy3S9WxMz7Ww/edit?usp=sharing",
                    "_blank"
                  )
                }
                variant="outline"
                size="sm"
              >
                View on Google Sheets ↗
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
