import { TabsContent } from "@radix-ui/react-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function HomeFloating() {
  return (
    <TabsContent value="home">
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="text-black text-center text-xl">
            Welcome to our Application
          </CardTitle>
          <CardDescription className="text-gray-600 text-center">
            This is a simple single-page application with two sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-black text-sm">
              Use the tabs above to navigate between different sections:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-black text-sm pb-4">
              <li>
                <strong className="font-semibold">Home :</strong> This welcome
                page
              </li>
              <li>
                <strong className="font-semibold">Data Table :</strong> See all
                entries in table format
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
