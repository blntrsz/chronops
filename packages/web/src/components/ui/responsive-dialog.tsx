import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";

const ResponsiveDialogContext = React.createContext<{ isMobile: boolean }>({ isMobile: false });

function useResponsiveDialog() {
  return React.useContext(ResponsiveDialogContext);
}

function ResponsiveDialog({ children, ...props }: React.ComponentProps<typeof Dialog>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveDialogContext value={{ isMobile: true }}>
        <Drawer {...props}>{children}</Drawer>
      </ResponsiveDialogContext>
    );
  }

  return (
    <ResponsiveDialogContext value={{ isMobile: false }}>
      <Dialog {...props}>{children}</Dialog>
    </ResponsiveDialogContext>
  );
}

function ResponsiveDialogTrigger({ ...props }: React.ComponentProps<typeof DialogTrigger>) {
  const { isMobile } = useResponsiveDialog();

  if (isMobile) {
    return <DrawerTrigger {...props} />;
  }

  return <DialogTrigger {...props} />;
}

function ResponsiveDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const { isMobile } = useResponsiveDialog();

  if (isMobile) {
    return (
      <DrawerContent className={className}>
        <div className="overflow-y-auto">{children}</div>
      </DrawerContent>
    );
  }

  return (
    <DialogContent className={cn("gap-0 p-0", className)} {...props}>
      {children}
    </DialogContent>
  );
}

function ResponsiveDialogBody({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialog();

  return (
    <div className={cn(isMobile ? "px-4 pt-4 pb-4" : "px-6 pt-6 pb-5", className)} {...props} />
  );
}

function ResponsiveDialogFooter({ className, children, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialog();

  if (isMobile) {
    return (
      <DrawerFooter className={cn("pt-2", className)} {...props}>
        {children}
      </DrawerFooter>
    );
  }

  return (
    <>
      <hr className="w-full" />
      <div
        className={cn("flex flex-row items-center justify-end gap-3 px-6 py-4", className)}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

function ResponsiveDialogClose({ ...props }: React.ComponentProps<typeof DialogClose>) {
  const { isMobile } = useResponsiveDialog();

  if (isMobile) {
    return <DrawerClose {...props} />;
  }

  return <DialogClose {...props} />;
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogClose,
};
