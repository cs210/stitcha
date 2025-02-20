import { Separator } from "../ui/separator";

interface HeaderContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function HeaderContainer({ children, className }: HeaderContainerProps) {
  return (
    <div className={className}>
      {children}
      <Separator className="mt-2" />
    </div>
  );
}
