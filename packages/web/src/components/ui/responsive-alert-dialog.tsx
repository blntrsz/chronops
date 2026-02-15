import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const ResponsiveAlertDialogContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
});

function useResponsiveAlertDialog() {
  return React.useContext(ResponsiveAlertDialogContext);
}

function ResponsiveAlertDialog({ children, ...props }: React.ComponentProps<typeof AlertDialog>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveAlertDialogContext value={{ isMobile: true }}>
        <Drawer {...props}>{children}</Drawer>
      </ResponsiveAlertDialogContext>
    );
  }

  return (
    <ResponsiveAlertDialogContext value={{ isMobile: false }}>
      <AlertDialog {...props}>{children}</AlertDialog>
    </ResponsiveAlertDialogContext>
  );
}

function ResponsiveAlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogContent>) {
  const { isMobile } = useResponsiveAlertDialog();

  if (isMobile) {
    return <DrawerContent className={className}>{children}</DrawerContent>;
  }

  return (
    <AlertDialogContent className={className} {...props}>
      {children}
    </AlertDialogContent>
  );
}

function ResponsiveAlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveAlertDialog();

  if (isMobile) {
    return <DrawerHeader className={cn("text-left", className)} {...props} />;
  }

  return <AlertDialogHeader className={className} {...props} />;
}

function ResponsiveAlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogTitle>) {
  const { isMobile } = useResponsiveAlertDialog();

  if (isMobile) {
    return <DrawerTitle className={className} {...props} />;
  }

  return <AlertDialogTitle className={className} {...props} />;
}

function ResponsiveAlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogDescription>) {
  const { isMobile } = useResponsiveAlertDialog();

  if (isMobile) {
    return <DrawerDescription className={className} {...props} />;
  }

  return <AlertDialogDescription className={className} {...props} />;
}

function ResponsiveAlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveAlertDialog();

  if (isMobile) {
    return <DrawerFooter className={className} {...props} />;
  }

  return <AlertDialogFooter className={className} {...props} />;
}

function ResponsiveAlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogAction>) {
  const { isMobile } = useResponsiveAlertDialog();

  if (isMobile) {
    return <button type="button" className={cn(buttonVariants(), className)} {...props} />;
  }

  return <AlertDialogAction className={className} {...props} />;
}

function ResponsiveAlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogCancel>) {
  const { isMobile } = useResponsiveAlertDialog();

  if (isMobile) {
    return (
      <DrawerClose asChild>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline" }), className)}
          {...props}
        />
      </DrawerClose>
    );
  }

  return <AlertDialogCancel className={className} {...props} />;
}

export {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogFooter,
  ResponsiveAlertDialogAction,
  ResponsiveAlertDialogCancel,
};
