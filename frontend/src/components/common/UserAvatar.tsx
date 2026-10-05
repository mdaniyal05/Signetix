import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

interface UserAvatarProps {
  name: string;
  src?: string;
  className?: string;
}

export function UserAvatar({ name, src, className }: UserAvatarProps) {
  return (
    <Avatar className={cn(className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
