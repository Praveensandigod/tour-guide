
import { Outlet } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
