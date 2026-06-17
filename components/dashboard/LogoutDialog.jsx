import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { getClientAuth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

const LogoutDialog = ({ children }) => {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getClientAuth();
    if (auth) await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/sign-in");
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-[90%] sm:max-w-[500px] p-6 flex flex-col gap-6 bg-white rounded-[24px] overflow-hidden border-none outline-none shadow-2xl h-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-[20px] font-bold text-[#111827]">
              Logout
            </DialogTitle>
            <p className="text-[16px] text-[#6B7280]">
              Are you sure you want to logout?
            </p>
          </div>
          <DialogClose className="outline-none">
            <X className="w-6 h-6 cursor-pointer text-[#6B7280] hover:text-[#111827] transition-colors" />
          </DialogClose>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full">
          <DialogClose asChild className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-[120px] h-[52px] rounded-full border-[#8F00FF] text-[#8F00FF] hover:bg-[#F3E8FF] hover:text-[#8F00FF] text-[16px] font-bold"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-full sm:flex-1 h-[52px] rounded-full bg-[#8F00FF] hover:bg-[#7a00d9] text-white text-[16px] font-bold"
            onClick={handleLogout}
          >
            Yes Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
